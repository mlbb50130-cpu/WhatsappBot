const config = require('../config');
const DownloaderService = require('../services/downloaderService');

module.exports = {
  name: 'play',
  aliases: ['song', 'yt', 'ytmp3', 'mp3', 'ytmp4', 'video', 'mp4'],
  description: 'Telecharger audio/video YouTube',
  category: 'DOWNLOAD',
  usage: '!play <titre> | !mp3 <lien> | !mp4 <titre/lien>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args) {
    const commandName = DownloaderService.getInvokedCommand(message, config.PREFIX) || 'play';
    return DownloaderService.sendYoutubeCommand(
      sock,
      message,
      commandName,
      args.join(' '),
      config.PREFIX
    );
  },
};
