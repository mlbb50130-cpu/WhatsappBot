const axios = require('axios');
const cheerio = require('cheerio');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');

function tenorKey() {
  const key = process.env.TENOR_API_KEY || '';
  if (!key) throw new Error('TENOR_API_KEY manquant dans Railway.');
  return key;
}

function weatherKey() {
  const key = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || '';
  if (!key) throw new Error('OPENWEATHER_API_KEY manquant dans Railway.');
  return key;
}

function bingImageUrls(html, filter = () => true) {
  const urls = [];
  for (const match of html.matchAll(/&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)) {
    const url = match[1];
    if (filter(url)) urls.push(url);
  }
  return [...new Set(urls)];
}

async function searchBingImages(query, pinterestOnly = false) {
  const searchQuery = pinterestOnly
    ? `site:pinterest.com ${query}`
    : query;
  const { data } = await axios.get(
    `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&first=1&count=20&tsc=ImageBasicHover`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    }
  );

  return bingImageUrls(data, pinterestOnly ? (url) => url.includes('pinimg.com') : () => true);
}

async function sendImageSearch(sock, jid, message, query, pinterestOnly = false) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning(`Utilise: ${pinterestOnly ? '!pin' : '!image'} <recherche>`),
    }, { quoted: message });
  }

  const urls = await searchBingImages(query, pinterestOnly);
  if (!urls.length) throw new Error('Aucune image trouvee.');
  const selected = urls.slice(0, 10)[Math.floor(Math.random() * Math.min(urls.length, 10))];

  return sock.sendMessage(jid, {
    image: { url: selected },
    caption: MessageFormatter.panel({
      title: pinterestOnly ? 'Pinterest' : 'Image',
      fields: [{ label: 'Recherche', value: query }],
    }),
  }, { quoted: message });
}

async function sendGifSearch(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !gif <recherche>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(
    `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${tenorKey()}&client_key=tetsubot&limit=12&media_filter=mp4`,
    { timeout: 15000 }
  );
  const results = data.results || [];
  if (!results.length) throw new Error('Aucun GIF trouve.');
  const selected = results[Math.floor(Math.random() * results.length)];
  const gifUrl = selected.media_formats?.mp4?.url;
  if (!gifUrl) throw new Error('GIF Tenor invalide.');

  return sock.sendMessage(jid, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption: MessageFormatter.panel({
      title: 'GIF',
      fields: [{ label: 'Recherche', value: query }],
    }),
  }, { quoted: message });
}

async function sendCouplePp(sock, jid, message) {
  const { data } = await axios.get('https://couple-pfp-api.vercel.app/api/v1/couplepfp', { timeout: 15000 });
  if (!data?.male || !data?.female) throw new Error('API couple PP indisponible.');

  await sock.sendMessage(jid, { image: { url: data.male }, caption: 'For him' }, { quoted: message });
  return sock.sendMessage(jid, { image: { url: data.female }, caption: 'For her' }, { quoted: message });
}

async function sendGoogleSearch(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !google <recherche>'),
    }, { quoted: message });
  }

  const mod = await import('@fantox01/search-it');
  const searchit = mod.searchit || mod.default?.searchit || mod.default;
  const results = await searchit(query, 8);
  if (!results?.length) throw new Error('Aucun resultat trouve.');

  const body = results.slice(0, 6).map((result, index) => {
    return `${index + 1}. ${result.page || result.title || 'Resultat'}\n${result.desc || ''}\n${result.url || ''}`;
  });

  return sock.sendMessage(jid, {
    text: MessageFormatter.panel({
      title: 'Google',
      subtitle: query,
      body,
    }),
  }, { quoted: message });
}

async function sendLyrics(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !lyrics <titre>'),
    }, { quoted: message });
  }

  const mod = await import('@fantox01/lyrics-scraper');
  const getLyrics = mod.getLyrics || mod.default?.getLyrics || mod.default;
  const result = await getLyrics(query);
  if (!result?.lyrics || result.status === 500) throw new Error(result?.message || 'Lyrics introuvables.');

  const text = MessageFormatter.limitText(result.lyrics, 20, 1500);
  const caption = MessageFormatter.panel({
    title: result.title || 'Lyrics',
    subtitle: query,
    body: [text],
  });

  if (result.thumbnail) {
    return sock.sendMessage(jid, { image: { url: result.thumbnail }, caption }, { quoted: message });
  }
  return sock.sendMessage(jid, { text: caption }, { quoted: message });
}

async function sendYoutubeSearch(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !yts <recherche>'),
    }, { quoted: message });
  }

  const mod = await import('youtube-yts');
  const yts = mod.default || mod;
  const results = await yts(query);
  const items = (results.all || []).slice(0, 8);
  if (!items.length) throw new Error('Aucun resultat YouTube.');

  const body = items.map((item, index) => `${index + 1}. ${item.title}\n${item.timestamp || '-'} - ${item.url}`);
  const caption = MessageFormatter.panel({
    title: 'YouTube Search',
    subtitle: query,
    body,
  });

  const thumb = items[0]?.thumbnail;
  if (thumb) return sock.sendMessage(jid, { image: { url: thumb }, caption }, { quoted: message });
  return sock.sendMessage(jid, { text: caption }, { quoted: message });
}

