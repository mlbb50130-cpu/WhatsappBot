const sharp = require('sharp');
const { Sticker } = require('wa-sticker-formatter');
const axios = require('axios');
const Jimp = require('jimp');

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
      let mediaMessage = null;

      // Cas 1: Image en réponse
      if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quotedMsg.imageMessage) {
          mediaMessage = quotedMsg.imageMessage;
        } else if (quotedMsg.videoMessage) {
          mediaMessage = quotedMsg.videoMessage;
        } else {
          return sock.sendMessage(senderJid, {
            text: '❌ Veuillez répondre à une image ou une vidéo valide'
          }, { quoted: message });
        }
      }
      // Cas 2: Image directement attachée
      else if (message.message?.imageMessage) {
        mediaMessage = message.message.imageMessage;
      }
      // Cas 3: Vidéo directement attachée
      else if (message.message?.videoMessage) {
        mediaMessage = message.message.videoMessage;
      }
      else {
        return sock.sendMessage(senderJid, {
          text: '❌ Usage: Réponds à une image/vidéo avec `!sticker`'
        }, { quoted: message });
      }

      // Télécharger via l'URL du média avec Jimp
      let imageBuffer = null;
      try {
        imageBuffer = await downloadMediaWithJimp(mediaMessage);
      } catch (downloadErr) {
        console.error('[STICKER] Erreur téléchargement:', downloadErr.message);
        return sock.sendMessage(senderJid, {
          text: '❌ Impossible de télécharger le média. Réessaie.'
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
 * Télécharge une image via Jimp (supporte les URLs WebP et autres formats)
 * @param {*} mediaMessage - Message média contenant l'URL
 * @returns {Promise<Buffer>} Buffer de l'image en PNG
 */
async function downloadMediaWithJimp(mediaMessage) {
  try {
    // Extraire l'URL du message média
    const mediaUrl = mediaMessage?.url;
    
    if (!mediaUrl) {
      throw new Error('URL du média non trouvée');
    }

    // Charger l'image avec Jimp depuis l'URL
    const image = await Jimp.read(mediaUrl);
    
    // Convertir en PNG (qui est plus universel) et retourner le buffer
    const buffer = await image.getBuffer('image/png');
    return buffer;
  } catch (error) {
    throw new Error(`Téléchargement échoué: ${error.message}`);
  }
}
