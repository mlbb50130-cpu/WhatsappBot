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
      let error = null;

      // Essayer avec Nekos.best
      try {
        const response = await axios.get('https://nekos.best/api/v2/waifu', { timeout: 5000 });
        if (response.data?.results?.[0]?.url) {
          imageUrl = response.data.results[0].url;
        }
      } catch (err) {
        error = err.message;
      }

      // Fallback vers une autre API
      if (!imageUrl) {
        try {
          const response = await axios.get('https://api.waifu.im/random?tag=waifu', { timeout: 5000 });
          if (response.data?.images?.[0]?.url) {
            imageUrl = response.data.images[0].url;
          }
        } catch (err) {
        }
      }

      // Si aucune image n'a pu être trouvée
      if (!imageUrl) {
        const waifuItems = [{ label: '⚠️ Status', value: 'APIs indisponibles' }];
        const text = `${MessageFormatter.elegantBox('Waifu', waifuItems)}
➕ ${allowXp ? '5 XP' : '🚫 Limite atteinte (10/jour)'}`;
        await sock.sendMessage(senderJid, { text });
        if (isGroup && allowXp) user.xp += 5;
        // Increment usage counter
        user.assetUsageToday.count += 1;
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
        const caption = `Une image waifu pour toi!\n\n➕ ` + (allowXp ? '5 XP' : '🚫 Limite atteinte (10/jour)');

        if (reply) {
          await reply({
            image: imageBuffer,
            caption: caption
          });
        } else {
          await sock.sendMessage(senderJid, {
            image: imageBuffer,
            caption: caption
          });
        }

        if (isGroup && allowXp) user.xp += 5;
        user.assetUsageToday.count += 1;
        await user.save();
      } catch (downloadErr) {
        if (reply) {
          await reply({ text: 'Une image waifu pour toi!\n\n➕ ' + (allowXp ? '5 XP' : '🚫 Limite atteinte (10/jour)') });
        } else {
          await sock.sendMessage(senderJid, { text: 'Une image waifu pour toi!\n\n➕ ' + (allowXp ? '5 XP' : '🚫 Limite atteinte (10/jour)') });
        }
      }

    } catch (error) {
      if (reply) {
        await reply({ text: MessageFormatter.error('Erreur lors de la récupération!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur lors de la récupération!') });
      }
    }
  }
};
