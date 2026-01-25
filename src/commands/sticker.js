const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'UTILITY',
  cooldown: 3,
  description: 'Convertir une image en sticker WhatsApp (512x512 WebP)',
  usage: '!sticker [en réponse à une image ou en pièce jointe]',

  async execute(sock, msg, args, user, group) {
    const chat = msg.key.remoteJid;
    let imageMessage = null;

    try {
      // Cas 1: Image en réponse
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        imageMessage = quotedMsg.imageMessage || quotedMsg.documentMessage;
        
        if (!imageMessage) {
          return sock.sendMessage(chat, {
            text: '❌ Veuillez répondre à une image valide'
          }, { quoted: msg });
        }
      }
      // Cas 2: Image en pièce jointe
      else if (msg.message?.imageMessage) {
        imageMessage = msg.message.imageMessage;
      }
      else {
        return sock.sendMessage(chat, {
          text: '❌ Utilisation: `!sticker`\n\n• Réponds à une image avec `!sticker`\n• Ou envoie une image puis `!sticker`'
        }, { quoted: msg });
      }

      // Télécharger l'image depuis WhatsApp
      const imageBuffer = await sock.downloadMediaMessage(imageMessage || msg.message?.imageMessage);
      
      if (!imageBuffer) {
        return sock.sendMessage(chat, {
          text: '❌ Impossible de télécharger l\'image'
        }, { quoted: msg });
      }

      // Créer un dossier temporaire s'il n'existe pas
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Convertir en WebP 512x512 avec fond transparent
      const tempFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
      
      await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toFile(tempFilePath);

      // Lire le fichier WebP converti
      const stickerBuffer = fs.readFileSync(tempFilePath);

      // Envoyer comme sticker WhatsApp
      await sock.sendMessage(chat, {
        sticker: stickerBuffer
      }, { quoted: msg });

      // Message de confirmation
      await sock.sendMessage(chat, {
        text: '✅ Sticker créé avec succès! 🎨'
      }, { quoted: msg });

      // Nettoyer le fichier temporaire
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Erreur lors du nettoyage:', err);
      });

    } catch (error) {
      console.error('[STICKER] Erreur:', error);
      
      return sock.sendMessage(chat, {
        text: `❌ Erreur: ${error.message || 'Impossible de créer le sticker'}`
      }, { quoted: msg });
    }
  }
};
