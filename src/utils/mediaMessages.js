const {
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
} = require('@whiskeysockets/baileys');

function getText(message) {
  const msg = message?.message || {};
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.documentMessage?.caption) return msg.documentMessage.caption;
  if (msg.documentWithCaptionMessage?.message) return getText({ message: msg.documentWithCaptionMessage.message });
  return '';
}

function getInvokedCommand(message, prefix = '!') {
  const text = getText(message).trim();
  if (!text.startsWith(prefix)) return '';
  return text.slice(prefix.length).trim().split(/\s+/).shift().toLowerCase();
}

function getContextInfo(message) {
  const msg = message?.message || {};
  return msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.audioMessage?.contextInfo ||
    msg.documentMessage?.contextInfo ||
    {};
}

function getQuotedMessage(message) {
  return getContextInfo(message).quotedMessage || null;
}

function getQuotedText(message) {
  const quoted = getQuotedMessage(message);
  if (!quoted) return '';
  if (quoted.conversation) return quoted.conversation;
  if (quoted.extendedTextMessage?.text) return quoted.extendedTextMessage.text;
  if (quoted.imageMessage?.caption) return quoted.imageMessage.caption;
  if (quoted.videoMessage?.caption) return quoted.videoMessage.caption;
  if (quoted.documentMessage?.caption) return quoted.documentMessage.caption;
  if (quoted.documentWithCaptionMessage?.message) {
    return getText({ message: quoted.documentWithCaptionMessage.message });
  }
  return '';
}

function getQuotedParticipant(message) {
  return getContextInfo(message).participant || '';
}

function normalizeContent(rawMessage) {
  if (!rawMessage) return null;
  const type = getContentType(rawMessage);
  if (!type) return null;

  if (type === 'documentWithCaptionMessage' && rawMessage[type]?.message) {
    return normalizeContent(rawMessage[type].message);
  }

  if (
    type === 'viewOnceMessage' ||
    type === 'viewOnceMessageV2' ||
    type === 'viewOnceMessageV2Extension'
  ) {
    const extracted = extractMessageContent(rawMessage);
    const mediaType = getContentType(extracted);
    return {
      raw: extracted,
      type: mediaType,
      content: extracted?.[mediaType],
      isViewOnce: true,
    };
  }

  return {
    raw: rawMessage,
    type,
    content: rawMessage[type],
    isViewOnce: Boolean(rawMessage[type]?.viewOnce),
  };
}

function resolveMedia(message, preferQuoted = true) {
  const quoted = preferQuoted ? getQuotedMessage(message) : null;
  const normalized = normalizeContent(quoted || message?.message);
  if (!normalized?.content) return null;

  const { type, content } = normalized;
  let streamType = null;
  if (type === 'imageMessage') streamType = 'image';
  if (type === 'videoMessage') streamType = 'video';
  if (type === 'stickerMessage') streamType = 'sticker';
  if (type === 'audioMessage') streamType = 'audio';
  if (type === 'documentMessage') streamType = 'document';

  if (!streamType) return null;

  return {
    ...normalized,
    media: content,
    mediaType: streamType,
    isQuoted: Boolean(quoted),
    caption: content.caption || '',
    mimetype: content.mimetype || '',
  };
}

async function downloadMedia(media, mediaType) {
  const stream = await downloadContentFromMessage(media, mediaType);
  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  if (!buffer.length) {
    throw new Error('Media vide ou expire.');
  }

  return buffer;
}

module.exports = {
  getText,
  getInvokedCommand,
  getContextInfo,
  getQuotedMessage,
  getQuotedText,
  getQuotedParticipant,
  resolveMedia,
  downloadMedia,
};
