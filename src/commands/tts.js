const tts = require('google-tts-api');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const { getInvokedCommand, getQuotedText } = require('../utils/mediaMessages');

const LANGS = {
  say: 'en',
  speak: 'en',
  tts: 'en',
  saybengali: 'bn',
  saybangla: 'bn',
  sayhindi: 'hi',
  sayja: 'ja',
  sayjapanese: 'ja',
  saykorean: 'ko',
  saychinese: 'zh-TW',
  sayindo: 'id',
  sayindonesian: 'id',
};

module.exports = {
  name: 'tts',
  aliases: [
    'say',
    'speak',
    'saybengali',
    'saybangla',
    'sayhindi',
    'sayja',
    'sayjapanese',
    'saykorean',
    'saychinese',
    'sayindo',
    'sayindonesian',
  ],
  description: 'Convertir un texte en audio vocal',
  category: 'TOOLS',
  usage: '!say <texte> | !sayhindi <texte> | !sayjapanese <texte>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX) || 'tts';
    const text = (getQuotedText(message) || args.join(' ')).trim();

    if (!text) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning(`Utilise: ${config.PREFIX}say <texte>`),
      }, { quoted: message });
    }

    try {
      await sock.sendPresenceUpdate('recording', jid).catch(() => null);
      const lang = LANGS[command] || 'en';
      const urls = tts.getAllAudioUrls(MessageFormatter.limitText(text, 6, 180), {
        lang,
        slow: false,
        host: 'https://translate.google.com',
        splitPunct: ',.?!',
      });

      const url = urls?.[0]?.url || tts.getAudioUrl(text, { lang, slow: false });
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      return sock.sendMessage(jid, {
        audio: { url },
        mimetype: 'audio/mpeg',
        ptt: false,
      }, { quoted: message });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      return sock.sendMessage(jid, {
        text: MessageFormatter.publicError('TTS impossible', error),
      }, { quoted: message });
    }
  },
};
