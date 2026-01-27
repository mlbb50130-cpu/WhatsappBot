const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'personnage',
  description: 'Infos sur un personnage anime',
  category: 'ANIME',
  usage: '!personnage [nom]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!args || args.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Utilise: !personnage [nom]' });
        return;
      }

      const characterName = args.join(' ');

      try {
        const response = await axios.get(`https://api.jikan.moe/v4/characters?query=${encodeURIComponent(characterName)}&limit=1`, {
          timeout: 10000
        });

        if (!response.data?.data || response.data.data.length === 0) {
          await sock.sendMessage(senderJid, { text: '❌ Personnage non trouvé!' });
          return;
        }

        const character = response.data.data[0];

        const charItems = [
          { label: '🇯🇵 Nom Japonais', value: character.name_kanji || 'N/A' },
          { label: '📝 Surnoms', value: character.nicknames ? character.nicknames.join(', ') : 'N/A' },
          { label: '❤️ Favori', value: (character.favorites || '0') + ' fois' },
          { label: '📖 Bio', value: character.about ? character.about.substring(0, 150) + '...' : 'Pas de bio' }
        ];

        const charMessage = MessageFormatter.elegantBox(`👤 ${character.name}`, charItems);
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(charMessage));

      } catch (apiError) {
        console.error('Jikan API error:', apiError.message);
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération des données!' });
        return;
      }
    } catch (error) {
      console.error('Error in personnage command:', error.message);
    }
  }
};
