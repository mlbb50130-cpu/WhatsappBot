// Fabrique de sessions de conversation partagee par les services IA.
// Chaque service (Claude, Codex) cree son propre magasin isole : une question
// posee a Claude n'apparait pas dans l'historique de Codex et inversement.

const DEFAULTS = {
  maxMessages: 20, // 10 echanges avant eviction des plus anciens
  ttlMs: 2 * 60 * 60 * 1000, // session oubliee apres 2h d'inactivite
  maxSessions: 500, // garde-fou memoire
};

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

// Slash commands de session supportees par le bot (equivalent CLI).
const SESSION_SLASH_COMMANDS = new Set(['compact', 'clear', 'history']);

function isSessionSlashCommand(name) {
  return SESSION_SLASH_COMMANDS.has(String(name).toLowerCase());
}

/**
 * Cree un magasin de sessions.
 * @param {(prompt: string) => Promise<string>} runPrompt appelle l'IA sous-jacente
 */
function createSessionStore({ runPrompt, ...options } = {}) {
  const { maxMessages, ttlMs, maxSessions } = { ...DEFAULTS, ...options };
  const sessions = new Map();

  // Supprime les sessions inactives, puis les plus anciennes si le cap est depasse.
  function cleanup() {
    const now = Date.now();
    for (const [key, session] of sessions) {
      if (now - session.lastUsed > ttlMs) sessions.delete(key);
    }

    while (sessions.size > maxSessions) {
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [key, session] of sessions) {
        if (session.lastUsed < oldestTime) {
          oldestTime = session.lastUsed;
          oldestKey = key;
        }
      }
      if (!oldestKey) break;
      sessions.delete(oldestKey);
    }
  }

  function getHistory(key) {
    return sessions.get(key)?.messages || [];
  }

  function setHistory(key, messages) {
    sessions.set(key, { messages, lastUsed: Date.now() });
    cleanup();
  }

  function render(messages) {
    return messages
      .map((m) => {
        if (m.role === 'system') return m.text;
        return `[${m.role === 'user' ? 'Utilisateur' : 'Assistant'}]: ${m.text}`;
      })
      .join('\n\n');
  }

  /** Enregistre un echange question/reponse dans la session. */
  function pushExchange(key, question, answer) {
    const messages = getHistory(key);
    messages.push({ role: 'user', text: String(question || '').slice(0, 600) });
    messages.push({ role: 'assistant', text: String(answer || '').slice(0, 600) });
    while (messages.length > maxMessages) messages.shift();
    setHistory(key, messages);
  }

  /** Prefixe la question par l'historique, ou la renvoie telle quelle si vide. */
  function buildContextualPrompt(key, question) {
    const history = getHistory(key);
    if (history.length === 0) return question;

    return [
      'Voici notre conversation precedente:',
      render(history),
      '',
      `[Utilisateur]: ${question}`,
      '',
      'Reponds a ce dernier message en tenant compte du contexte.',
    ].join('\n');
  }

  /**
   * Resume l'historique puis le remplace par ce resume (equivalent du /compact).
   * Retourne le resume, ou null si l'historique est trop court.
   */
  async function compactSession(key) {
    const history = getHistory(key);
    if (history.length < 2) return null;

    const summary = await runPrompt([
      'Fais un resume concis de cette conversation (3 a 5 phrases max).',
      'Garde uniquement les points essentiels et le contexte important.',
      'Commence directement par le resume, sans phrase d\'introduction.',
      '',
      render(history),
    ].join('\n'));

    setHistory(key, [{ role: 'system', text: `[Contexte compacte]: ${summary}` }]);
    return summary;
  }

  /** Efface la session (equivalent du /clear). */
  function clearSession(key) {
    sessions.delete(key);
  }

  /** Nombre de messages memorises pour cette session. */
  function getHistoryStatus(key) {
    return { count: getHistory(key).length };
  }

  return {
    buildContextualPrompt,
    pushExchange,
    compactSession,
    clearSession,
    getHistoryStatus,
  };
}

module.exports = {
  createSessionStore,
  buildSessionKey,
  isSessionSlashCommand,
};
