const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const MessageFormatter = require('../utils/messageFormatter');
const {
  downloadMedia,
  getInvokedCommand,
  getQuotedParticipant,
  getQuotedText,
  resolveMedia,
} = require('../utils/mediaMessages');
const config = require('../config');

function stickerOptions(pack = config.BOT_NAME, author = 'Bot', type = StickerTypes.FULL) {
  return {
    pack,
    author,
    type,
    categories: ['🤩', '🎉'],
    id: 'kassim-bot',
    quality: 70,
    background: 'transparent',
  };
}

async function sendSticker(sock, jid, message, input, options = {}) {
  const sticker = new Sticker(input, stickerOptions(
    options.pack || config.BOT_NAME,
    options.author || message.pushName || 'Bot',
    options.type || StickerTypes.FULL
  ));
  const stickerBuffer = await sticker.toBuffer();
  return sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: message });
}

async function uploadBufferToGraph(buffer, extension = '.jpg') {
  const tmpPath = path.join(os.tmpdir(), `tetsubot-${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`);
  await fs.promises.writeFile(tmpPath, buffer);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(tmpPath));
    const { data } = await axios.post('https://graph.org/upload', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });
    if (!data?.[0]?.src) throw new Error('Upload graph.org invalide');
    return `https://graph.org${data[0].src}`;
  } finally {
    await fs.promises.unlink(tmpPath).catch(() => null);
  }
}

function parsePackAuthor(args, fallback) {
  const raw = args.join(' ').trim();
  if (!raw) return { pack: fallback, author: fallback };

  if (raw.includes(',')) {
    const [pack, author] = raw.split(',').map((part) => part.trim());
    return {
      pack: pack || fallback,
      author: author || fallback,
    };
  }

  return { pack: raw, author: raw };
}

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick', 'steal', 'take', 'stickercrop', 'scrop', 'smeme', 'stickermeme', 'quote', 'q', 'emojimix'],
  category: 'UTILITY',
  cooldown: 5,
  description: 'Stickers avances: create, steal, crop, meme, quote, emojimix',
  usage: '!sticker | !steal pack,author | !smeme texte | !q texte | !emojimix 😎+🔥',

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX) || 'sticker';
    const pushName = message.pushName || config.BOT_NAME;

    try {
      switch (command) {
        case 'sticker':
        case 's':
        case 'stick':
          return await handleCreateSticker(sock, jid, message, pushName, StickerTypes.FULL);
        case 'stickercrop':
        case 'scrop':
          return await handleCreateSticker(sock, jid, message, pushName, StickerTypes.CROPPED);
        case 'steal':
        case 'take':
          return await handleSteal(sock, jid, message, args, pushName);
        case 'smeme':
        case 'stickermeme':
          return await handleStickerMeme(sock, jid, message, args, pushName);
        case 'quote':
        case 'q':
          return await handleQuote(sock, jid, message, args, pushName);
        case 'emojimix':
          return await handleEmojiMix(sock, jid, message, args, pushName);
        default:
          return await sock.sendMessage(jid, {
            text: MessageFormatter.warning('Commande sticker inconnue.'),
          }, { quoted: message });
      }
    } catch (error) {
      console.error('[STICKER] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Sticker impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};

async function handleCreateSticker(sock, jid, message, pushName, type) {
  const mediaInfo = resolveMedia(message);
  if (!mediaInfo || !['image', 'video', 'sticker'].includes(mediaInfo.mediaType)) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Reponds a une image/video/sticker avec !sticker.'),
    }, { quoted: message });
  }

  if (mediaInfo.mediaType === 'video' && Number(mediaInfo.media.seconds || 0) > 15) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('La video doit faire 15 secondes maximum.'),
    }, { quoted: message });
  }

  const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
  return sendSticker(sock, jid, message, buffer, {
    pack: config.BOT_NAME,
    author: pushName,
    type,
  });
}

async function handleSteal(sock, jid, message, args, pushName) {
  const mediaInfo = resolveMedia(message);
  if (!mediaInfo || mediaInfo.mediaType !== 'sticker') {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Reponds a un sticker avec !steal <pack,author>.'),
    }, { quoted: message });
  }

  const names = parsePackAuthor(args, pushName);
  const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
  return sendSticker(sock, jid, message, buffer, {
    pack: names.pack,
    author: names.author,
    type: StickerTypes.FULL,
  });
}

async function handleStickerMeme(sock, jid, message, args, pushName) {
  const text = args.join(' ').trim();
  if (!text) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !smeme <texte> en reponse a une image.'),
    }, { quoted: message });
  }

  const mediaInfo = resolveMedia(message);
  if (!mediaInfo || mediaInfo.mediaType !== 'image') {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Reponds a une image avec !smeme <texte>.'),
    }, { quoted: message });
  }

  const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
  const imageUrl = await uploadBufferToGraph(buffer, '.jpg');
  const memeUrl = `https://api.memegen.link/images/custom/-/${encodeURIComponent(text)}.png?background=${encodeURIComponent(imageUrl)}`;
  return sendSticker(sock, jid, message, memeUrl, {
    pack: config.BOT_NAME,
    author: pushName,
  });
}

async function handleQuote(sock, jid, message, args, pushName) {
  const quotedText = getQuotedText(message);
  const text = quotedText || args.join(' ').trim();
  if (!text) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !q <texte> ou reponds a un message avec !q.'),
    }, { quoted: message });
  }

  const quotedParticipant = getQuotedParticipant(message);
  const participantJid = quotedParticipant || message.key.participant || message.key.remoteJid;
  const avatar = await sock.profilePictureUrl(participantJid, 'image').catch(() => null);

  const quotePayload = {
    type: 'quote',
    format: 'png',
    backgroundColor: '#FFFFFF',
    width: 700,
    height: 580,
    scale: 2,
    messages: [{
      entities: [],
      avatar: Boolean(avatar),
      from: {
        id: 1,
        name: pushName,
        photo: { url: avatar || 'https://i.imgur.com/MClOeqe.jpeg' },
      },
      text,
      replyMessage: {},
    }],
  };

  const response = await axios.post('https://bot.lyo.su/quote/generate', quotePayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  const image = Buffer.from(response.data.result.image, 'base64');
  return sendSticker(sock, jid, message, image, {
    pack: config.BOT_NAME,
    author: pushName,
  });
}

async function handleEmojiMix(sock, jid, message, args, pushName) {
  const input = args[0] || '';
  const [emoji1, emoji2] = input.split('+');
  if (!emoji1 || !emoji2) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !emojimix 😎+🔥'),
    }, { quoted: message });
  }

  const tenorKey = process.env.TENOR_API_KEY || '';
  if (!tenorKey) throw new Error('TENOR_API_KEY manquant dans Railway.');
  const { data } = await axios.get(
    `https://tenor.googleapis.com/v2/featured?key=${tenorKey}&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`,
    { timeout: 20000 }
  );

  const imageUrl = data.results?.[0]?.url;
  if (!imageUrl) throw new Error('Aucun mix trouve pour ces emojis.');

  return sendSticker(sock, jid, message, imageUrl, {
    pack: config.BOT_NAME,
    author: pushName,
  });
}
