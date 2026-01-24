const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'yoruichi',
  description: 'Photo aléatoire de Yoruichi',
  category: 'IMAGES',
  usage: '!yoruichi',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/Yoruichi');

    try {
      if (!fs.existsSync(assetPath)) {
        await sock.sendMessage(senderJid, { 
          text: '❌ Dossier des images Yoruichi non trouvé!' 
        });
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { 
          text: '❌ Aucune image trouvée dans le dossier Yoruichi!' 
        });
        return;
      }

      const selectedFile = ImageRotationSystem.getNextImage(user, 'yoruichi', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      // Add XP only if in group
      if (isGroup) {
        user.xp += 15;
        await user.save();
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '💜 *Yoruichi* 💜\n\n➕ 15 XP ✨' : '💜 *Yoruichi* 💜'
      });
    } catch (error) {
      console.error('Error in yoruichi command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement de l\'image!' });
    }
  }
};
