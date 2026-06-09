const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const { downloadMedia, getInvokedCommand, resolveMedia } = require('../utils/mediaMessages');
const Converter = require('../services/converterService');

module.exports = {
  name: 'converter',
  aliases: ['toimg', 'toimage', 'togif', 'tomp4', 'tomp3', 'toaudio', 'tourl', 'topdf', 'imgtopdf', 'toqr'],
  description: 'Convertisseurs Atlas: sticker, audio, PDF, QR, URL',
  category: 'TOOLS',
  usage: '!toimg | !tomp4 | !tomp3 | !tourl | !topdf | !toqr <texte>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 8,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX) || 'converter';
    const text = args.join(' ').trim();

    try {
      if (command === 'toqr') {
        if (!text) {
          return sock.sendMessage(jid, {
            text: MessageFormatter.warning('Utilise: !toqr <texte ou url>'),
          }, { quoted: message });
        }

        const image = await Converter.qrBuffer(text);
        return sock.sendMessage(jid, {
          image,
          caption: MessageFormatter.panel({
            title: 'QR Code',
            fields: [{ label: 'Source', value: MessageFormatter.limitText(text, 3, 300) }],
          }),
        }, { quoted: message });
      }

      const mediaInfo = resolveMedia(message);
      const buffer = mediaInfo ? await downloadMedia(mediaInfo.media, mediaInfo.mediaType) : null;

      if (['toimg', 'toimage'].includes(command)) {
        Converter.assertMedia(mediaInfo, ['sticker'], 'Reponds a un sticker non anime avec !toimg.');
        const image = await Converter.stickerToImage(buffer);
        return sock.sendMessage(jid, {
          image,
          caption: MessageFormatter.success('Sticker converti en image.'),
        }, { quoted: message });
      }

      if (['tomp4', 'togif'].includes(command)) {
        Converter.assertMedia(mediaInfo, ['sticker'], `Reponds a un sticker anime avec !${command}.`);
        const video = await Converter.webpToMp4Local(buffer);
        return sock.sendMessage(jid, {
          video,
          gifPlayback: command === 'togif',
          caption: MessageFormatter.success(command === 'togif' ? 'Sticker converti en GIF.' : 'Sticker converti en video.'),
          mimetype: 'video/mp4',
        }, { quoted: message });
      }

      if (['tomp3', 'toaudio'].includes(command)) {
        Converter.assertMedia(mediaInfo, ['video', 'audio'], `Reponds a une video/audio avec !${command}.`);
        const audio = await Converter.mediaToMp3(buffer, Converter.mediaExtension(mediaInfo));
        const payload = command === 'tomp3'
          ? { document: audio, mimetype: 'audio/mpeg', fileName: 'converted.mp3' }
          : { audio, mimetype: 'audio/mpeg' };
        return sock.sendMessage(jid, payload, { quoted: message });
      }

      if (['topdf', 'imgtopdf'].includes(command)) {
        Converter.assertMedia(mediaInfo, ['image'], `Reponds a une image avec !${command}.`);
        const pdf = await Converter.imageToPdf(buffer);
        return sock.sendMessage(jid, {
          document: pdf,
          mimetype: 'application/pdf',
          fileName: 'image.pdf',
        }, { quoted: message });
      }

      if (command === 'tourl') {
        Converter.assertMedia(mediaInfo, ['image', 'video', 'audio', 'document', 'sticker'], 'Reponds a un media avec !tourl.');
        const url = await Converter.uploadToCatbox(buffer, `tetsubot${Converter.mediaExtension(mediaInfo)}`);
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Media URL',
            fields: [{ label: 'Lien', value: url }],
          }),
        }, { quoted: message });
      }

      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Convertisseur inconnu.'),
      }, { quoted: message });
    } catch (error) {
      console.error('[CONVERTER] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: Converter.converterError(error),
      }, { quoted: message });
    }
  },
};
