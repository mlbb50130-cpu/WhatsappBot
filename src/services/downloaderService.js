const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

const TT = /(?<!\S)https?:\/\/(www\.)?(vm\.|vt\.|m\.)?tiktok\.com\/[^\s]+(?=\s|$)/gi;
const IG = /https?:\/\/(www\.)?instagram\.com\/[^\s]+/gi;
const MF = /(?<!\S)https?:\/\/(www\.)?mediafire\.com\/\S+(?=\s|$)/gi;
const PIN = /https?:\/\/(www\.)?(pinterest\.(com|fr|de|co\.uk|jp|ru|ca|it|com\.au|com\.mx|com\.br|es|pl)|pin\.it)\/[^\s]+/gi;
const FB = /(?<!\S)https?:\/\/(www\.|m\.|web\.)?facebook\.com\/[^\s]+(?=\s|$)/gi;
const TW = /(?<!\S)https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\s]+(?=\s|$)/gi;
const VD = /https?:\/\/(www\.)?videy\.co\/[^\s]+/gi;
const TH = /https?:\/\/(www\.)?threads\.(net|com)\/[^\s]+/gi;
const MG = /https?:\/\/mega\.nz\/[^\s]+/gi;
const SC = /(?<!\S)https?:\/\/(www\.|on\.)?soundcloud\.com\/[^\s]+(?=\s|$)/gi;
const SP = /https?:\/\/open\.spotify\.com\/[^\s]+/gi;
const YT = /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)[^\s]+/gi;
const SF = /https?:\/\/sfile\.co\/[^\s]+/gi;
const YT_REGEX = /^(https?:\/\/)?((www|m|music)\.)?(youtube(-nocookie)?\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]+(\S+)?$/i;

function getTextFromMessage(message) {
  const msg = message?.message || {};
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  return '';
}

function getQuotedText(message) {
  const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return '';
  if (quoted.conversation) return quoted.conversation;
  if (quoted.extendedTextMessage?.text) return quoted.extendedTextMessage.text;
  if (quoted.imageMessage?.caption) return quoted.imageMessage.caption;
  if (quoted.videoMessage?.caption) return quoted.videoMessage.caption;
  return '';
}

function getInvokedCommand(message, prefix = '!') {
  const text = getTextFromMessage(message).trim();
  if (!text.startsWith(prefix)) return '';
  return text.slice(prefix.length).trim().split(/\s+/).shift().toLowerCase();
}

function cleanMatch(match) {
  return match?.[0]?.replace(/[.,!?]$/, '');
}

function extractSupportedUrl(text) {
  if (!text) return null;

  let match = text.match(TT);
  if (match) return { type: 'tt', url: cleanMatch(match) };
  match = text.match(IG);
  if (match && !cleanMatch(match).includes('/stories/')) return { type: 'ig', url: cleanMatch(match) };
  match = text.match(PIN);
  if (match) return { type: 'pin', url: cleanMatch(match) };
  match = text.match(FB);
  if (match) {
    const url = cleanMatch(match);
    if (!url.includes('/login') && !url.includes('/dialog') && !url.includes('/plugins/')) {
      return { type: 'fb', url };
    }
  }
  match = text.match(TW);
  if (match) return { type: 'tw', url: cleanMatch(match) };
  match = text.match(VD);
  if (match) return { type: 'vd', url: cleanMatch(match) };
  match = text.match(TH);
  if (match) return { type: 'th', url: cleanMatch(match) };
  match = text.match(MG);
  if (match) return { type: 'mg', url: cleanMatch(match) };
  match = text.match(SC);
  if (match) return { type: 'sc', url: cleanMatch(match) };
  match = text.match(SP);
  if (match) return { type: 'sp', url: cleanMatch(match) };
  match = text.match(YT);
  if (match) return { type: 'yt', url: cleanMatch(match) };
  match = text.match(SF);
  if (match) return { type: 'sf', url: cleanMatch(match) };
  match = text.match(MF);
  if (match) return { type: 'mf', url: cleanMatch(match) };

  return null;
}

async function sendText(sock, jid, message, text) {
  return sock.sendMessage(jid, { text }, { quoted: message });
}

