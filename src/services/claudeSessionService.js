const fs = require('fs');
const path = require('path');
const { runClaudeCli, slugify, OUTPUT_DIR } = require('./claudeService');
const {
  detectRequestedFormat,
  buildGenerationPrompt,
  createOutputFileName,
  stripWrappingCodeFence,
} = require('../utils/aiResponseFormat');

// Sessions de conversation (en memoire, ephemere).
// Cle = identifiant de session (voir buildSessionKey), valeur = { messages, lastUsed }
// Chaque message: { role: 'user'|'assistant'|'system', text: string }
const SESSIONS = new Map();
const MAX_MESSAGES = 20; // 10 echanges max avant compaction automatique
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // session oubliee apres 2h d'inactivite
const MAX_SESSIONS = 500; // garde-fou memoire

/**
 * Construit la cle de session.
 * - En groupe : une session distincte par membre (chacun sa memoire).
 * - En prive  : une session par contact.
 */
function buildSessionKey(remoteJid, participantJid) {
  if (!remoteJid) return participantJid || 'inconnu';
  if (remoteJid.endsWith('@g.us')) {
    return `${remoteJid}|${participantJid || remoteJid}`;
  }
  return remoteJid;
}

// Supprime les sessions inactives, puis les plus anciennes si le cap est depasse.
function cleanupSessions() {
  const now = Date.now();
  for (const [key, session] of SESSIONS) {
    if (now - session.lastUsed > SESSION_TTL_MS) SESSIONS.delete(key);
  }

  while (SESSIONS.size > MAX_SESSIONS) {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [key, session] of SESSIONS) {
      if (session.lastUsed < oldestTime) {
        oldestTime = session.lastUsed;
        oldestKey = key;
      }
    }
    if (!oldestKey) break;
    SESSIONS.delete(oldestKey);
  }
}

function getHistory(key) {
  return SESSIONS.get(key)?.messages || [];
}

function setHistory(key, messages) {
  SESSIONS.set(key, { messages, lastUsed: Date.now() });
  cleanupSessions();
}

function pushHistory(key, role, text) {
  const messages = getHistory(key);
  messages.push({ role, text: String(text || '').slice(0, 600) });
  while (messages.length > MAX_MESSAGES) messages.shift();
  setHistory(key, messages);
}

function renderHistory(messages) {
  return messages
    .map(m => {
      if (m.role === 'system') return m.text;
      return `[${m.role === 'user' ? 'Utilisateur' : 'Claude'}]: ${m.text}`;
    })
    .join('\n\n');
}

// Construit le prompt en incluant l'historique de la conversation.
// Utilise l'historique uniquement pour les questions conversationnelles
// (pas pour les demandes de generation de fichier).
function buildContextualPrompt(key, question) {
  const history = getHistory(key);
  if (history.length === 0) return question;

  return [
    'Voici notre conversation precedente:',
    renderHistory(history),
    '',
    `[Utilisateur]: ${question}`,
    '',
    'Reponds a ce dernier message en tenant compte du contexte.',
  ].join('\n');
}

/**
 * Pose une question a Claude en incluant l'historique de la session.
 * Pour les demandes de generation de fichier (code, html, etc.) l'historique
 * n'est pas inclus car la generation est toujours stateless.
 */
async function askInSession(key, question) {
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
  const prompt = buildContextualPrompt(key, question);
  const text = await runClaudeCli(prompt);

  pushHistory(key, 'user', question);
  pushHistory(key, 'assistant', text);

  return { text, filePath: null, fileName: null, mimetype: null };
}

/**
 * Compacte l'historique : demande a Claude de le resumer, puis remplace
 * l'historique par ce resume (equivalent du /compact du CLI).
 * Retourne le texte du resume, ou null si l'historique est trop court.
 */
async function compactSession(key) {
  const history = getHistory(key);
  if (history.length < 2) return null;

  const summaryPrompt = [
    'Fais un resume concis de cette conversation (3 a 5 phrases max).',
    'Garde uniquement les points essentiels et le contexte important.',
    'Commence directement par le resume, sans phrase d\'introduction.',
    '',
    renderHistory(history),
  ].join('\n');

  const summary = await runClaudeCli(summaryPrompt);

  // Remplace l'historique par le resume compacte
  setHistory(key, [{ role: 'system', text: `[Contexte compacte]: ${summary}` }]);

  return summary;
}

/** Efface la session (equivalent du /clear du CLI). */
function clearSession(key) {
  SESSIONS.delete(key);
}

/** Retourne le nombre de messages dans la session. */
function getHistoryStatus(key) {
  return { count: getHistory(key).length };
}

// Slash commands Claude supportees par le bot
const CLAUDE_SLASH_COMMANDS = new Set(['compact', 'clear', 'history']);

function isClaudeSlashCommand(name) {
  return CLAUDE_SLASH_COMMANDS.has(String(name).toLowerCase());
}

module.exports = {
  buildSessionKey,
  askInSession,
  compactSession,
  clearSession,
  getHistoryStatus,
  isClaudeSlashCommand,
};
