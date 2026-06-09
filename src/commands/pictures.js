const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const MediaSearch = require('../services/mediaSearchService');
const { getInvokedCommand } = require('../utils/mediaMessages');

module.exports = {
  name: 'image',
  aliases: ['gig', 'gimage', 'googleimage', 'ppcouple', 'couplepp', 'gifsearch', 'gif', 'pin', 'pinterest'],
  description: 'Recherche images, GIF, Pinterest et couple PP',
  category: 'MEDIA',
  usage: '!image <recherche> | !gif <recherche> | !pin <recherche> | !couplepp',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX) || 'image';
    const text = args.join(' ').trim();

    try {
      if (['ppcouple', 'couplepp'].includes(command)) {
        return MediaSearch.sendCouplePp(sock, jid, message);
      }
      if (['gif', 'gifsearch'].includes(command)) {
        return MediaSearch.sendGifSearch(sock, jid, message, text);
      }
      if (['pin', 'pinterest'].includes(command)) {
        return MediaSearch.sendImageSearch(sock, jid, message, text, true);
      }
      return MediaSearch.sendImageSearch(sock, jid, message, text, false);
    } catch (error) {
      console.error('[PICTURES] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Recherche media impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};
