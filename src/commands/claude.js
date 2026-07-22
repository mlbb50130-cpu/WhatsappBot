const MessageFormatter = require('../utils/messageFormatter');
const { sendAiResponse } = require('../utils/sendAiResponse');
const ClaudeSession = require('../services/claudeSessionService');

// Slash commands Claude gerees directement par le bot (equivalent CLI).
// /compact → resume l'historique via Claude puis le remplace
// /clear   → efface l'historique
// /history → affiche le nombre de messages en memoire
const SLASH_HANDLERS = {
  async compact(jid, askerJid, sock) {
    const summary = await ClaudeSession.compactSession(jid);
    if (!summary) return '📝 Pas assez d\'historique a compacter (minimum 2 messages).';
    return `✅ Historique compacte:\n\n${summary}`;
  },
  clear(jid) {
    ClaudeSession.clearSession(jid);
    return '🗑️ Historique de conversation efface.';
  },
  history(jid) {
    const { count } = ClaudeSession.getHistoryStatus(jid);
    return count === 0
      ? '📭 Aucun historique de conversation.'
      : `📋 ${count} message(s) dans l\'historique.`;
  },
};

module.exports = {
  name: 'claude',
  aliases: ['ia2', 'demande'],
  description: 'Demande a Claude avec memoire de conversation. Slash commands: /compact /clear /history',
  category: 'BOT',
  usage: '!claude <question>  |  /compact  |  /clear  |  /history',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const askerJid = message.key.participant || jid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));

    const input = args.join(' ').trim();
    if (!input) {
      await send({ text: MessageFormatter.warning('Utilise: !claude <question>  |  /compact  |  /clear  |  /history') });
      return;
    }

    // Detecle les slash commands Claude: /compact, /clear, /history
    if (input.startsWith('/')) {
      const slashName = input.slice(1).split(/\s+/)[0].toLowerCase();
      const handler = SLASH_HANDLERS[slashName];
      if (handler) {
        try {
          // /compact est async (appel CLI), les autres sont instantanes
          const isAsync = slashName === 'compact';
          if (isAsync) {
            await send({ text: MessageFormatter.info('⏳ Compaction en cours...') });
          }
          const result = await handler(jid, askerJid, sock);
          await sock.sendMessage(jid, {
            text: `@${askerJid.split('@')[0]} ${result}`,
            mentions: [askerJid],
          });
        } catch (err) {
          const detail = err?.message || String(err);
          console.error('[Claude slash]', slashName, detail);
          await sock.sendMessage(jid, {
            text: `@${askerJid.split('@')[0]} ❌ Erreur /${slashName}: ${detail}`,
            mentions: [askerJid],
          }).catch(() => null);
        }
        return;
      }
    }

    // Question normale — inclut l'historique de la conversation
    await send({
      text: MessageFormatter.info('🤖 Je reflechis a ta question... ca peut prendre un moment. Je te ping des que c\'est pret.'),
    });
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    try {
      const result = await ClaudeSession.askInSession(jid, input);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      await sendAiResponse({ sock, jid, askerJid, provider: 'Claude', result });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      const detail = error?.message || String(error);
      console.error('[Claude] Erreur:', detail);
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} ❌ Erreur IA: ${detail}`,
        mentions: [askerJid],
      }).catch((sendErr) => {
        console.error('[Claude] Impossible d\'envoyer le message d\'erreur:', sendErr?.message || sendErr);
      });
    }
  },
};
