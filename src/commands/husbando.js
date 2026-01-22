const axios = require('axios');

module.exports = {
  name: 'husbando',
  description: 'Image de husbando populaire/fort',
  category: 'IMAGES',
  usage: '!husbando',
  cooldown: 5,

  async execute(sock, message, args, user) {
    const jid = message.key.remoteJid;

    try {
      let imageUrl;
      let characterInfo = '';

      /* ====== NEKOS.BEST - API de fanart pour husbando (priorité pour fanart) ====== */
      try {
        const res = await axios.get('https://nekos.best/api/v2/husbando');
        if (res.data?.results?.[0]?.url) {
          imageUrl = res.data.results[0].url;
          characterInfo = 'Fanart husbando populaire';
        }
      } catch (e) {
        console.log('[HUSBANDO] Nekos.best fanart failed:', e.message);
      }

      /* ====== FALLBACK: JIKAN API - Chercher des husbandos populaires et forts ====== */
      if (!imageUrl) {
        try {
          // Liste de personnages populaires/forts comme demandé (Kakashi, Rengoku, etc.)
          const popularCharacters = [
            'Kakashi Hatake', 'Rengoku', 'Toji Fushiguro', 'Gojo Satoru',
            'Levi Ackerman', 'Itachi Uchiha', 'Madara Uchiha', 'Saitama',
            'Sasuke Uchiha', 'Naruto Uzumaki', 'Ichigo Kurosaki', 'Aizen Sosuke',
            'Jiraiya', 'Minato Namikaze', 'Rock Lee', 'Neji Hyuga'
          ];

          const randomChar = popularCharacters[Math.floor(Math.random() * popularCharacters.length)];
          const encodedName = encodeURIComponent(randomChar);

          const res = await axios.get(
            `https://api.jikan.moe/v4/characters?query=${encodedName}&order_by=favorites&sort=desc`,
            { timeout: 10000 }
          );

          if (res.data?.data?.[0]?.images?.jpg?.image_url) {
            const character = res.data.data[0];
            imageUrl = character.images.jpg.image_url;
            characterInfo = `${character.name} ⭐ (Populaire & Fort)`;
          }
        } catch (e) {
          console.log('[HUSBANDO] Jikan popular characters failed');
        }
      }

      /* ====== FALLBACK: WAIFU.IM - Tags male/husbando ====== */
      if (!imageUrl) {
        try {
          const tags = ['male', 'husbando'];
          const tag = tags[Math.floor(Math.random() * tags.length)];
          
          const res = await axios.get(
            `https://api.waifu.im/search?tag=${tag}&many=false`,
            { timeout: 10000 }
          );

          if (res.data?.images?.[0]?.url) {
            imageUrl = res.data.images[0].url;
            characterInfo = res.data.images[0].source || 'Husbando populaire';
          }
        } catch (e) {
          console.log('[HUSBANDO] Waifu.im failed');
        }
      }

      /* ====== FALLBACK: NEKOS.BEST ====== */
      if (!imageUrl) {
        try {
          const res = await axios.get('https://nekos.best/api/v2/husbando');
          imageUrl = res.data?.results?.[0]?.url;
          characterInfo = 'Husbando populaire';
        } catch (e) {
          console.log('[HUSBANDO] Nekos.best failed');
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
        caption: `😍 *Husbando Populaire*\n\n${characterInfo}\n\n➕ 5 XP ✨`
      });

      user.xp += 5;
      await user.save();

    } catch (err) {
      console.error('[HUSBANDO ERROR]', err);
      await sock.sendMessage(jid, { text: '❌ Erreur husbando' });
    }
  }
};
