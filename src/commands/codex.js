const MessageFormatter = require('../utils/messageFormatter');
const { sendAiResponse } = require('../utils/sendAiResponse');
const CodexService = require('../services/codexService');

module.exports = {
  name: 'codex',
  aliases: ['gpt', 'demande-codex'],
  description: 'Demande a Codex et cree un fichier si un format est precise',
  category: 'BOT',
  usage: '!codex <question>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const askerJid = message.key.participant || jid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));
    const question = args.join(' ').trim();

    if (!question) {
      await send({ text: MessageFormatter.warning('Utilise: !codex <question>') });
      return;
    }

    await send({
      text: MessageFormatter.info(
        'Codex reflechit a ta question... cela peut prendre un moment. Je te ping des que c est pret.',
      ),
    });
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    try {
      const result = await CodexService.ask(question);
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
      const rawDetail = error && error.message ? error.message : String(error);
      const detail = rawDetail.length > 3500
        ? `${rawDetail.slice(0, 3500)}\n...(erreur tronquee)`
        : rawDetail;
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} Erreur Codex: ${detail}`,
        mentions: [askerJid],
      });
    }
  },
};
