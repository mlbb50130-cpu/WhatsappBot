const axios = require('axios');
const RandomUtils = require('../utils/random');

module.exports = {
  name: 'waifu',
  description: 'Image waifu aléatoire',
  category: 'IMAGES',
  usage: '!waifu',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const response = await axios.get('https://api.waifu.pics/random/waifu');
      const imageUrl = response.data.url;

      await sock.sendMessage(senderJid, {
        image: { url: imageUrl },
        caption: '🥰 Une belle waifu pour toi!\n\n+5 XP'
      });

      user.xp += 5;
      await user.save();

    } catch (error) {
      console.error('Error fetching waifu:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération de l\'image. Réessaie!'
      });
    }
  }
};
