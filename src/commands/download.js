const config = require('../config');
const DownloaderService = require('../services/downloaderService');

module.exports = {
  name: 'download',
  aliases: [
    'dl',
    'fb',
    'facebook',
    'ig',
    'insta',
    'instagram',
    'mf',
    'mediafire',
    'mg',
    'mega',
    'sf',
    'sfile',
    'sp',
    'spotify',
    'th',
    'threads',
    'tw',
    'twitter',
    'x',
    'vd',
    'videy',
  ],
  description: 'Telecharger un media depuis les plateformes supportees',
  category: 'DOWNLOAD',
  usage: '!dl <url> | !fb <url> | !ig <url> | !tw <url>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 8,

  async execute(sock, message, args) {
    return await DownloaderService.sendUniversalDownload(
      sock,
      message,
      args.join(' '),
      config.PREFIX
    );
  },
};
