const fs = require('fs');
const path = require('path');
const { runClaudeCli, slugify, OUTPUT_DIR } = require('./claudeService');
const {
  detectRequestedFormat,
  buildGenerationPrompt,
  createOutputFileName,
  stripWrappingCodeFence,
} = require('../utils/aiResponseFormat');

// Historique de conversation par JID (en memoire, ephemere).
// Chaque entree: { role: 'user'|'assistant'|'system', text: string }
const HISTORY = new Map();
const MAX_MESSAGES = 20; // 10 echanges max avant compaction automatique

function getHistory(jid) {
  return HISTORY.get(jid) || [];
}

function pushHistory(jid, role, text) {
  const h = getHistory(jid);
  h.push({ role, text: String(text || '').slice(0, 600) });
  while (h.length > MAX_MESSAGES) h.shift();
  HISTORY.set(jid, h);
}

// Construit le prompt en incluant l'historique de la conversation.
// Utilise l'historique uniquement pour les questions conversationnelles
// (pas pour les demandes de generation de fichier).
function buildContextualPrompt(jid, question) {
  const history = getHistory(jid);
  if (history.length === 0) return question;

  const historyBlock = history
    .map(m => {
      if (m.role === 'system') return m.text;
      return `[${m.role === 'user' ? 'Utilisateur' : 'Claude'}]: ${m.text}`;
    })
    .join('\n\n');

  return [
    'Voici notre conversation precedente:',
    historyBlock,
    '',
    `[Utilisateur]: ${question}`,
    '',
    'Reponds a ce dernier message en tenant compte du contexte.',
  ].join('\n');
}

/**
 * Pose une question a Claude en incluant l'historique de la conversation.
 * Pour les demandes de generation de fichier (code, html, etc.) l'historique
 * n'est pas inclus car la generation est toujours stateless.
 */
async function askInSession(jid, question) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const format = detectRequestedFormat(question);

  if (format) {
    // Generation de fichier : stateless, pas d'historique
    const prompt = buildGenerationPrompt(question, format);
    const rawText = await runClaudeCli(prompt);
    const text = stripWrappingCodeFence(rawText);
    const fileName = createOutputFileName(question, format, slugify);
    const filePath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(filePath, text, 'utf8');
    return { text, filePath, fileName, mimetype: format.mimetype };
  }

  // Question conversationnelle : inclure l'historique
  const prompt = buildContextualPrompt(jid, question);
  const text = await runClaudeCli(prompt);

  pushHistory(jid, 'user', question);
  pushHistory(jid, 'assistant', text);

  return { text, filePath: null, fileName: null, mimetype: null };
}

/**
 * Compacte l'historique : demande a Claude de le resumer, puis remplace
 * l'historique par ce resume (equivalent du /compact du CLI).
 * Retourne le texte du resume, ou null si l'historique est trop court.
 */
async function compactSession(jid) {
  const history = getHistory(jid);
  if (history.length < 2) return null;

  const historyBlock = history
    .map(m => {
      if (m.role === 'system') return m.text;
      return `[${m.role === 'user' ? 'Utilisateur' : 'Claude'}]: ${m.text}`;
    })
    .join('\n\n');

  const summaryPrompt = [
    'Fais un resume concis de cette conversation (3 a 5 phrases max).',
    'Garde uniquement les points essentiels et le contexte important.',
    'Commence directement par le resume, sans phrase d\'introduction.',
    '',
    historyBlock,
  ].join('\n');

  const summary = await runClaudeCli(summaryPrompt);

  // Remplace l'historique par le resume compacte
  HISTORY.set(jid, [{ role: 'system', text: `[Contexte compacte]: ${summary}` }]);

  return summary;
}

/** Efface l'historique (equivalent du /clear du CLI). */
function clearSession(jid) {
  HISTORY.delete(jid);
}

/** Retourne le nombre de messages dans l'historique. */
function getHistoryStatus(jid) {
  return { count: getHistory(jid).length };
}

// Slash commands Claude supportees par le bot
const CLAUDE_SLASH_COMMANDS = new Set(['compact', 'clear', 'history']);

function isClaudeSlashCommand(name) {
  return CLAUDE_SLASH_COMMANDS.has(String(name).toLowerCase());
}

module.exports = {
  askInSession,
  compactSession,
  clearSession,
  getHistoryStatus,
  isClaudeSlashCommand,
};
