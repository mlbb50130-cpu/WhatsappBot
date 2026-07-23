const path = require('path');
const { resolveMedia, downloadMedia } = require('./mediaMessages');

const configuredMaxBytes = Number.parseInt(process.env.CODEX_ATTACHMENT_MAX_BYTES, 10);
const MAX_ATTACHMENT_BYTES = Number.isFinite(configuredMaxBytes) && configuredMaxBytes > 0
  ? configuredMaxBytes
  : 512 * 1024;

const TEXT_EXTENSIONS = new Set([
  'asm', 'bash', 'c', 'cc', 'cfg', 'cjs', 'cob', 'cpp', 'cs', 'css', 'csv',
  'cxx', 'dart', 'env', 'f90', 'go', 'groovy', 'h', 'hpp', 'htm', 'html',
  'ini', 'java', 'js', 'json', 'jsx', 'kt', 'kts', 'less', 'log', 'lua', 'm',
  'md', 'mjs', 'php', 'pl', 'properties', 'ps1', 'py', 'r', 'rb', 'rs', 'sass',
  'scala', 'scss', 'sh', 'sol', 'sql', 'svelte', 'swift', 'toml', 'ts', 'tsx',
  'txt', 'vue', 'xml', 'yaml', 'yml', 'zsh',
]);

const TEXT_MIMETYPES = new Set([
  'application/javascript',
  'application/json',
  'application/sql',
  'application/toml',
  'application/xml',
  'application/x-httpd-php',
  'application/x-javascript',
  'application/x-sh',
  'application/yaml',
]);

const EXTENSION_BY_MIMETYPE = new Map([
  ['application/javascript', 'js'],
  ['application/json', 'json'],
  ['application/sql', 'sql'],
  ['application/xml', 'xml'],
  ['application/yaml', 'yaml'],
  ['text/css', 'css'],
  ['text/csv', 'csv'],
  ['text/html', 'html'],
  ['text/javascript', 'js'],
  ['text/markdown', 'md'],
  ['text/plain', 'txt'],
  ['text/typescript', 'ts'],
  ['text/xml', 'xml'],
]);

function fileExtension(fileName) {
  return path.extname(String(fileName || '')).slice(1).toLowerCase();
}

function isTextFile(fileName, mimetype) {
  const normalizedMime = String(mimetype || '').split(';')[0].trim().toLowerCase();
  return TEXT_EXTENSIONS.has(fileExtension(fileName))
    || normalizedMime.startsWith('text/')
    || TEXT_MIMETYPES.has(normalizedMime);
}

function inferredFileName(fileName, mimetype) {
  const safeName = path.basename(String(fileName || ''))
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[.-]+/, '')
    .slice(0, 120);
  if (safeName) return safeName;

  const normalizedMime = String(mimetype || '').split(';')[0].trim().toLowerCase();
  const extension = EXTENSION_BY_MIMETYPE.get(normalizedMime) || 'txt';
  return `piece-jointe.${extension}`;
}

function numericFileLength(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function decodeTextBuffer(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString('utf16le');
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.from(buffer.subarray(2));
    swapped.swap16();
    return swapped.toString('utf16le');
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (sample.includes(0)) {
    throw new Error('Le fichier joint semble binaire. Codex accepte ici uniquement les fichiers texte ou code.');
  }

  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  if (replacementCount > Math.max(3, Math.floor(text.length * 0.01))) {
    throw new Error('Encodage du fichier non reconnu. Utilise UTF-8 ou UTF-16.');
  }
  return text;
}

function parseTextAttachment(mediaInfo, buffer) {
  const media = mediaInfo?.media || {};
  const fileName = inferredFileName(media.fileName, mediaInfo?.mimetype);
  const mimetype = mediaInfo?.mimetype || media.mimetype || 'text/plain';

  if (mediaInfo?.mediaType !== 'document') {
    throw new Error('Reponds a un document texte/code ou joins-le directement a la commande !codex.');
  }
  if (!isTextFile(fileName, mimetype)) {
    throw new Error(`Type de fichier non pris en charge: ${fileName} (${mimetype}).`);
  }
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Fichier trop volumineux (${buffer.length} octets). Limite Codex: ${MAX_ATTACHMENT_BYTES} octets.`,
    );
  }

  const text = decodeTextBuffer(buffer);
  if (!text.trim()) throw new Error('Le fichier joint est vide.');

  return {
    fileName,
    mimetype,
    size: buffer.length,
    text,
  };
}

async function readTextAttachment(message) {
  const mediaInfo = resolveMedia(message, true);
  if (!mediaInfo) return null;

  const announcedLength = numericFileLength(mediaInfo.media?.fileLength);
  if (announcedLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Fichier trop volumineux (${announcedLength} octets). Limite Codex: ${MAX_ATTACHMENT_BYTES} octets.`,
    );
  }

  if (mediaInfo.mediaType !== 'document') {
    throw new Error('Codex lit actuellement les documents texte/code, pas les images, videos ou fichiers audio.');
  }

  const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
  return parseTextAttachment(mediaInfo, buffer);
}

module.exports = {
  MAX_ATTACHMENT_BYTES,
  decodeTextBuffer,
  isTextFile,
  parseTextAttachment,
  readTextAttachment,
};
