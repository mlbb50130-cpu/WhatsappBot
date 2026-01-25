const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Boom } = require('@hapi/boom');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'UTILITY',
  cooldown: 3,
  description: 'Convertir une image en sticker WhatsApp (512x512 WebP)',
  usage: '!sticker [en réponse à une image]',

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    let imageMessage = null;

    try {
      // Cas 1: Image en réponse
      if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        imageMessage = quotedMsg.imageMessage;
        
        if (!imageMessage) {
          return sock.sendMessage(senderJid, {
            text: '❌ Veuillez répondre à une image valide'
          }, { quoted: message });
        }
      }
      else {
        return sock.sendMessage(senderJid, {
          text: '❌ Utilisation: Réponds à une image avec `!sticker`'
        }, { quoted: message });
      }

      // Récupérer le média de l'image
      let imageBuffer = null;
      try {
        imageBuffer = await sock.downloadAndSaveMediaMessage(imageMessage);
        if (typeof imageBuffer === 'string') {
          // Si c'est un chemin, lire le fichier
          imageBuffer = fs.readFileSync(imageBuffer);
        }
      } catch (err) {
        console.error('[STICKER] Erreur téléchargement:', err);
        try {
          // Fallback: essayer avec la méthode directe
          const mediaPath = await sock.downloadMediaMessage(imageMessage, 'image', true);
          imageBuffer = fs.readFileSync(mediaPath);
        } catch (fallbackErr) {
          console.error('[STICKER] Fallback échoué:', fallbackErr);
          return sock.sendMessage(senderJid, {
            text: '❌ Impossible de télécharger l\'image'
          }, { quoted: message });
        }
      }
      
      if (!imageBuffer || imageBuffer.length === 0) {
        return sock.sendMessage(senderJid, {
          text: '❌ Impossible de traiter l\'image'
        }, { quoted: message });
      }

      // Créer un dossier temporaire s'il n'existe pas
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Convertir en WebP 512x512 avec fond transparent
      const tempFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
      
      try {
        await sharp(imageBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 80 })
          .toFile(tempFilePath);
      } catch (convertErr) {
        console.error('[STICKER] Erreur conversion:', convertErr);
        return sock.sendMessage(senderJid, {
          text: '❌ Erreur lors de la conversion de l\'image'
        }, { quoted: message });
      }

      // Lire le fichier WebP converti
      const stickerBuffer = fs.readFileSync(tempFilePath);

      // Envoyer comme sticker WhatsApp
      try {
        await sock.sendMessage(senderJid, {
          sticker: stickerBuffer
        });
        
        // Message de confirmation
        await sock.sendMessage(senderJid, {
          text: '✅ Sticker créé avec succès! 🎨'
        }, { quoted: message });
      } catch (stickerErr) {
        console.error('[STICKER] Erreur envoi sticker:', stickerErr);
        return sock.sendMessage(senderJid, {
          text: '❌ Erreur lors de l\'envoi du sticker'
        }, { quoted: message });
      }

      // Nettoyer le fichier temporaire
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Erreur lors du nettoyage:', err);
      });

    } catch (error) {
      console.error('[STICKER] Erreur générale:', error);
      
      return sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message || 'Impossible de créer le sticker'}`
      }, { quoted: message });
    }
  }
};
