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

      /* ====== WAIFU.IM API - Tags spécifiques pour husbando ====== */
      try {
        // Utiliser les tags "male" ou essayer plusieurs tags pour husbando
        const tags = ['male', 'husbando'];
        const tag = tags[Math.floor(Math.random() * tags.length)];
        
        const res = await axios.get(
          `https://api.waifu.im/search?tag=${tag}&many=false`,
          { timeout: 10000 }
        );

        if (res.data?.images?.[0]?.url) {
          imageUrl = res.data.images[0].url;
          characterInfo = res.data.images[0].source || 'Personnage fort';
        }
      } catch (e) {
        console.log('[HUSBANDO] Waifu.im failed:', e.message);
      }

      /* ====== FALLBACK: JIKAN API - Chercher des personnages masculins ====== */
      if (!imageUrl) {
        try {
          // Répéter jusqu'à trouver un personnage masculin
          for (let i = 0; i < 5; i++) {
            const res = await axios.get('https://api.jikan.moe/v4/random/characters', {
              timeout: 10000
            });

            if (res.data?.data?.images?.jpg?.image_url) {
              const character = res.data.data;
              // Vérifier si c'est probablement un personnage masculin (simple heuristique)
              const isMale = character.about?.toLowerCase().includes('male') || 
                           character.name?.toLowerCase().includes('no') ||
                           !character.about?.toLowerCase().includes('female');
              
              if (isMale) {
                imageUrl = character.images.jpg.image_url;
                characterInfo = `${character.name} - ${character.about?.split('\n')[0]?.slice(0, 50) || 'Personnage populaire'}`;
                break;
              }
            }
          }
        } catch (e) {
          console.log('[HUSBANDO] Jikan failed');
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
