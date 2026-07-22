const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const config = require('../config');
const {
  buildGenerationPrompt,
  createOutputFileName,
  detectRequestedFormat,
  stripWrappingCodeFence,
} = require('../utils/aiResponseFormat');

// Dossier ou sont ecrits les fichiers generes par l'IA.
const OUTPUT_DIR = path.join(process.cwd(), 'ia_outputs');

// Le proxy (cc.freemodel.dev) n'autorise QUE le client officiel Claude Code.
// On appelle donc le CLI `claude` en mode non-interactif (claude -p) au lieu du
// SDK, qui serait rejete ("Access Denied ... official Claude Code client only").
const CLAUDE_TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS, 10) || 600000;

// Resout la commande a utiliser pour lancer le CLI claude selon la plateforme.
// Sur Windows, npm installe les binaires globaux sous %APPDATA%\npm\claude.cmd
// (inaccessible via PATH si le bot tourne dans un contexte a PATH reduit).
// Sur Linux (Railway Docker), `claude` est installe globalement via npm et
// accessible directement dans PATH.
function getClaudeCommand() {
  if (process.env.CLAUDE_BIN) {
    return process.platform === 'win32'
      ? { bin: 'cmd.exe', prefix: ['/c', process.env.CLAUDE_BIN] }
      : { bin: process.env.CLAUDE_BIN, prefix: [] };
  }
  if (process.platform === 'win32') {
    const appdata = process.env.APPDATA;
    if (appdata) {
      const claudeCmd = path.join(appdata, 'npm', 'claude.cmd');
      if (fs.existsSync(claudeCmd)) {
        return { bin: 'cmd.exe', prefix: ['/c', claudeCmd] };
      }
    }
    return { bin: 'cmd.exe', prefix: ['/c', 'claude'] };
  }
  return { bin: 'claude', prefix: [] };
}

// Transforme la question en nom de fichier sur (sans caracteres interdits).
function slugify(question) {
  const base = String(question || 'reponse')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'reponse';
}

function describeError(err) {
  if (!err) return 'erreur inconnue';
  return err.message ? err.message : String(err);
}

// Appelle le CLI Claude Code en mode print. La question est passee en argument
// (stdin n'est pas transmis a travers cmd.exe). Resout avec le texte, rejette
// avec l'erreur reelle (stderr / code de sortie / timeout).
function runClaudeCli(question) {
  return new Promise((resolve, reject) => {
    const { bin, prefix } = getClaudeCommand();
    const cliArgs = ['-p', question, '--model', config.ANTHROPIC_MODEL];
    const args = [...prefix, ...cliArgs];

    const child = spawn(bin, args, {
      cwd: OUTPUT_DIR,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
        ANTHROPIC_BASE_URL: config.ANTHROPIC_BASE_URL || process.env.ANTHROPIC_BASE_URL,
      },
    });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill('SIGKILL');
      reject(new Error(`Delai depasse (${Math.round(CLAUDE_TIMEOUT_MS / 1000)}s).`));
    }, CLAUDE_TIMEOUT_MS);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(new Error(`Impossible de lancer le CLI claude: ${err.message}`));
    });

    child.on('close', (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      const out = stdout.trim();
      // Prioritise stdout: le CLI peut sortir avec code != 0 pour des
      // avertissements internes tout en ayant produit une reponse valide.
      if (out) {
        if (code !== 0) {
          console.warn(`[Claude] exit=${code} mais stdout present (${out.length} chars) — on utilise la reponse`);
        }
        return resolve(out);
      }
      const detail = stderr.trim() || `code de sortie ${code}`;
      reject(new Error(detail));
    });

    // Ferme stdin tout de suite: le CLI ne reste pas en attente d'une entree.
    try { child.stdin.end(); } catch (e) { /* ignore */ }
  });
}

async function ask(question) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const format = detectRequestedFormat(question);
  const rawText = await runClaudeCli(buildGenerationPrompt(question, format));
  const text = format ? stripWrappingCodeFence(rawText) : rawText;

  if (!format) {
    return { text, filePath: null, fileName: null, mimetype: null };
  }

  const fileName = createOutputFileName(question, format, slugify);
  const filePath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, text, 'utf8');

  return { text, filePath, fileName, mimetype: format.mimetype };
}

module.exports = {
  ask,
  askAndSave: ask,
  runClaudeCli,
  slugify,
  describeError,
  OUTPUT_DIR,
};