async function sendUsage(sock, jid, message, prefix = '!') {
  return sendText(sock, jid, message, MessageFormatter.panel({
    title: 'Downloader',
    body: [
      `Usage: ${prefix}dl <url>`,
      'Supporte TikTok, Instagram, Pinterest, Facebook, X/Twitter, Threads, Videy, Mega, SoundCloud, Spotify, YouTube, Sfile, MediaFire.',
      'Tu peux aussi repondre a un message contenant un lien.',
    ],
  }));
}

async function sendUniversalDownload(sock, message, raw, prefix = '!') {
  const jid = message.key.remoteJid;
  const input = String(raw || getQuotedText(message) || '').trim();
  if (!input) return sendUsage(sock, jid, message, prefix);

  const detected = extractSupportedUrl(input);
  if (!detected) {
    return sendText(sock, jid, message, MessageFormatter.warning('Lien non supporte ou invalide.'));
  }

  try {
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    switch (detected.type) {
      case 'tt':
        return await sendTikTokUrl(sock, message, detected.url);
      case 'ig':
        return await sendInstagram(sock, message, detected.url);
      case 'pin':
        return await sendPinterest(sock, message, detected.url);
      case 'fb':
        return await sendFacebook(sock, message, detected.url);
      case 'tw':
        return await sendTwitter(sock, message, detected.url);
      case 'vd':
        return await sendVidey(sock, message, detected.url);
      case 'mf':
        return await sendMediaFire(sock, message, detected.url);
      case 'th':
        return await sendThreads(sock, message, detected.url);
      case 'mg':
        return await sendMega(sock, message, detected.url);
      case 'sc':
        return await sendSoundCloud(sock, message, detected.url);
      case 'sp':
        return await sendSpotify(sock, message, detected.url);
      case 'yt':
        return await sendYoutubeAudioFromUrl(sock, message, detected.url);
      case 'sf':
        return await sendSfile(sock, message, detected.url);
      default:
        return await sendText(sock, jid, message, MessageFormatter.warning('Plateforme non supportee.'));
    }
  } catch (error) {
    return await sendText(sock, jid, message, MessageFormatter.publicError('Telechargement impossible', error));
  } finally {
    await sock.sendPresenceUpdate('paused', jid).catch(() => null);
  }
}

async function sendTikTokUrl(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (data.code !== 0 || !data.data) throw new Error(data.msg || 'TikTok API error');

  if (Array.isArray(data.data.images) && data.data.images.length > 0) {
    for (const image of data.data.images.slice(0, 10)) {
      await sock.sendMessage(jid, { image: { url: image } }, { quoted: message });
    }
    return;
  }

  if (!data.data.play) throw new Error('Aucune video TikTok trouvee');
  return sock.sendMessage(jid, { video: { url: data.data.play }, mimetype: 'video/mp4' }, { quoted: message });
}

async function sendInstagram(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.url) throw new Error(data.message || 'Instagram API error');

  for (const link of data.result.url.slice(0, 10)) {
    if (data.result.metadata?.isVideo) {
      await sock.sendMessage(jid, { video: { url: link }, mimetype: 'video/mp4' }, { quoted: message });
    } else {
      await sock.sendMessage(jid, { image: { url: link } }, { quoted: message });
    }
  }
}

async function sendPinterest(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/pin-down?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.medias) throw new Error(data.message || 'Pinterest API error');

  const medias = data.result.medias;
  const images = medias.filter((media) => media.type === 'image');
  if (images.length > 0) {
    for (const image of images.slice(0, 10)) {
      await sock.sendMessage(jid, { image: { url: image.url } }, { quoted: message });
    }
    return;
  }

  const video = medias.find((media) => media.type === 'video') || medias.find((media) => media.type === 'gif');
  if (!video) throw new Error('Aucun media Pinterest trouve');
  return sock.sendMessage(jid, { video: { url: video.url }, mimetype: 'video/mp4' }, { quoted: message });
}

