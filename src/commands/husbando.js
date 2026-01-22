const axios = require('axios');

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
      const response = await axios.get('https://api.waifu.pics/random/husbando');
      const imageUrl = response.data.url;

      await sock.sendMessage(senderJid, {
        image: { url: imageUrl },
        caption: '😍 Un beau husbando pour toi!\n\n+5 XP'
      });

      user.xp += 5;
      await user.save();

    } catch (error) {
      console.error('Error fetching husbando:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération de l\'image. Réessaie!'
      });
    }
  }
};
