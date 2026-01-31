const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'animegif',
  description: 'GIF anime aléatoire',
  category: 'IMAGES',
  usage: '!animegif',
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
      let gifUrl = null;

      try {
        // Try to fetch GIF from API
        const response = await axios.get('https://api.giphy.com/v1/gifs/random?tag=anime&api_key=NzJ0bDc5bDc5Mzc=', { 
          timeout: 10000
        });
        if (response.data?.data?.image_url) {
          gifUrl = response.data.data.image_url;
        }
      } catch (error1) {
        try {
          // Alternative GIF source
          const response = await axios.get('https://tenor.googleapis.com/v2/random?q=anime&key=AAAAABI8LbkAAAAA', {
            timeout: 10000
          });
          if (response.data?.results?.[0]?.media_formats?.gif?.url) {
            gifUrl = response.data.results[0].media_formats.gif.url;
          }
        } catch (error2) {
        }
      }

      if (gifUrl) {
        try {
          const captionMsg = isGroup 
            ? MessageFormatter.elegantBox('🎬 𝔊𝔌𝔉 𝔄𝔑𝔌𝔐𝔈 🎬', [{ label: '✨ Récompense', value: allowXp ? '+5 XP' : '🚫 Limite atteinte (10/jour)' }])
            : MessageFormatter.elegantBox('🎬 𝔊𝔌𝔉 𝔄𝔑𝔌𝔐𝔈 🎬', [{ label: '🎬 Type', value: 'GIF aléatoire' }]);
          await sock.sendMessage(senderJid, {
            image: { url: gifUrl },
            caption: captionMsg
          });
        } catch (sendError) {
          if (reply) {
        await reply({ text: caption });
      } else {
        await sock.sendMessage(senderJid, { text: caption });
      }
        }
      } else {
        const fallback = MessageFormatter.elegantBox('🎬 𝔊𝔌𝔉 𝔄𝔑𝔌𝔐𝔈 🎬', [{ label: '⚠️ Statut', value: 'GIF non disponible' }]);
        if (reply) {
        await reply({ text: fallback });
      } else {
        await sock.sendMessage(senderJid, { text: fallback });
      }
      }

      if (isGroup && allowXp) if (isGroup && allowXp) user.xp += 5; // Seulement en groupe // Seulement en groupe
      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();

    } catch (error) {
      console.error('Error in animegif command:', error.message);
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
