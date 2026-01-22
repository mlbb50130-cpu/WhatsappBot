const axios = require('axios');

module.exports = {
  name: 'anime',
  description: 'Infos sur un anime',
  category: 'ANIME',
  usage: '!anime [nom]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!args || args.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Utilise: !anime [nom]' });
        return;
      }

      const animeName = args.join(' ');

      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?query=${encodeURIComponent(animeName)}&limit=1`, {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: '❌ Anime non trouvé!' });
          return;
        }

        const anime = response.data.data[0];

        let animeMessage = `
╔════════════════════════════════════╗
║       📺 INFOS ANIME 📺           ║
╚════════════════════════════════════╝

*${anime.title}*
📝 Titre anglais: ${anime.title_english || 'N/A'}

🎯 *Informations:*
  Type: ${anime.type || 'N/A'}
  Episodes: ${anime.episodes || '?'}
  Statut: ${anime.status || 'N/A'}
  Note: ${anime.score ? anime.score + '/10' : 'N/A'}
  Année: ${anime.year || 'N/A'}

📖 *Synopsis:* ${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'N/A'}

═════════════════════════════════════`;

        await sock.sendMessage(senderJid, { text: animeMessage });

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération des données!' });
        return;
      }
    } catch (error) {
      console.error('Error in anime command:', error.message);
    }
  }
};
