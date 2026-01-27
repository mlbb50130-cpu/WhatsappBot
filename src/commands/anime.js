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

        const animeItems = [
          { label: 'Titre', value: anime.title },
          { label: 'Type', value: anime.type || 'N/A' },
          { label: 'Episodes', value: anime.episodes || '?' },
          { label: 'Statut', value: anime.status || 'N/A' },
          { label: 'Note', value: anime.score ? `${anime.score}/10` : 'N/A' }
        ];

        const synopsis = anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'N/A';

        const content = `${MessageFormatter.elegantBox('𝔄𝔑𝔌𝔐𝔈', animeItems)}
Synopsis: ${synopsis}`;
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: '❌ Erreur API!' });
        return;
      }
    } catch (error) {
      console.error('Error in anime command:', error.message);
    }
  }
};
