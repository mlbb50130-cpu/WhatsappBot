const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const MediaSearch = require('../services/mediaSearchService');
const { getInvokedCommand } = require('../utils/mediaMessages');

module.exports = {
  name: 'search',
  aliases: ['google', 'lyrics', 'yts', 'youtubesearch', 'ringtone', 'stickersearch', 'getsticker', 'weather', 'github', 'gh', 'wallpaper', 'wall', 'wikipedia', 'wiki'],
  description: 'Recherches Atlas: Google, lyrics, YouTube, meteo, GitHub, Wiki, wallpapers',
  category: 'SEARCH',
  usage: '!google <texte> | !wiki <texte> | !weather <ville> | !github <user>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX) || 'search';
    const text = args.join(' ').trim();

    try {
      switch (command) {
        case 'google':
        case 'search':
          return MediaSearch.sendGoogleSearch(sock, jid, message, text);
        case 'lyrics':
          return MediaSearch.sendLyrics(sock, jid, message, text);
        case 'yts':
        case 'youtubesearch':
          return MediaSearch.sendYoutubeSearch(sock, jid, message, text);
        case 'ringtone':
          return MediaSearch.sendRingtone(sock, jid, message, text);
        case 'stickersearch':
        case 'getsticker':
          return MediaSearch.sendStickerSearch(sock, jid, message, text, message.pushName || config.BOT_NAME);
        case 'weather':
          return MediaSearch.sendWeather(sock, jid, message, text);
        case 'github':
        case 'gh':
          return MediaSearch.sendGithub(sock, jid, message, text);
        case 'wallpaper':
        case 'wall':
          return MediaSearch.sendWallpaper(sock, jid, message, text);
        case 'wikipedia':
        case 'wiki':
          return MediaSearch.sendWiki(sock, jid, message, text);
        default:
          return sock.sendMessage(jid, {
            text: MessageFormatter.warning('Recherche inconnue.'),
          }, { quoted: message });
      }
    } catch (error) {
      console.error('[SEARCH] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Recherche impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};
