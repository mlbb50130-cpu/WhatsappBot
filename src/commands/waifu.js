const axios = require('axios');

module.exports = {
  name: 'waifu',
  description: 'Image waifu aléatoire',
  category: 'IMAGES',
  usage: '!waifu',
  cooldown: 5,

  async execute(sock, message, args, user) {
    const jid = message.key.remoteJid;

    try {
      let imageUrl;

      /* ====== NEKOSAPI ====== */
      try {
        const res = await axios.get(
          'https://api.nekosapi.com/v4/images/random?tags=waifu,ecchi',
          { timeout: 10000 }
        );

        imageUrl = res.data?.data?.[0]?.image_url;
      } catch (e) {
        console.log('[WAIFU] NekosAPI failed');
      }

      /* ====== FALLBACK ====== */
      if (!imageUrl) {
        const res = await axios.get('https://nekos.best/api/v2/waifu');
        imageUrl = res.data?.results?.[0]?.url;
      }

      if (!imageUrl) {
        return sock.sendMessage(jid, { text: '❌ Aucune image trouvée' });
      }

      /* ====== TÉLÉCHARGEMENT IMAGE ====== */
      const imgBuffer = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      /* ====== ENVOI WHATSAPP ====== */
      await sock.sendMessage(jid, {
        image: Buffer.from(imgBuffer.data),
        caption: '🥰 *Waifu du jour*\n➕ 5 XP ✨'
      });

      user.xp += 5;
      await user.save();

    } catch (err) {
      console.error('[WAIFU ERROR]', err);
      await sock.sendMessage(jid, { text: '❌ Erreur waifu' });
    }
  }
};
