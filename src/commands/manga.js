const axios = require('axios');

module.exports = {
  name: 'manga',
  description: 'Infos sur un manga',
  category: 'ANIME',
  usage: '!manga [nom]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!args || args.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Utilise: !manga [nom]' });
        return;
      }

      const mangaName = args.join(' ');

      try {
        const response = await axios.get(`https://api.jikan.moe/v4/manga?query=${encodeURIComponent(mangaName)}&limit=1`, {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: '❌ Manga non trouvé!' });
          return;
        }

        const manga = response.data.data[0];

        let mangaMessage = `
╔════════════════════════════════════╗
║       📚 INFOS MANGA 📚           ║
╚════════════════════════════════════╝

*${manga.title}*
📝 Titre anglais: ${manga.title_english || 'N/A'}

🎯 *Informations:*
  Type: ${manga.type || 'N/A'}
  Chapitres: ${manga.chapters || '?'}
  Tomes: ${manga.volumes || '?'}
  Statut: ${manga.status || 'N/A'}
  Note: ${manga.score ? manga.score + '/10' : 'N/A'}
  Année: ${manga.year || 'N/A'}

📖 *Synopsis:* ${manga.synopsis ? manga.synopsis.substring(0, 150) + '...' : 'N/A'}

═════════════════════════════════════`;

        await sock.sendMessage(senderJid, { text: mangaMessage });

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération des données!' });
      }

    } catch (error) {
      console.error('Error in manga command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
