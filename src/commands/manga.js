const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'manga',
  description: 'Infos sur un manga',
  category: 'ANIME',
  usage: '!manga [nom]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      if (!args || args.length === 0) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Utilise: !manga [nom]') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilise: !manga [nom]') });
      }
        return;
      }

      const mangaName = args.join(' ');

      try {
        const response = await axios.get(`https://api.jikan.moe/v4/manga?query=${encodeURIComponent(mangaName)}&limit=1`, {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          if (reply) {
        await reply({ text: MessageFormatter.error('Manga non trouvé!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Manga non trouvé!') });
      }
          return;
        }

        const manga = response.data.data[0];

        const mangaItems = [
          { label: '📝 Titre', value: manga.title },
          { label: '📝 Anglais', value: manga.title_english || 'N/A' },
          { label: '🎯 Type', value: manga.type || 'N/A' },
          { label: 'Chapitres', value: manga.chapters || '?' },
          { label: 'Tomes', value: manga.volumes || '?' },
          { label: 'Statut', value: manga.status || 'N/A' },
          { label: 'Note', value: manga.score ? `${manga.score}/10` : 'N/A' }
        ];

        const synopsis = manga.synopsis ? manga.synopsis.substring(0, 150) + '...' : 'N/A';

        const content = `${MessageFormatter.elegantBox('𝔐𝔄𝔑𝔊𝔄', mangaItems)}\nSynopsis: ${synopsis}`;
        if (reply) {
        await reply(MessageFormatter.createMessageWithImage(content));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
      }

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        if (reply) {
        await reply({ text: '❌ Erreur API!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur API!' });
      }
        return;
      }
    } catch (error) {
      console.error('Error in manga command:', error.message);
    }
  }
};
