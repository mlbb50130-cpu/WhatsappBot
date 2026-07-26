const fs = require('fs');
const path = require('path');
const { runClaudeCli, slugify, resolveOutputDir } = require('./claudeService');
const {
  detectRequestedFormat,
  buildGenerationPrompt,
  createOutputFileName,
  stripWrappingCodeFence,
} = require('../utils/aiResponseFormat');
const {
  createSessionStore,
  buildSessionKey,
  isSessionSlashCommand,
} = require('../utils/aiSessionStore');

const store = createSessionStore({ runPrompt: runClaudeCli });

/**
 * Pose une question a Claude en incluant l'historique de la session.
 * Pour les demandes de generation de fichier (code, html, etc.) l'historique
 * n'est pas inclus car la generation est toujours stateless.
 */
async function askInSession(key, question) {
  // Detection faite sur la question brute: l'historique pourrait contenir des
  // mots-cles de format et declencher un faux positif.
  const format = detectRequestedFormat(question);

  if (format) {
    const rawText = await runClaudeCli(buildGenerationPrompt(question, format));
    const text = stripWrappingCodeFence(rawText);
    const fileName = createOutputFileName(question, format, slugify);
    // Resolu ici seulement: une reponse texte n'a besoin d'aucun fichier.
    const filePath = path.join(resolveOutputDir(), fileName);
    fs.writeFileSync(filePath, text, 'utf8');
    return { text, filePath, fileName, mimetype: format.mimetype };
  }

  const text = await runClaudeCli(store.buildContextualPrompt(key, question));
  store.pushExchange(key, question, text);

  return { text, filePath: null, fileName: null, mimetype: null };
}

module.exports = {
  buildSessionKey,
  askInSession,
  compactSession: store.compactSession,
  clearSession: store.clearSession,
  getHistoryStatus: store.getHistoryStatus,
  isClaudeSlashCommand: isSessionSlashCommand,
};
