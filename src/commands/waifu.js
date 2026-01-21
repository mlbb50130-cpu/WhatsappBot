const axios = require('axios');

module.exports = {
  name: 'waifu',
  description: 'Image waifu aléatoire (SFW ou NSFW)',
  category: 'IMAGES',
  usage: '!waifu [sfw|nsfw]',
  cooldown: 5,

  async execute(sock, message, args, user) {
    const jid = message.key.remoteJid;

    try {
      // Déterminer le filtre (SFW par défaut)
      const filter = args?.[0]?.toLowerCase() || 'sfw';
      
      if (!['sfw', 'nsfw'].includes(filter)) {
        return sock.sendMessage(jid, { 
          text: '❌ Usage: !waifu [sfw|nsfw]\n\n😻 sfw = Image appropriée\n🔞 nsfw = Image pour adultes' 
        });
      }

      let imageUrl;
      const isNsfw = filter === 'nsfw';

      /* ====== WAIFU.IM API (Meilleure avec filtres) ====== */
      try {
        const nsfw_param = isNsfw ? 'true' : 'false';
        const res = await axios.get(
          `https://api.waifu.im/search?is_nsfw=${nsfw_param}&tag=waifu`,
          { timeout: 10000 }
        );

        if (res.data?.images?.[0]) {
          imageUrl = res.data.images[0].url;
        }
      } catch (e) {
        console.log('[WAIFU] Waifu.im failed:', e.message);
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
      const filterEmoji = isNsfw ? '🔞' : '😻';
      const filterText = isNsfw ? 'NSFW' : 'SFW';
      
      await sock.sendMessage(jid, {
        image: Buffer.from(imgBuffer.data),
        caption: `${filterEmoji} *Waifu ${filterText}*\n➕ 5 XP ✨`
      });

      user.xp += 5;
      await user.save();

    } catch (err) {
      console.error('[WAIFU ERROR]', err);
      await sock.sendMessage(jid, { text: '❌ Erreur waifu' });
    }
  }
};
