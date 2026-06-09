const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');
const MessageFormatter = require('../utils/messageFormatter');

function tmpFile(ext = '') {
  const suffix = ext.startsWith('.') ? ext : `.${ext}`;
  return path.join(os.tmpdir(), `tetsubot-${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`);
}

async function withTempFile(buffer, ext, fn) {
  const file = tmpFile(ext);
  await fs.promises.writeFile(file, buffer);
  try {
    return await fn(file);
  } finally {
    await fs.promises.unlink(file).catch(() => null);
  }
}

function runFfmpeg(input, output, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-i', input, ...args, output], {
      windowsHide: true,
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(stderr.split('\n').slice(-4).join(' ').trim() || `ffmpeg exit ${code}`));
        return;
      }

      try {
        resolve(await fs.promises.readFile(output));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function convertWithFfmpeg(buffer, inputExt, outputExt, args) {
  return withTempFile(buffer, inputExt, async (input) => {
    const output = tmpFile(outputExt);
    try {
      return await runFfmpeg(input, output, args);
    } finally {
      await fs.promises.unlink(output).catch(() => null);
    }
  });
}

async function stickerToImage(buffer) {
  try {
    return await sharp(buffer).png().toBuffer();
  } catch {
    return convertWithFfmpeg(buffer, '.webp', '.png', []);
  }
}

async function webpToMp4Local(buffer) {
  return convertWithFfmpeg(buffer, '.webp', '.mp4', [
    '-movflags',
    'faststart',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    'scale=trunc(iw/2)*2:trunc(ih/2)*2',
  ]);
}

async function mediaToMp3(buffer, inputExt = '.mp4') {
  return convertWithFfmpeg(buffer, inputExt, '.mp3', [
    '-vn',
    '-ac',
    '2',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-f',
    'mp3',
  ]);
}

function imageToPdf(buffer) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ autoFirstPage: false });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.addPage({ size: 'A4', margin: 24 });
    doc.image(buffer, 24, 24, {
      fit: [547, 794],
      align: 'center',
      valign: 'center',
    });
    doc.end();
  });
}

async function uploadToCatbox(buffer, filename = 'file.bin') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, { filename });

  const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 60000,
  });

  if (!/^https?:\/\//i.test(String(data))) {
    throw new Error('Upload Catbox refuse.');
  }

  return String(data).trim();
}

async function qrBuffer(text) {
  return QRCode.toBuffer(text, {
    type: 'png',
    margin: 2,
    width: 800,
    errorCorrectionLevel: 'M',
  });
}

function mediaExtension(mediaInfo) {
  const mime = mediaInfo?.mimetype || '';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('png')) return '.png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('mp4')) return '.mp4';
  if (mime.includes('mpeg')) return '.mp3';
  if (mime.includes('ogg')) return '.ogg';
  return `.${mediaInfo?.mediaType || 'bin'}`;
}

function assertMedia(mediaInfo, allowed, usage) {
  if (!mediaInfo || !allowed.includes(mediaInfo.mediaType)) {
    throw new Error(usage);
  }
}

function converterError(error) {
  return MessageFormatter.error(`Conversion impossible: ${error.message}`);
}

module.exports = {
  assertMedia,
  converterError,
  imageToPdf,
  mediaExtension,
  mediaToMp3,
  qrBuffer,
  stickerToImage,
  uploadToCatbox,
  webpToMp4Local,
};
