const sharp = require('sharp');
const { Sticker } = require('wa-sticker-formatter');
const axios = require('axios');
const crypto = require('crypto');

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

      // Télécharger via l'URL du média
      let imageBuffer = null;
      try {
        imageBuffer = await downloadAndDecryptMedia(mediaMessage);
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
 * Télécharge et déchiffre une image WhatsApp
 * @param {*} mediaMessage - Message média avec URL et mediaKey
 * @returns {Promise<Buffer>} Buffer de l'image déchiffrée
 */
async function downloadAndDecryptMedia(mediaMessage) {
  try {
    const mediaUrl = mediaMessage?.url;
    const mediaKey = mediaMessage?.mediaKey;

    if (!mediaUrl) {
      throw new Error('URL du média non trouvée');
    }

    // Télécharger le fichier chiffré
    const response = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    });

    let buffer = Buffer.from(response.data);

    // Si mediaKey existe, déchiffrer le buffer
    if (mediaKey) {
      try {
        buffer = decryptMedia(buffer, mediaKey, mediaMessage.type || 'image');
      } catch (decryptErr) {
        console.warn('[STICKER] Déchiffrement échoué, utilisant le buffer brut:', decryptErr.message);
        // Continuer avec le buffer brut si déchiffrement échoue
      }
    }

    // Valider que c'est une image
    if (buffer.length < 100) {
      throw new Error('Fichier trop petit pour être une image valide');
    }

    return buffer;
  } catch (error) {
    throw new Error(`Téléchargement échoué: ${error.message}`);
  }
}

/**
 * Déchiffre un média WhatsApp en utilisant le mediaKey
 * @param {Buffer} buffer - Buffer chiffré
 * @param {Buffer} mediaKey - Clé de déchiffrement
 * @param {string} mediaType - Type de média (image, video, etc)
 * @returns {Buffer} Buffer déchiffré
 */
function decryptMedia(buffer, mediaKey, mediaType = 'image') {
  try {
    // Créer une clé HMAC à partir de mediaKey
    const iV = mediaKey.slice(0, 12);
    const cipherKey = mediaKey.slice(16, 32);

    // Extraire le MAC (derniers 10 bytes)
    const encData = buffer.slice(0, -10);
    const mac = buffer.slice(-10);

    // Déchiffrer avec AES-256-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iV);
    let decrypted = decipher.update(encData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (error) {
    throw new Error(`Déchiffrement échoué: ${error.message}`);
  }
}
