const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');

module.exports = {
  name: 'husbando',
  description: 'Image husbando aléatoire',
  category: 'IMAGES',
  usage: '!husbando',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Charger les images de Husbando depuis les assets
      const assetPath = path.join(__dirname, '../asset/Husbando');
      const files = fs.readdirSync(assetPath).filter(f => 
        f.startsWith('Husbando_') && (f.endsWith('.jpg') || f.endsWith('.png'))
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour le moment'
        });
        return;
      }

      const randomFile = files[Math.floor(Math.random() * files.length)];
      const selectedFile = ImageRotationSystem.getNextImage(user, 'husbando', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, {
          text: '❌ Erreur lors du chargement de l\'image'
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? MessageFormatter.elegantBox('😍 HUSBANDO 😍', [{ label: '✨ Récompense', value: '+5 XP' }]) : MessageFormatter.elegantBox('😍 HUSBANDO 😍', [{ label: '📺 Type', value: 'Personnage' }])
      });

      if (isGroup) {
        user.xp += 5;
        await user.save();
      }

    } catch (error) {
      console.error('Error fetching husbando:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération de l\'image. Réessaie!'
      });
    }
  }
};
