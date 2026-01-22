const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const { getAssetUrl } = require('../utils/assets');

module.exports = {
  name: 'boahancook',
  description: 'Photo aléatoire de Boa Hancock',
  category: 'ASSETS',
  usage: '!boahancook',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/Boa Hancook');

    try {
      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      const randomFile = RandomUtils.choice(files);
      const imageUrl = getAssetUrl('Boa Hancook', randomFile);

      user.xp += 2;
      await user.save();

      await sock.sendMessage(senderJid, {
        image: { url: imageUrl },
        caption: '💚 *Boa Hancock*\n\n➕ 2 XP ✨'
      });
    } catch (error) {
      console.error('Error in boahancook command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
