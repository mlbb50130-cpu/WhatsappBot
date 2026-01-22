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

      /* ====== NEKOS.BEST - API de fanart pour waifu (priorité pour fanart) ====== */
      try {
        const res = await axios.get('https://nekos.best/api/v2/waifu');
        if (res.data?.results?.[0]?.url) {
          imageUrl = res.data.results[0].url;
          characterInfo = 'Fanart waifu populaire';
        }
      } catch (e) {
        console.log('[WAIFU] Nekos.best fanart failed:', e.message);
      }

      /* ====== FALLBACK: WAIFU.IM - Tags female/waifu ====== */
      if (!imageUrl) {
        try {
          const tags = ['female', 'waifu'];
          const tag = tags[Math.floor(Math.random() * tags.length)];
          
          const res = await axios.get(
            `https://api.waifu.im/search?tag=${tag}&many=false`,
            { timeout: 10000 }
          );

          if (res.data?.images?.[0]?.url) {
            imageUrl = res.data.images[0].url;
            characterInfo = res.data.images[0].source || 'Waifu populaire';
          }
        } catch (e) {
          console.log('[WAIFU] Waifu.im failed');
        }
      }

      /* ====== FALLBACK: JIKAN API - Chercher des waifus populaires ====== */
      if (!imageUrl) {
        try {
          // Répéter jusqu'à trouver un personnage féminin
          for (let i = 0; i < 5; i++) {
            const res = await axios.get('https://api.jikan.moe/v4/random/characters', {
              timeout: 10000
            });

            if (res.data?.data?.images?.jpg?.image_url) {
              const character = res.data.data;
              // Vérifier si c'est probablement un personnage féminin
              const isFemale = character.about?.toLowerCase().includes('female') || 
                             character.about?.toLowerCase().includes('girl') ||
                             character.about?.toLowerCase().includes('woman') ||
                             character.about?.toLowerCase().includes('she');
              
              if (isFemale) {
                imageUrl = character.images.jpg.image_url;
                characterInfo = `${character.name} - ${character.about?.split('\n')[0]?.slice(0, 50) || 'Personnage populaire'}`;
                break;
              }
            }
          }
        } catch (e) {
          console.log('[WAIFU] Jikan failed');
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