async function sendFacebook(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/fbdownload?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.media) throw new Error(data.message || 'Facebook API error');

  const media = data.result.media;
  if (media.video_hd || media.video_sd) {
    return sock.sendMessage(jid, { video: { url: media.video_hd || media.video_sd }, mimetype: 'video/mp4' }, { quoted: message });
  }
  if (media.photo_image) {
    return sock.sendMessage(jid, { image: { url: media.photo_image } }, { quoted: message });
  }
  throw new Error('Aucun media Facebook telechargeable');
}

async function sendTwitter(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/twitter?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result) throw new Error(data.message || 'Twitter/X API error');

  if (data.result.type === 'image') {
    for (const image of (data.result.download_url || []).slice(0, 10)) {
      await sock.sendMessage(jid, { image: { url: image.url } }, { quoted: message });
    }
    return;
  }

  const videos = (data.result.download_url || []).filter((item) => item.type === 'mp4');
  const best = videos.find((item) => item.resolusi === '768p') || videos.find((item) => item.resolusi === '640p') || videos[0];
  if (!best) throw new Error('Aucune video X/Twitter trouvee');
  return sock.sendMessage(jid, { video: { url: best.url }, mimetype: 'video/mp4' }, { quoted: message });
}

async function sendVidey(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/videy?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result) throw new Error(data.message || 'Videy API error');
  return sock.sendMessage(jid, { video: { url: data.result }, mimetype: 'video/mp4' }, { quoted: message });
}

async function sendMediaFire(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/mediafire?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result) throw new Error(data.message || 'MediaFire API error');

  const result = data.result;
  return sock.sendMessage(jid, {
    document: { url: result.download_url },
    fileName: result.filename,
    mimetype: result.mime ? `application/${result.mime}` : 'application/octet-stream',
    caption: MessageFormatter.panel({
      title: 'MediaFire',
      fields: [
        { label: 'Fichier', value: result.filename },
        { label: 'Taille', value: result.size },
      ],
    }),
  }, { quoted: message });
}

async function sendThreads(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/threads?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.media) throw new Error(data.message || 'Threads API error');

  const videos = data.result.media.filter((media) => media.thumbnail && media.thumbnail !== '-');
  const images = data.result.media.filter((media) => !media.thumbnail || media.thumbnail === '-');
  if (videos.length > 0) {
    return sock.sendMessage(jid, { video: { url: videos[0].url }, mimetype: 'video/mp4' }, { quoted: message });
  }
  for (const image of images.slice(0, 10)) {
    await sock.sendMessage(jid, { image: { url: image.url } }, { quoted: message });
  }
}

async function sendMega(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/mega?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result) throw new Error(data.message || 'Mega API error');

  const result = data.result;
  const downloadUrl = Array.isArray(result.download_url) ? result.download_url[0] : result.download_url;
  return sock.sendMessage(jid, {
    document: { url: downloadUrl },
    fileName: result.filename,
    mimetype: result.mimetype || 'application/octet-stream',
    caption: MessageFormatter.panel({
      title: 'Mega',
      fields: [
        { label: 'Fichier', value: result.filename },
        { label: 'Taille', value: result.filesize },
      ],
    }),
  }, { quoted: message });
}

async function sendSoundCloud(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/soundcloud?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.url) throw new Error(data.message || 'SoundCloud API error');
  return sock.sendMessage(jid, { audio: { url: data.result.url }, mimetype: 'audio/mpeg', fileName: data.result.fileName }, { quoted: message });
}

async function sendSpotify(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/spotify?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.url) throw new Error(data.message || 'Spotify API error');
  return sock.sendMessage(jid, {
    audio: { url: data.result.url },
    mimetype: 'audio/mpeg',
    fileName: `${sanitizeFileName(`${data.result.title || 'spotify'} - ${data.result.artist || ''}`)}.mp3`,
  }, { quoted: message });
}

async function sendYoutubeAudioFromUrl(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.url) throw new Error(data.message || 'YouTube API error');
  return sock.sendMessage(jid, {
    audio: { url: data.result.url },
    mimetype: 'audio/mpeg',
    fileName: `${sanitizeFileName(data.result.title || 'youtube')}.mp3`,
  }, { quoted: message });
}

