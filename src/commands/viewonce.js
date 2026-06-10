const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const {
  downloadMedia,
  getInvokedCommand,
  resolveMedia,
} = require('../utils/mediaMessages');

module.exports = {
  name: 'viewonce',
  aliases: ['vo', 'vonce', 'revive', 'antiviewonce'],
  description: 'Envoyer en vue unique ou recuperer un media view-once',
  category: 'FUN',
  usage: '!viewonce | !revive en reponse a une image/video',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message) {
    const jid = message.key.remoteJid;
    const commandName = getInvokedCommand(message, config.PREFIX);
    const isRevive = commandName === 'revive' || commandName === 'antiviewonce';

    try {
      const mediaInfo = resolveMedia(message);

      if (!mediaInfo || !['image', 'video'].includes(mediaInfo.mediaType)) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning('Reponds a une image/video avec !viewonce ou !revive.'),
        }, { quoted: message });
      }

      const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
      const caption = isRevive
        ? MessageFormatter.success(mediaInfo.caption || 'View-once recupere.')
        : mediaInfo.caption;

      if (mediaInfo.mediaType === 'image') {
        return sock.sendMessage(jid, {
          image: buffer,
          caption,
          mimetype: mediaInfo.mimetype || 'image/jpeg',
          viewOnce: !isRevive,
        }, { quoted: message });
      }

      return sock.sendMessage(jid, {
        video: buffer,
        caption,
        mimetype: mediaInfo.mimetype || 'video/mp4',
        viewOnce: !isRevive,
      }, { quoted: message });
    } catch (error) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Media impossible a recuperer. Il est peut-etre expire.'),
      }, { quoted: message });
    }
  },
};
