const axios = require('axios');
const FormData = require('form-data');
const MessageFormatter = require('../utils/messageFormatter');
const { downloadMedia, getInvokedCommand, resolveMedia } = require('../utils/mediaMessages');
const config = require('../config');

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function calcExpression(expression) {
  const value = String(expression || '').trim();
  if (!value || !/^[0-9+\-*/().,%\s]+$/.test(value)) {
    throw new Error('Expression invalide.');
  }

  // Calculator only: restricted character set above prevents identifiers/calls.
  return Function(`"use strict"; return (${value});`)();
}

module.exports = {
  name: 'tools',
  aliases: ['hd', 'upscale', 'upscalehd', 'calc', 'calculate', 'html', 'gethtml', 'shorturl', 'short', 'tinyurl'],
  description: 'Outils Atlas: upscale, calcul, HTML, short URL',
  category: 'TOOLS',
  usage: '!hd | !calc 2+2 | !html site.com | !shorturl https://...',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX);
    const text = args.join(' ').trim();

    try {
      if (['hd', 'upscale', 'upscalehd'].includes(command)) {
        return handleUpscale(sock, jid, message);
      }

      if (['calc', 'calculate'].includes(command)) {
        if (!text) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !calc 2+2') }, { quoted: message });
        }

        const result = calcExpression(text);
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Calcul',
            fields: [
              { label: 'Expression', value: text },
              { label: 'Resultat', value: String(result) },
            ],
          }),
        }, { quoted: message });
      }

      if (['html', 'gethtml'].includes(command)) {
        return handleHtml(sock, jid, message, text);
      }

      if (['shorturl', 'short', 'tinyurl'].includes(command)) {
        return handleShortUrl(sock, jid, message, text);
      }

      return sock.sendMessage(jid, { text: MessageFormatter.warning('Outil inconnu.') }, { quoted: message });
    } catch (error) {
      console.error('[TOOLS] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Outil impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};

async function handleUpscale(sock, jid, message) {
  const mediaInfo = resolveMedia(message);
  if (!mediaInfo || !['image', 'sticker'].includes(mediaInfo.mediaType)) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Reponds a une image avec !hd.'),
    }, { quoted: message });
  }

  const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
  const isWebp = mediaInfo.mediaType === 'sticker' || mediaInfo.mimetype.includes('webp');
  const form = new FormData();
  form.append('image', buffer, {
    filename: isWebp ? 'image.webp' : 'image.jpg',
    contentType: isWebp ? 'image/webp' : 'image/jpeg',
  });
  form.append('scale', '2');

  const { data } = await axios.post('https://api2.pixelcut.app/image/upscale/v1', form, {
    headers: {
      ...form.getHeaders(),
      accept: 'application/json',
      'x-client-version': 'web',
      'x-locale': 'en',
    },
    timeout: 60000,
  });

  if (!data?.result_url) throw new Error('Upscale API failed');
  return sock.sendMessage(jid, {
    image: { url: data.result_url },
    caption: MessageFormatter.success('Image amelioree.'),
  }, { quoted: message });
}

async function handleHtml(sock, jid, message, text) {
  if (!text) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !html example.com ou !html --txt example.com'),
    }, { quoted: message });
  }

  const asText = text.startsWith('--txt ');
  const target = normalizeUrl(asText ? text.replace(/^--txt\s+/i, '') : text);
  const parsed = new URL(target);

  const { data } = await axios.get(target, {
    headers: {
      'User-Agent': `Mozilla/5.0 (compatible; ${config.BOT_NAME}/1.0)`,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 20000,
    responseType: 'text',
  });

  const buffer = Buffer.from(String(data || ''), 'utf8');
  return sock.sendMessage(jid, {
    document: buffer,
    fileName: `${parsed.hostname}.${asText ? 'txt' : 'html'}`,
    mimetype: asText ? 'text/plain' : 'text/html',
  }, { quoted: message });
}

async function handleShortUrl(sock, jid, message, text) {
  if (!text) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !shorturl https://example.com'),
    }, { quoted: message });
  }

  const target = normalizeUrl(text);
  const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
  const shortUrl = await response.text();
  if (!shortUrl || !/^https?:\/\//i.test(shortUrl)) throw new Error('TinyURL a refuse le lien.');

  return sock.sendMessage(jid, {
    text: MessageFormatter.panel({
      title: 'Short URL',
      fields: [
        { label: 'Original', value: target },
        { label: 'Court', value: shortUrl },
      ],
    }),
  }, { quoted: message });
}
