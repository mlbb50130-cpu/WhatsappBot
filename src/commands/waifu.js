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
          text: '❌ Usage: !waifu [sfw|nsfw]\n\n🥰 sfw = Image appropriée\n🔞 nsfw = Image pour adultes' 
        });
      }

      let imageUrl;
      const isNsfw = filter === 'nsfw';

      /* ====== NEKOS.LIFE API (Meilleure) ====== */
      try {
        const endpoint = isNsfw ? 
          'https://nekos.life/api/v2/image/waifu' :
          'https://nekos.life/api/v2/image/neko';
        
        const res = await axios.get(endpoint, { timeout: 10000 });
        imageUrl = res.data?.url;
      } catch (e) {
        console.log('[WAIFU] Nekos.life failed:', e.message);
      }

      /* ====== FALLBACK: NEKOSAPI ====== */
      if (!imageUrl) {
        try {
          const tags = isNsfw ? 'waifu,ecchi' : 'waifu';
          const res = await axios.get(
            `https://api.nekosapi.com/v4/images/random?tags=${tags}`,
            { timeout: 10000 }
          );
          imageUrl = res.data?.data?.[0]?.image_url;
        } catch (e) {
          console.log('[WAIFU] NekosAPI failed');
        }
      }

      /* ====== FALLBACK: NEKOS.BEST ====== */
      if (!imageUrl) {
        const res = await axios.get('https://nekos.best/api/v2/waifu');
        imageUrl = res.data?.results?.[0]?.url;
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
      const filterEmoji = isNsfw ? '🔞' : '🥰';
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
