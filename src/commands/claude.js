const fs = require('fs');
const MessageFormatter = require('../utils/messageFormatter');
const ClaudeService = require('../services/claudeService');

module.exports = {
  name: 'claude',
  aliases: ['ia2', 'demande'],
  description: 'Demande a Claude (IA) et enregistre la reponse dans un fichier',
  category: 'BOT',
  usage: '!claude <question>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));

    const question = args.join(' ').trim();
    if (!question) {
      await send({ text: MessageFormatter.warning('Utilise: !claude <question>') });
      return;
    }

    try {
      await sock.sendPresenceUpdate('composing', jid).catch(() => null);
      const { text, filePath, fileName } = await ClaudeService.askAndSave(question);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      // Apercu texte (WhatsApp limite la taille des messages)
      const preview = text.length > 3000 ? `${text.slice(0, 3000)}\n...\n(reponse complete dans le fichier)` : text;
      await send({ text: preview || '(reponse vide)' });

      // Envoi du fichier nomme d'apres la question
      await sock.sendMessage(jid, {
        document: fs.readFileSync(filePath),
        fileName,
        mimetype: 'text/plain',
        caption: `📄 ${fileName}`,
      });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      const detail = error && error.message ? error.message : String(error);
      await send({ text: MessageFormatter.error(`Erreur IA: ${detail}`) });
    }
  },
};
