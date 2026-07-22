const fs = require('fs');
const MessageFormatter = require('../utils/messageFormatter');
const CodexService = require('../services/codexService');

module.exports = {
  name: 'codex',
  aliases: ['gpt', 'demande-codex'],
  description: 'Demande a Codex et enregistre la reponse dans un fichier',
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
      const { text, filePath, fileName } = await CodexService.askAndSave(question);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      const preview = text.length > 3000
        ? `${text.slice(0, 3000)}\n...\n(reponse complete dans le fichier)`
        : text;
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} Voici la reponse de Codex:\n\n${preview || '(reponse vide)'}`,
        mentions: [askerJid],
      });

      await sock.sendMessage(jid, {
        document: fs.readFileSync(filePath),
        fileName,
        mimetype: 'text/plain',
        caption: `Codex - ${fileName}`,
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