async function sendSfile(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api.nexray.web.id/downloader/sfile?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data.status || !data.result?.url) throw new Error(data.message || 'Sfile API error');

  const result = data.result;
  return sock.sendMessage(jid, {
    document: { url: result.url },
    fileName: result.file_name,
    mimetype: result.mimetype === '7ZIP' ? 'application/x-7z-compressed' : 'application/octet-stream',
    caption: MessageFormatter.panel({
      title: 'Sfile',
      fields: [
        { label: 'Fichier', value: result.file_name },
        { label: 'Taille', value: result.size },
      ],
    }),
  }, { quoted: message });
}

function extractYoutubeUrl(text) {
  const value = String(text || '').trim();
  const match = value.match(YT_REGEX);
  return match ? match[0] : null;
}

async function sendYoutubeCommand(sock, message, commandName, query, prefix = '!') {
  const jid = message.key.remoteJid;
  const input = String(query || getQuotedText(message) || '').trim();
  if (!input) {
    return sendText(sock, jid, message, MessageFormatter.panel({
      title: 'YouTube',
      body: [
        `${prefix}play <titre>`,
        `${prefix}mp3 <lien youtube>`,
        `${prefix}mp4 <titre ou lien youtube>`,
      ],
    }));
  }

  try {
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    if (['mp4', 'ytmp4', 'video'].includes(commandName)) {
      return await sendYoutubeVideo(sock, message, input);
    }
    if (['mp3', 'ytmp3'].includes(commandName)) {
      const url = extractYoutubeUrl(input);
      if (!url) return await sendText(sock, jid, message, MessageFormatter.warning('Pour !mp3, donne un lien YouTube valide.'));
      return await sendYoutubeMp3(sock, message, url);
    }
    return await sendYoutubePlay(sock, message, input);
  } catch (error) {
    return await sendText(sock, jid, message, MessageFormatter.publicError('YouTube impossible', error));
  } finally {
    await sock.sendPresenceUpdate('paused', jid).catch(() => null);
  }
}

async function sendYoutubeVideo(sock, message, input) {
  const jid = message.key.remoteJid;
  let videoUrl = extractYoutubeUrl(input);

  if (!videoUrl) {
    const { data: searchData } = await axios.get(`https://api-faa.my.id/faa/youtube?q=${encodeURIComponent(input)}`, { timeout: 30000 });
    if (!searchData.status || !searchData.result?.length) throw new Error('Aucune video trouvee');

    const first = searchData.result[0];
    videoUrl = first.link;
    await sock.sendMessage(jid, {
      image: { url: first.imageUrl },
      caption: MessageFormatter.panel({
        title: first.title,
        fields: [{ label: 'Duree', value: first.duration }],
        footer: 'Telechargement en cours...',
      }),
    }, { quoted: message });
  }

  const { data } = await axios.get(`https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(videoUrl)}`, { timeout: 45000 });
  if (!data.status || !data.result?.download_url) throw new Error('API ytmp4 indisponible');

  return sock.sendMessage(jid, {
    video: { url: data.result.download_url },
    mimetype: 'video/mp4',
    caption: MessageFormatter.success('Video telechargee.'),
  }, { quoted: message });
}

