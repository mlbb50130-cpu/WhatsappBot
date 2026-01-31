const sharp = require('sharp');
const { Sticker } = require('wa-sticker-formatter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'UTILITY',
  cooldown: 5,
  description: 'Convertir une image en sticker WhatsApp (WEBP 512x512)',
  usage: '!sticker [en réponse à une image]',

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    
    try {
      let mediaMessage = null;
      let mediaType = null;
      const mode = (args?.[0] || '').toLowerCase();
      const useCrop = mode === 'crop' || mode === 'c';

      // Cas 1: Image en réponse
      if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quotedMsg.imageMessage) {
          mediaMessage = quotedMsg.imageMessage;
          mediaType = 'image';
        } else if (quotedMsg.videoMessage) {
          mediaMessage = quotedMsg.videoMessage;
          mediaType = 'video';
        } else {
          return sock.sendMessage(senderJid, {
            text: '❌ Veuillez répondre à une image ou une vidéo valide'
          }, { quoted: message });
        }
      }
      // Cas 2: Image directement attachée
      else if (message.message?.imageMessage) {
        mediaMessage = message.message.imageMessage;
        mediaType = 'image';
      }
      // Cas 3: Vidéo directement attachée
      else if (message.message?.videoMessage) {
        mediaMessage = message.message.videoMessage;
        mediaType = 'video';
      }
      else {
        return sock.sendMessage(senderJid, {
          text: '❌ Usage: Réponds à une image avec `!sticker` (ou `!sticker crop`)'
        }, { quoted: message });
      }

      if (mediaType !== 'image') {
        return sock.sendMessage(senderJid, {
          text: '❌ La conversion en sticker fonctionne uniquement avec les images pour le moment.'
        }, { quoted: message });
      }

      // Télécharger le média via Baileys
      let imageBuffer = null;
      try {
        imageBuffer = await downloadMediaBuffer(mediaMessage, mediaType);
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
            fit: useCrop ? 'cover' : 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 70 })
          .toBuffer();
      } catch (resizeErr) {
        console.error('[STICKER] Erreur redimensionnement:', resizeErr.message);
        return sock.sendMessage(senderJid, {
          text: '❌ Impossible de traiter l\'image. Format non supporté.'
        }, { quoted: message });
      }

      // Créer le sticker avec wa-sticker-formatter (fallback vers WEBP direct)
      let stickerBuffer = null;
      try {
        const sticker = new Sticker(processedBuffer, {
          pack: 'TetsuBot',
          author: 'Bot',
          type: useCrop ? 'crop' : 'full',
          quality: 70,
          background: 'transparent'
        });
        stickerBuffer = await sticker.toBuffer();
      } catch (stickerErr) {
        console.warn('[STICKER] Sticker formatter KO, envoi WEBP direct:', stickerErr.message);
        stickerBuffer = processedBuffer;
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
 * Télécharge un média WhatsApp avec Baileys
 * @param {*} mediaMessage - Message média Baileys
 * @param {string} mediaType - Type de média (image, video, etc)
 * @returns {Promise<Buffer>} Buffer du média
 */
async function downloadMediaBuffer(mediaMessage, mediaType) {
  try {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Fichier téléchargé vide');
    }

    return buffer;
  } catch (error) {
    throw new Error(`Téléchargement échoué: ${error.message}`);
  }
}
