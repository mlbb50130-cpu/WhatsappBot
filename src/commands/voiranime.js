const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'voiranime',
  description: 'Récupérer un épisode d\'un anime',
  category: 'FUN',
  usage: '!voiranime <nom> <épisode>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    await sock.sendMessage(senderJid, {
      text: '⚠️ Cette commande est temporairement désactivée.\n\n' +
            'Pour regarder des animes, visitez:\n' +
            '🔗 VoirAnime: https://www.voiranime.com\n' +
            '🔗 AnimeFlv: https://www3.animeflv.net\n\n' +
            '📊 Utilisez `!anime <nom>` pour chercher sur AniList'
    });
  }
};

