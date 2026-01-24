const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  name: 'voiranime',
  description: 'Récupérer un épisode d\'un anime sur VoirAnime',
  category: 'FUN',
  usage: '!voiranime <nom> <épisode>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const userJid = isGroup ? participantJid : senderJid;

    if (args.length < 2) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!voiranime <nom> <épisode>`\n\n' +
              'Exemples:\n' +
              '`!voiranime naruto 1` → Naruto épisode 1\n' +
              '`!voiranime one piece 50` → One Piece épisode 50\n' +
              '`!voiranime jujutsu kaisen 5` → Jujutsu Kaisen épisode 5'
      });
      return;
    }

    // Parse arguments: last arg is episode number
    const episodeNum = parseInt(args[args.length - 1]);
    
    if (isNaN(episodeNum) || episodeNum <= 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Le dernier argument doit être un numéro d\'épisode!\n\nExemple: `!voiranime naruto 10`'
      });
      return;
    }

    // Everything before the last arg is the anime name
    const animeName = args.slice(0, -1).join(' ');

    try {
      await sock.sendMessage(senderJid, {
        text: `🔍 Recherche "${animeName}" épisode ${episodeNum} sur VoirAnime...`
      });

      // Search anime
      const searchUrl = `https://www.voiranime.com/search?q=${encodeURIComponent(animeName)}`;
      
      const searchResponse = await axios.get(searchUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(searchResponse.data);
      let firstAnimeLink = null;

      // Get first result
      $('a.film-poster').first().each((index, element) => {
        const $element = $(element);
        const link = $element.attr('href');
        
        if (link) {
          firstAnimeLink = link.startsWith('http') ? link : `https://www.voiranime.com${link}`;
        }
      });

      if (!firstAnimeLink) {
        await sock.sendMessage(senderJid, {
          text: `❌ Anime "${animeName}" non trouvé sur VoirAnime`
        });
        return;
      }

      // Fetch anime page to get episodes
      await sock.sendMessage(senderJid, {
        text: `📺 Récupération de l'épisode ${episodeNum}...`
      });

      const animeResponse = await axios.get(firstAnimeLink, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $anime = cheerio.load(animeResponse.data);
      const episodes = [];

      // Parse episodes from the page
      $anime('a.ep-item, a.episode-link, div.episode a, .episode-link').each((index, element) => {
        const $element = $anime(element);
        const episodeText = $element.text().trim();
        const episodeLink = $element.attr('href');
        
        if (episodeText && episodeLink) {
          episodes.push({
            num: episodes.length + 1,
            title: episodeText,
            link: episodeLink.startsWith('http') ? episodeLink : `https://www.voiranime.com${episodeLink}`
          });
        }
      });

      if (episodes.length === 0) {
        await sock.sendMessage(senderJid, {
          text: `❌ Impossible de récupérer les épisodes de "${animeName}"`
        });
        return;
      }

      // Find the requested episode
      if (episodeNum > episodes.length) {
        await sock.sendMessage(senderJid, {
          text: `❌ L'épisode ${episodeNum} n'existe pas.\n\n` +
                `📊 Seulement ${episodes.length} épisode(s) disponible(s)`
        });
        return;
      }

      const targetEpisode = episodes[episodeNum - 1];

      // Send to DM
      const dmJid = isGroup ? userJid : senderJid;
      let dm_text = `🎌 *${animeName}*\n`;
      dm_text += `📺 *Épisode ${episodeNum}*\n\n`;
      dm_text += `${targetEpisode.title}\n\n`;
      dm_text += `🔗 Lien: ${targetEpisode.link}\n\n`;
      dm_text += `📖 Ouvrez ce lien pour regarder l'épisode`;

      await new Promise(r => setTimeout(r, 300));
      await sock.sendMessage(dmJid, { text: dm_text });

      if (isGroup) {
        await sock.sendMessage(senderJid, {
          text: `✅ Le lien de "${animeName}" épisode ${episodeNum} a été envoyé en DM`
        });
      } else {
        await sock.sendMessage(senderJid, {
          text: `✅ Lien trouvé et envoyé!`
        });
      }

    } catch (error) {
      console.error('Error in voiranime command:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la recherche.\n\n' +
              'Causes possibles:\n' +
              '• VoirAnime est bloqué/indisponible\n' +
              '• Site temporairement down\n' +
              '• Trop de requêtes (attendre 1 min)\n' +
              '• Anime inexistant sur le site\n\n' +
              'Réessayez dans quelques minutes!'
      });
    }
  }
};
