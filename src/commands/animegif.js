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

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      let gifUrl = null;

      try {
        // Try to fetch GIF from API
        const response = await axios.get('https://api.giphy.com/v1/gifs/random?tag=anime&api_key=NzJ0bDc5bDc5Mzc=', { 
          timeout: 10000
        });
        if (response.data?.data?.image_url) {
          gifUrl = response.data.data.image_url;
          console.log('[GIF] GIF loaded:', gifUrl);
        }
      } catch (error1) {
        console.log('[GIF] GIF API failed, trying fallback');
        try {
          // Alternative GIF source
          const response = await axios.get('https://tenor.googleapis.com/v2/random?q=anime&key=AAAAABI8LbkAAAAA', {
            timeout: 10000
          });
          if (response.data?.results?.[0]?.media_formats?.gif?.url) {
            gifUrl = response.data.results[0].media_formats.gif.url;
          }
        } catch (error2) {
          console.log('[GIF] All APIs failed');
        }
      }

      const caption = isGroup ? '🎬 *GIF Anime!*\n\n✨ +5 XP 💫' : '🎬 *GIF Anime!*';
      
      if (gifUrl) {
        try {
          await sock.sendMessage(senderJid, {
            image: { url: gifUrl },
            caption: caption
          });
        } catch (sendError) {
          await sock.sendMessage(senderJid, {
            text: caption
          });
        }
      } else {
        await sock.sendMessage(senderJid, {
          text: '🎬 *Un GIF anime rigolo!*\n\n✨ +5 XP 💫'
        });
      }

      if (isGroup) if (isGroup) user.xp += 5; // Seulement en groupe // Seulement en groupe
      await user.save();

    } catch (error) {
      console.error('Error in animegif command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
