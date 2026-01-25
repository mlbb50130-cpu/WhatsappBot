const sharp = require('sharp');
const { Sticker } = require('wa-sticker-formatter');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'UTILITY',
  cooldown: 5,
  description: 'Convertir une image en sticker WhatsApp (WEBP 512x512)',
  usage: '!sticker [en réponse à une image]',

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    
    try {
      let imageBuffer = null;
      let mediaType = null;

      // Cas 1: Image en réponse
      if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quotedMsg.imageMessage) {
          mediaType = 'image';
          try {
            imageBuffer = await downloadMedia(sock, quotedMsg.imageMessage);
          } catch (downloadErr) {
            console.error('[STICKER] Erreur téléchargement réponse:', downloadErr.message);
            return sock.sendMessage(senderJid, {
              text: '❌ Impossible de télécharger l\'image. Réessaie.'
            }, { quoted: message });
          }
        } else if (quotedMsg.videoMessage) {
          mediaType = 'video';
          try {
            imageBuffer = await downloadMedia(sock, quotedMsg.videoMessage);
          } catch (downloadErr) {
            console.error('[STICKER] Erreur téléchargement vidéo:', downloadErr.message);
            return sock.sendMessage(senderJid, {
              text: '❌ Impossible de télécharger la vidéo. Réessaie.'
            }, { quoted: message });
          }
        } else {
          return sock.sendMessage(senderJid, {
            text: '❌ Veuillez répondre à une image ou une vidéo valide'
          }, { quoted: message });
        }
      }
      // Cas 2: Image directement attachée
      else if (message.message?.imageMessage) {
        mediaType = 'image';
        try {
          imageBuffer = await downloadMedia(sock, message.message.imageMessage);
        } catch (downloadErr) {
          console.error('[STICKER] Erreur téléchargement image directe:', downloadErr.message);
          return sock.sendMessage(senderJid, {
            text: '❌ Impossible de télécharger l\'image. Réessaie.'
          }, { quoted: message });
        }
      }
      // Cas 3: Vidéo directement attachée
      else if (message.message?.videoMessage) {
        mediaType = 'video';
        try {
          imageBuffer = await downloadMedia(sock, message.message.videoMessage);
        } catch (downloadErr) {
          console.error('[STICKER] Erreur téléchargement vidéo directe:', downloadErr.message);
          return sock.sendMessage(senderJid, {
            text: '❌ Impossible de télécharger la vidéo. Réessaie.'
          }, { quoted: message });
        }
      }
      else {
        return sock.sendMessage(senderJid, {
          text: '❌ Usage: Réponds à une image/vidéo avec `!sticker`\n\nOu envoie une image avec le message'
        }, { quoted: message });
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        return sock.sendMessage(senderJid, {
          text: '❌ Le fichier téléchargé est vide. Réessaie.'
        }, { quoted: message });
      }

      // Redimensionner l'image à 512x512 avec sharp
      let processedBuffer = null;
      try {
        processedBuffer = await sharp(imageBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 50 })
          .toBuffer();
      } catch (resizeErr) {
        console.error('[STICKER] Erreur redimensionnement:', resizeErr.message);
        return sock.sendMessage(senderJid, {
          text: '❌ Impossible de traiter l\'image. Format non supporté.'
        }, { quoted: message });
      }

      // Créer le sticker avec wa-sticker-formatter
      let stickerBuffer = null;
      try {
        const sticker = new Sticker(processedBuffer, {
          pack: 'TetsuBot',
          author: 'Bot',
          type: 'full',
          quality: 50,
          background: true
        });
        stickerBuffer = await sticker.toBuffer();
      } catch (stickerErr) {
        console.error('[STICKER] Erreur création sticker:', stickerErr.message);
        return sock.sendMessage(senderJid, {
          text: '❌ Erreur lors de la création du sticker. Réessaie.'
        }, { quoted: message });
      }

      // Vérifier la taille du sticker
      if (stickerBuffer.length > 100000) {
        return sock.sendMessage(senderJid, {
          text: '❌ Le sticker est trop volumineux (> 100 Ko). Réessaie avec une image plus simple.'
        }, { quoted: message });
      }

      // Envoyer le sticker
      try {
        await sock.sendMessage(senderJid, {
          sticker: stickerBuffer
        });

        // Message de succès
        await sock.sendMessage(senderJid, {
          text: '✅ Sticker créé avec succès! 🎨'
        }, { quoted: message });
      } catch (sendErr) {
        console.error('[STICKER] Erreur envoi sticker:', sendErr.message);
        return sock.sendMessage(senderJid, {
          text: '❌ Erreur lors de l\'envoi du sticker. Réessaie.'
        }, { quoted: message });
      }

    } catch (error) {
      console.error('[STICKER] Erreur générale:', error);
      
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur inattendue: ${error.message}`
      }, { quoted: message });
    }
  }
};

/**
 * Télécharge un media depuis WhatsApp
 * @param {*} sock - Socket Baileys
 * @param {*} mediaMessage - Message média
 * @returns {Promise<Buffer>} Buffer du média
 */
async function downloadMedia(sock, mediaMessage) {
  try {
    const stream = await sock.downloadMediaMessage(mediaMessage);
    
    if (Buffer.isBuffer(stream)) {
      return stream;
    }

    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Téléchargement échoué: ${error.message}`);
  }
}
