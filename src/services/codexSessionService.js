const CodexService = require('./codexService');
const { detectRequestedFormat } = require('../utils/aiResponseFormat');
const {
  createSessionStore,
  buildSessionKey,
  isSessionSlashCommand,
} = require('../utils/aiSessionStore');

// `detectionText: 'resume'` empeche la compaction de declencher la generation
// d'un fichier si l'historique contient des mots-cles de format.
const store = createSessionStore({
  runPrompt: async (prompt) => {
    const { text } = await CodexService.ask(prompt, { detectionText: 'resume' });
    return text;
  },
});

/**
 * Pose une question a Codex en incluant l'historique de la session.
 * Comme pour Claude, la generation de fichier reste stateless.
 */
async function askInSession(key, question, { attachment = null } = {}) {
  // Detection sur la question brute (+ nom du fichier joint), pas sur
  // l'historique, qui provoquerait de faux positifs.
  const { detectionText } = CodexService.buildCodexInput(question, attachment);
  const format = detectRequestedFormat(detectionText);

  if (format) {
    return CodexService.ask(question, { attachment });
  }

  const prompt = store.buildContextualPrompt(key, question);
  const result = await CodexService.ask(prompt, { attachment, detectionText });
  store.pushExchange(key, question, result.text);

  return result;
}

module.exports = {
  buildSessionKey,
  askInSession,
  compactSession: store.compactSession,
  clearSession: store.clearSession,
  getHistoryStatus: store.getHistoryStatus,
  isCodexSlashCommand: isSessionSlashCommand,
};