async function sendYoutubeMp3(sock, message, url) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 45000 });
  if (!data.status || !data.result?.mp3) throw new Error('API ytmp3 indisponible');

  return sock.sendMessage(jid, {
    audio: { url: data.result.mp3 },
    mimetype: 'audio/mpeg',
    contextInfo: {
      externalAdReply: {
        title: data.result.title || 'YouTube Audio',
        body: 'YouTube Audio',
        thumbnailUrl: data.result.thumbnail,
        mediaType: 2,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: message });
}

async function sendYoutubePlay(sock, message, query) {
  const jid = message.key.remoteJid;
  const { data } = await axios.get(`https://api-faa.my.id/faa/ytplay?query=${encodeURIComponent(query)}`, { timeout: 45000 });
  if (!data.status || !data.result?.mp3) throw new Error('Aucun resultat audio trouve');

  const result = data.result;
  await sock.sendMessage(jid, {
    image: { url: result.thumbnail },
    caption: MessageFormatter.panel({
      title: result.title,
      fields: [{ label: 'Auteur', value: result.author }],
      footer: 'Envoi audio...',
    }),
  }, { quoted: message });

  return sock.sendMessage(jid, {
    audio: { url: result.mp3 },
    mimetype: 'audio/mpeg',
    contextInfo: {
      externalAdReply: {
        title: result.title,
        body: result.author,
        thumbnailUrl: result.thumbnail,
        mediaType: 2,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: message });
}

async function sendTikTokCommand(sock, message, input, prefix = '!') {
  const jid = message.key.remoteJid;
  const query = String(input || getQuotedText(message) || '').trim();

  if (!query) {
    return sendText(sock, jid, message, MessageFormatter.panel({
      title: 'TikTok',
      body: [
        `${prefix}tt <lien tiktok>`,
        `${prefix}tt <recherche>`,
      ],
    }));
  }

  try {
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    const detectedUrl = query.match(/(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/)?.[0];
    if (detectedUrl) {
      return await sendTikTokDetailed(sock, message, detectedUrl);
    }

    const apiRes = await fetch(`https://kelvdraapi.domku.xyz/search/tiktok?query=${encodeURIComponent(query)}&count=1&apikey=tesApi`);
    const json = await apiRes.json();
    const video = json?.data?.videos?.[0];
    if (!video) return await sendText(sock, jid, message, MessageFormatter.warning(`Aucun resultat pour "${query}".`));

    const videoUrl = video.play.startsWith('http') ? video.play : `https://www.tikwm.com${video.play}`;
    const buffer = await fetchBuffer(videoUrl);

    return await sock.sendMessage(jid, {
      video: buffer,
      caption: buildTikTokCaption(video),
    }, { quoted: message });
  } catch (error) {
    return await sendText(sock, jid, message, MessageFormatter.publicError('TikTok impossible', error));
  } finally {
    await sock.sendPresenceUpdate('paused', jid).catch(() => null);
  }
}

async function sendTikTokDetailed(sock, message, url) {
  const jid = message.key.remoteJid;
  const apiRes = await fetch(`https://kelvdraapi.domku.xyz/downloader/tiktok?url=${encodeURIComponent(url)}&apikey=tesApi`);
  const json = await apiRes.json();
  if (!json?.data) throw new Error('TikTok API error');

  const data = json.data;
  const caption = buildTikTokCaption(data);

  if (Array.isArray(data.images) && data.images.length > 0) {
    await sock.sendMessage(jid, { text: caption }, { quoted: message });
    for (const image of data.images.slice(0, 10)) {
      await sock.sendMessage(jid, { image: await fetchBuffer(image) }, { quoted: message });
    }
  } else if (data.play) {
    const videoUrl = data.play.startsWith('http') ? data.play : `https://www.tikwm.com${data.play}`;
    await sock.sendMessage(jid, { video: await fetchBuffer(videoUrl), caption }, { quoted: message });
  } else {
    throw new Error('Aucun media TikTok trouve');
  }

  if (data.music_info?.play) {
    try {
      await sock.sendMessage(jid, {
        audio: await fetchBuffer(data.music_info.play),
        mimetype: 'audio/mpeg',
        fileName: `${sanitizeFileName(data.title || 'tiktok')}.mp3`,
      }, { quoted: message });
    } catch {
      // Music extraction is optional.
    }
  }
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function buildTikTokCaption(data) {
  return MessageFormatter.panel({
    title: 'TikTok',
    fields: [
      { label: 'Titre', value: data.title || '-' },
      { label: 'Region', value: data.region || '-' },
      { label: 'Duree', value: formatDuration(data.duration) },
      { label: 'Vues', value: formatNumber(data.play_count) },
      { label: 'Auteur', value: data.author?.nickname || data.author?.unique_id || '-' },
    ],
  });
}

function formatNumber(number) {
  return Number(number || 0).toLocaleString();
}

function formatDuration(seconds) {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

function sanitizeFileName(name) {
  return String(name || 'download').replace(/[<>:"/\\|?*]+/g, '').slice(0, 40) || 'download';
}

module.exports = {
  getInvokedCommand,
  sendUniversalDownload,
  sendYoutubeCommand,
  sendTikTokCommand,
};
