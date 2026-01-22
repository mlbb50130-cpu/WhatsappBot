const axios = require('axios');

module.exports = {
  name: 'waifu',
  description: 'Image de waifu populaire/forte',
  category: 'IMAGES',
  usage: '!waifu',
  cooldown: 5,

  async execute(sock, message, args, user) {
    const jid = message.key.remoteJid;

    try {
      let imageUrl;
      let characterInfo = '';

      /* ====== WAIFU.IM API - Personnages populaires ====== */
      try {
        const res = await axios.get(
          'https://api.waifu.im/search?tag=waifu&many=false',
          { timeout: 10000 }
        );

        if (res.data?.images?.[0]) {
          imageUrl = res.data.images[0].url;
          characterInfo = res.data.images[0].source || 'Personnage de anime';
        }
      } catch (e) {
        console.log('[WAIFU] Waifu.im failed:', e.message);
      }

      /* ====== FALLBACK: JIKAN API (MyAnimeList) ====== */
      if (!imageUrl) {
        try {
          const res = await axios.get('https://api.jikan.moe/v4/random/characters', {
            timeout: 10000
          });

          if (res.data?.data?.images?.jpg?.image_url) {
            imageUrl = res.data.data.images.jpg.image_url;
            characterInfo = `${res.data.data.name} - ${res.data.data.about?.split('\n')[0] || 'Personnage populaire'}`;
          }
        } catch (e) {
          console.log('[WAIFU] Jikan failed');
        }
      }

      /* ====== FALLBACK: NEKOS.BEST ====== */
      if (!imageUrl) {
        try {
          const res = await axios.get('https://nekos.best/api/v2/waifu');
          imageUrl = res.data?.results?.[0]?.url;
        } catch (e) {
          console.log('[WAIFU] Nekos.best failed');
        }
      }

      if (!imageUrl) {
        return sock.sendMessage(jid, { text: '❌ Aucune image trouvée' });
      }

      /* ====== TÉLÉCHARGEMENT IMAGE ====== */
      const imgBuffer = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      /* ====== ENVOI WHATSAPP ====== */
      await sock.sendMessage(jid, {
        image: Buffer.from(imgBuffer.data),
        caption: `😍 *Waifu Populaire*\n\n${characterInfo}\n\n➕ 5 XP ✨`
      });

      user.xp += 5;
      await user.save();

    } catch (err) {
      console.error('[WAIFU ERROR]', err);
      await sock.sendMessage(jid, { text: '❌ Erreur waifu' });
    }
  }
};