async function sendWeather(sock, jid, message, location) {
  if (!location) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !weather <ville>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${weatherKey()}&language=fr`,
    { timeout: 15000 }
  );

  return sock.sendMessage(jid, {
    text: MessageFormatter.panel({
      title: 'Meteo',
      subtitle: `${data.name}, ${data.sys?.country || ''}`,
      fields: [
        { label: 'Temps', value: data.weather?.[0]?.description || '-' },
        { label: 'Temperature', value: `${data.main?.temp} C` },
        { label: 'Min/Max', value: `${data.main?.temp_min} C / ${data.main?.temp_max} C` },
        { label: 'Humidite', value: `${data.main?.humidity}%` },
        { label: 'Vent', value: `${data.wind?.speed} km/h` },
      ],
    }),
  }, { quoted: message });
}

async function sendGithub(sock, jid, message, username) {
  if (!username) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !github <username>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { timeout: 15000 });
  const caption = MessageFormatter.panel({
    title: 'GitHub',
    subtitle: data.login,
    fields: [
      { label: 'Nom', value: data.name || '-' },
      { label: 'Bio', value: data.bio || '-' },
      { label: 'Followers', value: data.followers },
      { label: 'Repos publics', value: data.public_repos },
      { label: 'Site', value: data.blog || '-' },
      { label: 'Profil', value: data.html_url },
    ],
  });

  return sock.sendMessage(jid, { image: { url: data.avatar_url }, caption }, { quoted: message });
}

async function sendWiki(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !wiki <recherche>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    {
      timeout: 15000,
      headers: { 'User-Agent': `${config.BOT_NAME}/1.0` },
    }
  );
  if (!data.extract) throw new Error('Article introuvable.');

  const caption = MessageFormatter.panel({
    title: data.title,
    body: [MessageFormatter.limitText(data.extract, 12, 1000), data.content_urls?.desktop?.page || ''],
  });

  if (data.thumbnail?.source) return sock.sendMessage(jid, { image: { url: data.thumbnail.source }, caption }, { quoted: message });
  return sock.sendMessage(jid, { text: caption }, { quoted: message });
}

async function searchWallpaper(query, page = 1) {
  const { data } = await axios.get(
    `https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${encodeURIComponent(query)}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    }
  );
  const $ = cheerio.load(data);
  const results = [];
  $('div.grid-item').each((index, item) => {
    results.push({
      title: $(item).find('div.info > a > h3').text(),
      type: $(item).find('div.info > a:nth-child(2)').text(),
      image: [
        $(item).find('picture > img').attr('data-src') || $(item).find('picture > img').attr('src'),
        $(item).find('picture > source:nth-child(1)').attr('srcset'),
        $(item).find('picture > source:nth-child(2)').attr('srcset'),
      ].filter(Boolean),
    });
  });
  return results;
}

async function sendWallpaper(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !wallpaper <recherche>'),
    }, { quoted: message });
  }

  const results = await searchWallpaper(query);
  if (!results.length) throw new Error('Aucun wallpaper trouve.');
  const selected = results[Math.floor(Math.random() * Math.min(results.length, 10))];
  const imageUrl = selected.image?.[0];
  if (!imageUrl) throw new Error('Image wallpaper invalide.');

  return sock.sendMessage(jid, {
    image: { url: imageUrl },
    caption: MessageFormatter.panel({
      title: selected.title || query,
      fields: [{ label: 'Type', value: selected.type || 'Wallpaper' }],
    }),
  }, { quoted: message });
}

async function sendRingtone(sock, jid, message, query) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !ringtone <recherche>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(`https://meloboom.com/en/search/${encodeURIComponent(query)}`, { timeout: 15000 });
  const $ = cheerio.load(data);
  const results = [];
  $('#__next main li').each((index, item) => {
    const audio = $(item).find('audio').attr('src');
    const title = $(item).find('h4').text();
    if (audio) results.push({ title, audio });
  });

  if (!results.length) throw new Error('Aucune sonnerie trouvee.');
  const selected = results[Math.floor(Math.random() * results.length)];
  return sock.sendMessage(jid, {
    audio: { url: selected.audio },
    fileName: `${selected.title || query}.mp3`,
    mimetype: 'audio/mpeg',
  }, { quoted: message });
}

async function sendStickerSearch(sock, jid, message, query, pushName = config.BOT_NAME) {
  if (!query) {
    return sock.sendMessage(jid, {
      text: MessageFormatter.warning('Utilise: !stickersearch <recherche>'),
    }, { quoted: message });
  }

  const { data } = await axios.get(
    `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${tenorKey()}&client_key=tetsubot&limit=8&media_filter=gif`,
    { timeout: 15000 }
  );
  const results = data.results || [];
  if (!results.length) throw new Error('Aucun sticker trouve.');
  const selected = results[Math.floor(Math.random() * results.length)];
  const gifUrl = selected.media_formats?.gif?.url;
  if (!gifUrl) throw new Error('GIF Tenor invalide.');

  const response = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 20000 });
  const sticker = new Sticker(Buffer.from(response.data), {
    pack: config.BOT_NAME,
    author: pushName,
    type: StickerTypes.FULL,
    quality: 60,
    background: 'transparent',
  });

  return sock.sendMessage(jid, { sticker: await sticker.toBuffer() }, { quoted: message });
}

module.exports = {
  sendCouplePp,
  sendGifSearch,
  sendGithub,
  sendGoogleSearch,
  sendImageSearch,
  sendLyrics,
  sendRingtone,
  sendStickerSearch,
  sendWallpaper,
  sendWeather,
  sendWiki,
  sendYoutubeSearch,
};
