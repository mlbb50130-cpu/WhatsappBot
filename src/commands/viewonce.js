const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'viewonce',
  aliases: ['vo', 'vonce'],
  description: 'Envoyer une vidéo en vue unique (répondre à une vidéo)',
  category: 'FUN',
  usage: '!viewonce (en réponse à une vidéo)',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message) {
    const senderJid = message.key.remoteJid;

    try {
      let mediaMessage = null;
      let mediaType = null;

      // Cas 1: vidéo en réponse
      if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.videoMessage) {
          mediaMessage = quotedMsg.videoMessage;
          mediaType = 'video';
        }
      }

      // Cas 2: vidéo avec légende (commande dans la caption)
      if (!mediaMessage && message.message?.videoMessage) {
        mediaMessage = message.message.videoMessage;
        mediaType = 'video';
      }

      if (!mediaMessage) {
        return sock.sendMessage(senderJid, {
          text: '❌ Réponds à une vidéo avec !viewonce pour l’envoyer en vue unique.'
        }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(mediaMessage, mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer || buffer.length === 0) {
        return sock.sendMessage(senderJid, {
          text: '❌ Impossible de récupérer la vidéo.'
        }, { quoted: message });
      }

      await sock.sendMessage(senderJid, {
        video: buffer,
        mimetype: mediaMessage.mimetype || 'video/mp4',
        viewOnce: true
      }, { quoted: message });
    } catch (error) {
      console.error('[VIEWONCE] Error:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de l’envoi en vue unique.'
      }, { quoted: message });
    }
  }
};
