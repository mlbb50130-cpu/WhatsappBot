const MessageFormatter = require('../utils/messageFormatter');
const { sendAiResponse } = require('../utils/sendAiResponse');
const ClaudeService = require('../services/claudeService');

module.exports = {
  name: 'claude',
  aliases: ['ia2', 'demande'],
  description: 'Demande a Claude et cree un fichier si un format est precise',
  category: 'BOT',
  usage: '!claude <question>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const askerJid = message.key.participant || jid; // qui a pose la question (ping)
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));

    const question = args.join(' ').trim();
    if (!question) {
      await send({ text: MessageFormatter.warning('Utilise: !claude <question>') });
      return;
    }

    // Message d'attente immediat: l'IA peut prendre du temps.
    await send({
      text: MessageFormatter.info('🤖 Je reflechis a ta question... ca peut prendre un moment. Je te ping des que c\'est pret.'),
    });
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    try {
      const result = await ClaudeService.ask(question);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      await sendAiResponse({
        sock,
        jid,
        askerJid,
        provider: 'Claude',
        result,
      });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      const detail = error && error.message ? error.message : String(error);
      // Ping le demandeur avec l'erreur reelle
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} ❌ Erreur IA: ${detail}`,
        mentions: [askerJid],
      });
    }
  },
};
