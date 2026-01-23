const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const { getAssetBuffer } = require('../utils/assets');

module.exports = {
  name: 'miku',
  description: 'Photo aléatoire de Miku Nakano (HD)',
  category: 'ASSETS',
  usage: '!miku',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/Miku');

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

      const randomFile = RandomUtils.choice(files);
      const imageBuffer = getAssetBuffer('Miku', randomFile);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      if (isGroup) if (isGroup) user.xp += 2; // Seulement en groupe // Seulement en groupe
      await user.save();

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '💗 *Miku Nakano*\n\n➕ 2 XP ✨' : '💗 *Miku Nakano*\n\n'
      });
    } catch (error) {
      console.error('Error in miku command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
