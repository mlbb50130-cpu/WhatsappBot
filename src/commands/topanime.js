const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'topanime',
  description: 'Affiche le top 10 des meilleurs animes',
  category: 'ANIME',
  usage: '!topanime',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10', {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: MessageFormatter.error('Impossible de récupérer le top!') });
          return;
        }

        let topMessage = ``;

        response.data.data.forEach((anime, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          topMessage += `${medal} *${anime.title}* (${anime.score}/10)\n`;
        });

        topMessage += `\n💡 Utilise \`!anime [nom]\` pour plus d'infos!`;

        const fullMessage = MessageFormatter.box('🏆 TOP 10 DES MEILLEURS ANIMES 🏆', topMessage);
        await sock.sendMessage(senderJid, { text: fullMessage });

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur lors de la récupération!') });
        return;
      }
    } catch (error) {
      console.error('Error in topanime command:', error.message);
    }
  }
};
