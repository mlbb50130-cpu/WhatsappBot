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
          return await MediaSearch.sendGoogleSearch(sock, jid, message, text);
        case 'lyrics':
          return await MediaSearch.sendLyrics(sock, jid, message, text);
        case 'yts':
        case 'youtubesearch':
          return await MediaSearch.sendYoutubeSearch(sock, jid, message, text);
        case 'ringtone':
          return await MediaSearch.sendRingtone(sock, jid, message, text);
        case 'stickersearch':
        case 'getsticker':
          return await MediaSearch.sendStickerSearch(sock, jid, message, text, message.pushName || config.BOT_NAME);
        case 'weather':
          return await MediaSearch.sendWeather(sock, jid, message, text);
        case 'github':
        case 'gh':
          return await MediaSearch.sendGithub(sock, jid, message, text);
        case 'wallpaper':
        case 'wall':
          return await MediaSearch.sendWallpaper(sock, jid, message, text);
        case 'wikipedia':
        case 'wiki':
          return await MediaSearch.sendWiki(sock, jid, message, text);
        default:
          return await sock.sendMessage(jid, {
            text: MessageFormatter.warning('Recherche inconnue.'),
          }, { quoted: message });
      }
    } catch (error) {
      return await sock.sendMessage(jid, {
        text: MessageFormatter.publicError('Recherche impossible', error),
      }, { quoted: message });
    }
  },
};
