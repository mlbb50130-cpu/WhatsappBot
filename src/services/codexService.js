const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ quiet: true });

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'ia_outputs');
const CODEX_HOME = process.env.KASSIM_CODEX_HOME
  || path.join(OUTPUT_DIR, '.codex-home');
const WORK_DIR = path.join(OUTPUT_DIR, '.codex-work');

const CODEX_API_KEY = process.env.CODEX_API_KEY || '';
const CODEX_BASE_URL = process.env.CODEX_BASE_URL || 'https://api.freemodel.dev';
const CODEX_MODEL = process.env.CODEX_MODEL || 'gpt-5.5';
const CODEX_REASONING_EFFORT = process.env.CODEX_REASONING_EFFORT || 'xhigh';
const configuredTimeout = Number.parseInt(process.env.CODEX_TIMEOUT_MS, 10);
const CODEX_TIMEOUT_MS = Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : 600000;
const MAX_CAPTURE_LENGTH = 2 * 1024 * 1024;

function slugify(question) {
  const base = String(question || 'reponse')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'reponse';
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function writePrivateFile(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
  if (process.platform !== 'win32') fs.chmodSync(filePath, 0o600);
}

function prepareRuntime() {
  if (!CODEX_API_KEY.trim()) {
    throw new Error(
      'Cle API Codex absente. Configure CODEX_API_KEY sur Railway.',
    );
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(CODEX_HOME, { recursive: true });
  fs.mkdirSync(WORK_DIR, { recursive: true });

  const configToml = [
    'model_provider = "freemodel"',
    `model = ${tomlString(CODEX_MODEL)}`,
    `model_reasoning_effort = ${tomlString(CODEX_REASONING_EFFORT)}`,
    'disable_response_storage = true',
    'preferred_auth_method = "apikey"',
    '',
    '[model_providers.freemodel]',
    'name = "freemodel"',
    `base_url = ${tomlString(CODEX_BASE_URL)}`,
    'wire_api = "responses"',
    '',
  ].join('\n');

  writePrivateFile(path.join(CODEX_HOME, 'config.toml'), configToml);
  writePrivateFile(
    path.join(CODEX_HOME, 'auth.json'),
    `${JSON.stringify({ OPENAI_API_KEY: CODEX_API_KEY }, null, 2)}\n`,
  );
}

function resolveCodexLauncher() {
  const configuredBin = process.env.CODEX_BIN;
  if (configuredBin) {
    if (configuredBin.endsWith('.js')) {
      return { command: process.execPath, prefixArgs: [configuredBin] };
    }
    if (process.platform !== 'win32' || configuredBin.endsWith('.exe')) {
      return { command: configuredBin, prefixArgs: [] };
    }
    return {
      command: process.env.ComSpec || 'cmd.exe',
      prefixArgs: ['/d', '/s', '/c', configuredBin],
    };
  }

  try {
    const packageRoot = path.dirname(require.resolve('@openai/codex/package.json'));
    const entryPoint = path.join(packageRoot, 'bin', 'codex.js');
    if (fs.existsSync(entryPoint)) {
      return { command: process.execPath, prefixArgs: [entryPoint] };
    }
  } catch (error) {
    // The explicit error below is clearer than Node's module resolution error.
  }

  if (process.platform === 'win32') {
    return {
      command: process.env.ComSpec || 'cmd.exe',
      prefixArgs: ['/d', '/s', '/c', 'codex'],
    };
  }
  return { command: 'codex', prefixArgs: [] };
}

function appendCaptured(current, chunk) {
  if (current.length >= MAX_CAPTURE_LENGTH) return current;
  return (current + chunk.toString()).slice(0, MAX_CAPTURE_LENGTH);
}

function createCodexEnvironment() {
  const env = { ...process.env };

  // Do not leak state from a parent Codex session into the bot subprocess.
  for (const name of Object.keys(env)) {
    if (name.startsWith('CODEX_')) delete env[name];
  }

  return {
    ...env,
    CODEX_HOME,
    CODEX_API_KEY,
    OPENAI_API_KEY: CODEX_API_KEY,
    NO_COLOR: '1',
  };
}

function runCodexCli(question) {
  prepareRuntime();

  return new Promise((resolve, reject) => {
    const launcher = resolveCodexLauncher();
    const prompt = [
      'Reponds directement et clairement a la question suivante.',
      'N execute aucune commande, ne lis aucun fichier local et ne modifie rien.',
      'Utilise la meme langue que la question.',
      '',
      `Question: ${question}`,
    ].join('\n');
    const cliArgs = [
      'exec',
      '--ephemeral',
      '--sandbox',
      'read-only',
      '--skip-git-repo-check',
      '--ignore-rules',
      '--color',
      'never',
      '--disable',
      'shell_tool',
      '--disable',
      'apps',
      '--disable',
      'hooks',
      '--disable',
      'multi_agent',
      '--disable',
      'remote_plugin',
      '-c',
      'approval_policy=never',
      '-c',
      'web_search=disabled',
      '-c',
      'shell_environment_policy.inherit=none',
      prompt,
    ];

    const child = spawn(launcher.command, [...launcher.prefixArgs, ...cliArgs], {
      cwd: WORK_DIR,
      windowsHide: true,
      env: createCodexEnvironment(),
    });

    let stdout = '';
    let stderr = '';
    let finished = false;
    let forceKillTimer = null;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill('SIGTERM');
      forceKillTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
      const lastCliMessage = stderr.trim().slice(-1500);
      const suffix = lastCliMessage ? ` Dernier message CLI: ${lastCliMessage}` : '';
      reject(new Error(
        `Delai Codex depasse (${Math.round(CODEX_TIMEOUT_MS / 1000)}s) avec ${CODEX_MODEL}.${suffix}`,
      ));
    }, CODEX_TIMEOUT_MS);

    child.stdout.on('data', (data) => {
      stdout = appendCaptured(stdout, data);
    });
    child.stderr.on('data', (data) => {
      stderr = appendCaptured(stderr, data);
    });

    child.on('error', (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(new Error(
        `Impossible de lancer le CLI Codex: ${error.message}. Verifie que @openai/codex est installe.`,
      ));
    });

    child.on('close', (code) => {
      if (forceKillTimer) clearTimeout(forceKillTimer);
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      const output = stdout.trim();
      if (code === 0 && output) {
        resolve(output);
        return;
      }

      const detail = (stderr.trim() || output || `code de sortie ${code}`).slice(-6000);
      reject(new Error(detail));
    });

    try {
      child.stdin.end();
    } catch (error) {
      // stdin may already be closed by the native launcher.
    }
  });
}

async function askAndSave(question) {
  const text = await runCodexCli(question);
  const fileName = `${slugify(question)}.txt`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const header = `Question: ${question}\n${'='.repeat(60)}\n\n`;

  fs.writeFileSync(filePath, `${header}${text || '(reponse vide)'}\n`, 'utf8');
  return { text, filePath, fileName };
}

module.exports = {
  askAndSave,
  slugify,
  OUTPUT_DIR,
  CODEX_HOME,
};
