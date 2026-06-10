const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'neko',
  description: 'Image chat anime (neko) aléatoire',
  category: 'IMAGES',
  usage: '!neko',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    // Check daily limit for assets (10 images = XP limit)
    const today = new Date();
    if (!user.assetUsageToday) {
      user.assetUsageToday = { lastReset: today, count: 0 };
    }

    const lastReset = new Date(user.assetUsageToday.lastReset || 0);
    const isSameDay = lastReset.toDateString() === today.toDateString();
    if (!isSameDay) {
      user.assetUsageToday.lastReset = today;
      user.assetUsageToday.count = 0;
    }

    const allowXp = user.assetUsageToday.count < 10;

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
        }
      } catch (apiError) {
      }

      const caption = isGroup ? MessageFormatter.elegantBox('🐱 𝔑𝔈𝔎𝔒 🐱', [{ label: '✨ Récompense', value: allowXp ? '+5 XP' : '🚫 Limite atteinte (10/jour)' }]) : MessageFormatter.elegantBox('🐱 𝔊𝔈𝔎𝔦 🐱', [{ label: '🐾 Type', value: 'Neko mignon' }]);
      
      if (imageUrl) {
        try {
          await sock.sendMessage(senderJid, {
            image: { url: imageUrl },
            caption: caption
          });
        } catch (sendError) {
          if (reply) {
        await reply({ text: caption });
      } else {
        await sock.sendMessage(senderJid, { text: caption });
      }
        }
      } else {
        if (reply) {
        await reply({ text: caption });
      } else {
        await sock.sendMessage(senderJid, { text: caption });
      }
      }

      if (isGroup && allowXp) user.xp += 5; // Seulement en groupe
      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
