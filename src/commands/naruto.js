const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const ImageRotationSystem = require('../utils/imageRotation');

module.exports = {
  name: 'naruto',
  description: 'Photos de Naruto Uzumaki',
  category: 'IMAGES',
  usage: '!naruto',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Get all image files from Naruto folder
      const assetPath = path.join(__dirname, '../asset/Naruto');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour Naruto.'
        });
        return;
      }

      // Get next available image (no duplicates today)
      const selectedFile = ImageRotationSystem.getNextImage(user, 'naruto', files);
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Send image with caption
      const caption = isGroup 
        ? '🧡 *Naruto Uzumaki* 🧡\n\n➕ 15 XP ✨' 
        : '🧡 *Naruto Uzumaki* 🧡';

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Add XP only if in group
      if (isGroup) {
        user.xp += 15;
        await user.save();
      }

    } catch (error) {
      console.error(`[NARUTO] Error: ${error.message}`);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du chargement de l\'image.'
      });
    }
  }
};
