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
      const { text, filePath, fileName } = await ClaudeService.askAndSave(question);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      // Ping le demandeur + apercu (WhatsApp limite la taille des messages)
      const preview = text.length > 3000 ? `${text.slice(0, 3000)}\n...\n(reponse complete dans le fichier)` : text;
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} ✅ Voici ta reponse:\n\n${preview || '(reponse vide)'}`,
        mentions: [askerJid],
      });

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
      // Ping le demandeur avec l'erreur reelle
      await sock.sendMessage(jid, {
        text: `@${askerJid.split('@')[0]} ❌ Erreur IA: ${detail}`,
        mentions: [askerJid],
      });
    }
  },
};
