const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

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
      let imageUrl = null;
      let error = null;

      // Essayer avec Nekos.best
      try {
        const response = await axios.get('https://nekos.best/api/v2/waifu', { timeout: 5000 });
        if (response.data?.results?.[0]?.url) {
          imageUrl = response.data.results[0].url;
        }
      } catch (err) {
        error = err.message;
        console.log('[WAIFU] Nekos.best failed, trying fallback...');
      }

      // Fallback vers une autre API
      if (!imageUrl) {
        try {
          const response = await axios.get('https://api.waifu.im/random?tag=waifu', { timeout: 5000 });
          if (response.data?.images?.[0]?.url) {
            imageUrl = response.data.images[0].url;
          }
        } catch (err) {
          console.log('[WAIFU] Fallback failed:', err.message);
        }
      }

      // Si aucune image n'a pu être trouvée
      if (!imageUrl) {
        const waifuItems = [{ label: '⚠️ Status', value: 'APIs indisponibles' }];
        const text = `${MessageFormatter.elegantBox('🥰 𝔚𝔄𝔌𝔉𝔘 🥰', waifuItems)}
➕ 5 XP`;
        await sock.sendMessage(senderJid, { text });
        if (isGroup) user.xp += 5;
        await user.save();
        return;
      }

      // Essayer de télécharger et envoyer l'image
      try {
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        const caption = isGroup ? '🥰 *Une belle waifu!*\n\n➕ 5 XP ✨' : '🥰 *Une belle waifu!*';

        await sock.sendMessage(senderJid, {
          image: imageBuffer,
          caption: caption
        });
      } catch (downloadErr) {
        console.error('[WAIFU] Error downloading image:', downloadErr.message);
        await sock.sendMessage(senderJid, {
          text: '🥰 Une belle waifu pour toi!\n\n➕ 5 XP'
        });
      }

      user.xp += 5;
      await user.save();

    } catch (error) {
      console.error('Error fetching waifu:', error.message);
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Erreur lors de la récupération!')
      });
    }
  }
};
