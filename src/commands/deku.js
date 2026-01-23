const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const { getAssetBuffer } = require('../utils/assets');

module.exports = {
  name: 'deku',
  description: 'Photo aléatoire de Deku',
  category: 'ASSETS',
  usage: '!deku',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/Deku');

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
      const imageBuffer = getAssetBuffer('Deku', randomFile);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      if (isGroup) if (isGroup) user.xp += 2; // Seulement en groupe // Seulement en groupe
      await user.save();

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '💚 *Deku*\n\n➕ 2 XP ✨' : '💚 *Deku*\n\n'
      });
    } catch (error) {
      console.error('Error in deku command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
