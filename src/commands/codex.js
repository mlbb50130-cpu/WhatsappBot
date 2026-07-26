const MessageFormatter = require('../utils/messageFormatter');
const { sendAiError, sendAiResponse } = require('../utils/sendAiResponse');
const { readTextAttachment } = require('../utils/aiTextAttachment');
const CodexSession = require('../services/codexSessionService');

// Slash commands de session, identiques a celles de Claude mais sur
// l'historique Codex, qui est distinct.
const SLASH_HANDLERS = {
  async compact(sessionKey) {
    const summary = await CodexSession.compactSession(sessionKey);
    if (!summary) return 'Pas assez d historique a compacter (minimum 2 messages).';
    return `Ton historique Codex a ete compacte:\n\n${summary}`;
  },
  clear(sessionKey) {
    CodexSession.clearSession(sessionKey);
    return 'Ton historique Codex a ete efface.';
  },
  history(sessionKey) {
    const { count } = CodexSession.getHistoryStatus(sessionKey);
    return count === 0
      ? 'Tu n as aucun historique Codex.'
      : `${count} message(s) dans ton historique Codex.`;
  },
};

module.exports = {
  name: 'codex',
  aliases: ['gpt', 'demande-codex'],
  description: 'Demande a Codex avec memoire de conversation. Slash commands: /compact /clear /history',
  category: 'BOT',
  usage: '!codex <question> [document joint]  |  !codex /compact  |  /clear  |  /history',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const askerJid = message.key.participant || jid;
    // Chaque utilisateur a sa propre session, meme dans un groupe partage.
    const sessionKey = CodexSession.buildSessionKey(jid, askerJid);
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));
    const question = args.join(' ').trim();

    // Slash commands: traitees avant la lecture d'une piece jointe.
    if (question.startsWith('/')) {
      const slashName = question.slice(1).split(/\s+/)[0].toLowerCase();
      const handler = SLASH_HANDLERS[slashName];
      if (handler) {
        try {
          if (slashName === 'compact') {
            await send({ text: MessageFormatter.info('Compaction en cours...') });
          }
          const result = await handler(sessionKey);
          await sock.sendMessage(jid, {
            text: `@${askerJid.split('@')[0]} ${result}`,
            mentions: [askerJid],
          });
        } catch (error) {
          await sendAiError({ sock, jid, askerJid, provider: 'Codex', error });
        }
        return;
      }
    }

    let attachment = null;
    try {
      attachment = await readTextAttachment(message);
    } catch (error) {
      await sendAiError({ sock, jid, askerJid, provider: 'Codex', error });
      return;
    }

    if (!question && !attachment) {
      await send({ text: MessageFormatter.warning('Utilise: !codex <question> ou joins un fichier texte/code.') });
      return;
    }

    const effectiveQuestion = question || 'Analyse et explique le fichier joint.';

    await send({
      text: MessageFormatter.info(
        attachment
          ? `Codex lit ${attachment.fileName} et prepare la reponse...`
          : 'Codex reflechit a ta question... cela peut prendre un moment. Je te ping des que c est pret.',
      ),
    });
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    try {
      const result = await CodexSession.askInSession(sessionKey, effectiveQuestion, { attachment });
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      await sendAiResponse({
        sock,
        jid,
        askerJid,
        provider: 'Codex',
        result,
      });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      await sendAiError({ sock, jid, askerJid, provider: 'Codex', error });
    }
  },
};
