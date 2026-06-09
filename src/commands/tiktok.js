const config = require('../config');
const DownloaderService = require('../services/downloaderService');

module.exports = {
  name: 'tiktok',
  aliases: ['ttdl', 'tt'],
  description: 'Telecharger ou rechercher une video TikTok',
  category: 'DOWNLOAD',
  usage: '!tt <lien/recherche>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 8,

  async execute(sock, message, args) {
    return DownloaderService.sendTikTokCommand(
      sock,
      message,
      args.join(' '),
      config.PREFIX
    );
  },
};
