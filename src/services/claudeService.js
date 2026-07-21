const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const config = require('../config');

// Dossier ou sont ecrits les fichiers generes par l'IA.
const OUTPUT_DIR = path.join(process.cwd(), 'ia_outputs');

// Le proxy (cc.freemodel.dev) n'autorise QUE le client officiel Claude Code.
// On appelle donc le CLI `claude` en mode non-interactif (claude -p) au lieu du
// SDK, qui serait rejete ("Access Denied ... official Claude Code client only").
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS, 10) || 600000;

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
    const isWin = process.platform === 'win32';
    const command = isWin ? 'cmd.exe' : CLAUDE_BIN;
    const cliArgs = ['-p', question, '--model', config.ANTHROPIC_MODEL];
    const args = isWin ? ['/c', CLAUDE_BIN, ...cliArgs] : cliArgs;

    const child = spawn(command, args, {
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
      if (code === 0 && out) return resolve(out);
      const detail = (stderr.trim() || out || `code de sortie ${code}`);
      reject(new Error(detail));
    });

    // Ferme stdin tout de suite: le CLI ne reste pas en attente d'une entree.
    try { child.stdin.end(); } catch (e) { /* ignore */ }
  });
}

/**
 * Demande a Claude de repondre a `question`, ecrit la reponse dans un fichier
 * nomme d'apres la question, et renvoie { text, filePath, fileName }.
 */
async function askAndSave(question) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const text = await runClaudeCli(question);

  const fileName = `${slugify(question)}.txt`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const header = `Question: ${question}\n${'='.repeat(60)}\n\n`;
  fs.writeFileSync(filePath, header + (text || '(reponse vide)') + '\n', 'utf8');

  return { text, filePath, fileName };
}

module.exports = { askAndSave, slugify, describeError, OUTPUT_DIR };
