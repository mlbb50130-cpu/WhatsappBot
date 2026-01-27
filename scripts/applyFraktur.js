const fs = require('fs');
const path = require('path');
const { toFraktur } = require('../src/utils/frakturConverter');

const commandsDir = path.join(__dirname, '../src/commands');

// Mapping of command files and their titles (extracted from context)
const titleMappings = {
  'profil.js': 'TON PROFIL OTAKU',
  'stats.js': 'STATISTIQUES',
  'powerlevel.js': 'TON POWER LEVEL',
  'zerotwo.js': 'ZERO TWO',
  'yoruichi.js': 'YORUICHI',
  'yami.js': 'YAMI SUKEHIRO',
  'xp.js': 'XP',
  'whoami.js': 'QUI ES-TU',
  'waifu.js': 'TA WAIFU',
  'voiranime.js': 'VOIR ANIME',
  'vegito.js': 'VEGITO BLUE',
  'tsunade.js': 'TSUNADE',
  'topmanga.js': 'TOP MANGA',
  'topanime.js': 'TOP ANIME',
  'tengen.js': 'TENGEN',
  'sukuna.js': 'SUKUNA',
  'sticker.js': 'STICKER',
  'ship.js': 'SHIP',
  'selectpack.js': 'SELECT PACK',
  'roulette.js': 'ROULETTE',
  'roast.js': 'ROAST',
  'randomquote.js': 'RANDOM QUOTE',
  'randomgirl.js': 'FILLE ALEATOIRE',
  'randomcharacter.js': 'PERSONNAGE ALEATOIRE',
  'quicksearch.js': 'QUICKSEARCH',
  'quête.js': 'QUÊTE',
  'profiler.js': 'PROFILER',
  'profil-update.js': 'MISE A JOUR DE PROFIL',
  'profile-setup.js': 'PROFIL',
  'powers.js': 'POUVOIRS',
  'pack.js': 'PACK',
  'nobi.js': 'NOBITA',
  'naruto.js': 'NARUTO',
  'namikaze.js': 'NAMIKAZE',
  'newsfeed.js': 'NEWSFEED',
  'nezuko.js': 'NEZUKO',
  'memes.js': 'MEMES',
  'memes-stats.js': 'STATS MEMES',
  'memes-leaderboard.js': 'LEADERBOARD MEMES',
  'mangekyou.js': 'MANGEKYOU',
  'manga.js': 'MANGA',
  'magic.js': 'MAGIC',
  'madara.js': 'MADARA',
  'luffy.js': 'LUFFY',
  'loveme.js': 'AIME-MOI',
  'likes.js': 'J\'AIME',
  'leaderboard.js': 'LEADERBOARD',
  'jewelry.js': 'JEWELRY',
  'itachi.js': 'ITACHI',
  'info.js': 'INFO',
  'imagecommand.js': 'IMAGECOMMAND',
  'image.js': 'IMAGE',
  'help.js': 'AIDE',
  'hate.js': 'JE DETESTE',
  'gojo.js': 'GOJO SATORU',
  'giftbox.js': 'COFFRET CADEAU',
  'gift.js': 'CADEAU',
  'gacha.js': 'GACHA',
  'fusion.js': 'FUSION',
  'fushiguro.js': 'FUSHIGURO',
  'first.js': 'PREMIER',
  'favourite.js': 'FAVORI',
  'fall.js': 'AUTOMNE',
  'equip.js': 'EQUIPER',
  'equipment.js': 'EQUIPEMENT',
  'emoji.js': 'EMOJI',
  'earn.js': 'GAGNER',
  'duel.js': 'DUEL',
  'duelstats.js': 'STATS DE DUEL',
  'duelleaderboard.js': 'LEADERBOARD DE DUEL',
  'duo.js': 'DUO',
  'dating.js': 'RENCONTRE',
  'daily.js': 'DAILY',
  'dabura.js': 'DABURA',
  'custom.js': 'CUSTOM',
  'cosmic.js': 'COSMIC',
  'config.js': 'CONFIG',
  'claim.js': 'CLAIM',
  'chakra.js': 'CHAKRA',
  'avatar.js': 'AVATAR',
  'anime.js': 'ANIME',
  'ani-love.js': 'AMOUR ANIME',
  'adventureMissions.js': 'MISSIONS D\'AVENTURE',
};

function replaceTitle(content, oldTitle) {
  const newTitle = toFraktur(oldTitle);
  
  // Match patterns: 'TITLE' or "TITLE" or `TITLE` in elegantBox or other contexts
  const patterns = [
    new RegExp(`'${oldTitle}'`, 'g'),
    new RegExp(`"${oldTitle}"`, 'g'),
    new RegExp('`' + oldTitle + '`', 'g'),
  ];
  
  let updated = content;
  patterns.forEach(pattern => {
    updated = updated.replace(pattern, `'${newTitle}'`);
  });
  
  return updated;
}

// Process all command files
const files = fs.readdirSync(commandsDir);
let processed = 0;
let skipped = 0;

files.forEach(file => {
  if (file === 'documentation.js' || !file.endsWith('.js')) {
    skipped++;
    return;
  }
  
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Try to find and replace title
  for (const [filename, title] of Object.entries(titleMappings)) {
    if (file === filename) {
      const newContent = replaceTitle(content, title);
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${file}: "${title}" → "${toFraktur(title)}"`);
        updated = true;
        processed++;
      }
      break;
    }
  }
  
  if (!updated && file !== 'documentation.js') {
    console.log(`⏭️  ${file}: No mapping found`);
  }
});

console.log(`\n📊 Résumé: ${processed} fichiers modifiés, ${skipped} fichiers ignorés`);
