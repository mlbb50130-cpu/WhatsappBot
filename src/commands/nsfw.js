const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const { getAssetUrl } = require('../utils/assets');

module.exports = {
  name: 'nsfw',
  description: 'Photo aléatoire NSFW',
  category: 'ASSETS',
  usage: '!nsfw',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/NSFW');

    try {
      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      const randomFile = RandomUtils.choice(files);
      const imageUrl = getAssetUrl('NSFW', randomFile);

      user.xp += 2;
      await user.save();

      await sock.sendMessage(senderJid, {
        image: { url: imageUrl },
        caption: '🔞 *NSFW*\n\n➕ 2 XP ✨'
      });
    } catch (error) {
      console.error('Error in nsfw command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
