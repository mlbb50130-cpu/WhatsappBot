const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');

module.exports = {
  name: 'rengokudemon',
  description: 'Photo aléatoire de RengokuDemon',
  category: 'ASSETS',
  usage: '!rengokudemon',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/RengokuDemon');

    try {
      if (!fs.existsSync(assetPath)) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      const selectedFile = ImageRotationSystem.getNextImage(user, 'rengokudemon', files);
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      if (isGroup) {
        user.xp += 2;
        await user.save();
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '🔥 *RengokuDemon*\n\n➕ 2 XP ✨' : '🔥 *RengokuDemon*\n\n'
      });
    } catch (error) {
      console.error('Error in rengokudemon command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
