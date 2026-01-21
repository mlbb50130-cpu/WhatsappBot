const axios = require('axios');

module.exports = {
  name: 'neko',
  description: 'Image chat anime (neko) aléatoire',
  category: 'IMAGES',
  usage: '!neko',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      let imageUrl = null;

      try {
        // Try to fetch from Nekos.best
        const response = await axios.get('https://nekos.best/api/v2/neko', { 
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (response.data?.results?.[0]?.url) {
          imageUrl = response.data.results[0].url;
          console.log('[NEKO] Image loaded from Nekos.best:', imageUrl);
        }
      } catch (apiError) {
        console.log('[NEKO] Nekos.best API failed:', apiError.message);
      }

      if (imageUrl) {
        try {
          await sock.sendMessage(senderJid, {
            image: { url: imageUrl },
            caption: '🐱 *Neko mignon!*\n\n✨ +5 XP 💫'
          });
        } catch (sendError) {
          console.log('[NEKO] Failed to send image, using fallback');
          await sock.sendMessage(senderJid, {
            text: '🐱 *Une neko adorable!*\n\n✨ +5 XP 💫'
          });
        }
      } else {
        await sock.sendMessage(senderJid, {
          text: '🐱 *Une neko adorable!*\n\n✨ +5 XP 💫'
        });
      }

      user.xp += 5;
      await user.save();

    } catch (error) {
      console.error('Error in neko command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
