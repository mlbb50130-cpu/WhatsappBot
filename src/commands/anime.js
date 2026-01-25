const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

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
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilise: !anime [nom]') });
        return;
      }

      const animeName = args.join(' ');

      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?query=${encodeURIComponent(animeName)}&limit=1`, {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: MessageFormatter.error('Anime non trouvé!') });
          return;
        }

        const anime = response.data.data[0];

        let animeMessage = `
*${anime.title}*
📝 Titre anglais: ${anime.title_english || 'N/A'}

🎯 *Type:* ${anime.type || 'N/A'}
📺 *Episodes:* ${anime.episodes || '?'}
✅ *Statut:* ${anime.status || 'N/A'}
⭐ *Note:* ${anime.score ? anime.score + '/10' : 'N/A'}
📅 *Année:* ${anime.year || 'N/A'}

📖 *Synopsis:* ${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'N/A'}`;

        const content = MessageFormatter.box('📺 INFOS ANIME 📺', animeMessage);
        await sock.sendMessage(senderJid, { text: content });

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur lors de la récupération des données!') });
        return;
      }
    } catch (error) {
      console.error('Error in anime command:', error.message);
    }
  }
};
