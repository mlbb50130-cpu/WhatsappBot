const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');

module.exports = {
  name: 'madara',
  description: 'Photos de Madara Uchiha',
  category: 'IMAGES',
  usage: '!madara',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Get all image files from Madara folder
      const assetPath = path.join(__dirname, '../asset/Madara');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour Madara.'
        });
        return;
      }

      // Select random image
      const randomFile = files[Math.floor(Math.random() * files.length)];
      const imagePath = path.join(assetPath, randomFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Send image with caption
      const caption = isGroup 
        ? '🌑 *Madara Uchiha* 🌑\n\n➕ 15 XP ✨' 
        : '🌑 *Madara Uchiha* 🌑';

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
      console.error('[MADARA ERROR]', error);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du chargement de l\'image.'
      });
    }
  }
};
