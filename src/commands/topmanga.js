const axios = require('axios');

module.exports = {
  name: 'topmanga',
  description: 'Affiche le top 10 des meilleurs mangas',
  category: 'ANIME',
  usage: '!topmanga',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/manga?limit=10', {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: '❌ Impossible de récupérer le top!' });
          return;
        }

        let topMessage = `
╔════════════════════════════════════╗
║     🏆 TOP 10 DES MEILLEURS 🏆   ║
║           MANGAS 📚              ║
╚════════════════════════════════════╝

`;

        response.data.data.forEach((manga, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          topMessage += `${medal} *${manga.title}* (${manga.score}/10)\n`;
        });

        topMessage += `
═════════════════════════════════════
💡 Utilise \`!manga [nom]\` pour plus d'infos!`;

        await sock.sendMessage(senderJid, { text: topMessage });

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération!' });
        return;
      }
    } catch (error) {
      console.error('Error in topmanga command:', error.message);
    }
  }
};
