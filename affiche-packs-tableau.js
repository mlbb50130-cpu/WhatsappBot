const fs = require('fs');
const path = require('path');

// Lire PackManager.js
const managerPath = path.join(__dirname, 'src/utils/PackManager.js');
const content = fs.readFileSync(managerPath, 'utf8');

// Extraire les commandes par pack
const regex = /(\w+):\s*\[([\s\S]*?)\n\s*\]/g;
let match;
const packs = {};

while ((match = regex.exec(content)) !== null) {
  const packName = match[1];
  const commandsStr = match[2];
  
  // Extraire les commandes individuelles
  const commands = commandsStr
    .split(',')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd && cmd.startsWith("'"))
    .map(cmd => cmd.replace(/'/g, '').trim())
    .filter(cmd => cmd && !cmd.startsWith('//'));
  
  packs[packName] = commands;
}

// Organiser par catégories
function categorizePack(commands) {
  const categories = {
    'Profil & RPG': ['profil', 'level', 'xp', 'rank', 'stats', 'badges', 'duel', 'powerlevel', 'chakra'],
    'Quêtes': ['quete', 'quotidien', 'hebdo', 'quetelundi'],
    'Quiz & Jeux': ['quiz', 'quizanime', 'pfc', 'roulette', 'reponse'],
    'Inventaire': ['loot', 'inventaire', 'equip', 'equipement', 'collection'],
    'Images Anime': ['waifu', 'husbando', 'neko', 'animegif', 'ship'],
    'Personnages': ['bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo', 'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi', 'nino'],
    'Fun': ['blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick'],
    'Anime & Manga': ['anime', 'manga', 'mangadex', 'personnage', 'voiranime'],
    'Classements': ['topanime', 'topmanga', 'classement'],
    'MLBB Profil': ['mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile'],
    'MLBB Héros': ['hero', 'heroe', 'champion', 'build', 'builds', 'items', 'set'],
    'MLBB Stratégie': ['counter', 'counters', 'beat', 'antiheroe', 'combo', 'combos', 'cc', 'rotation', 'meta', 'metagame', 'tier', 'tierlist', 'lane', 'lanes', 'guide', 'position', 'role', 'tip', 'tips', 'conseil', 'conseils'],
    'MLBB Équipes': ['team', 'equipe', 'squad', 'crew', 'join', 'j', 'leave', 'l'],
    'Menus': ['mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions', 'heroes', 'heroslist', 'listheroe', 'herolist', 'heros'],
    'Admin': ['selectpack', 'setmodule', 'pack', 'packselect', 'choosepack', 'activatebot', 'admins', 'admin', 'theme', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow', 'warn', 'avertir', 'kick', 'expulser', 'lock', 'verrouiller', 'unlock', 'deverrouiller', 'mute', 'silence', 'desimulet', 'unmute', 'promote', 'promouvoir', 'demote', 'retrograder', 'clear', 'nettoyer', 'groupinfo', 'groupeinfo', 'infogroupes', 'everyone', 'all', 'tous', 'setxp', 'fixerxp', 'tournoisquiz', 'tournoi', 'tourquiz'],
    'NSFW': ['hentai', 'hentaivd', 'boahancook', 'nsfw'],
    'Bot': ['ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami', 'assets', 'chakratest']
  };

  const result = {};
  for (const [category, cmds] of Object.entries(categories)) {
    const found = cmds.filter(cmd => commands.includes(cmd));
    if (found.length > 0) {
      result[category] = found;
    }
  }
  
  return result;
}

// Afficher le tableau
console.log('\n╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              📊 TABLEAU COMPLET DES PACKS DE COMMANDES                                                  ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝\n');

const packNames = ['otaku', 'gamin', 'complet'];
const packInfo = {
  otaku: { emoji: '📺', name: 'RPG OTAKU', color: '\x1b[36m' },
  gamin: { emoji: '🎮', name: 'MLBB GAMIN', color: '\x1b[33m' },
  complet: { emoji: '🌟', name: 'COMPLET', color: '\x1b[35m' }
};

for (const packName of packNames) {
  const commands = packs[packName] || [];
  const categorized = categorizePack(commands);
  const info = packInfo[packName];
  
  console.log(`\n${info.emoji} ${info.color}${info.name}\x1b[0m (${commands.length} commandes)`);
  console.log('═'.repeat(95));
  
  let totalCommands = 0;
  for (const [category, cmds] of Object.entries(categorized)) {
    console.log(`\n  📌 ${category} (${cmds.length}):`);
    
    // Afficher les commandes en colonnes
    let line = '     ';
    for (const cmd of cmds) {
      if (line.length + cmd.length + 4 > 95) {
        console.log(line);
        line = '     ';
      }
      line += cmd.padEnd(20);
    }
    if (line.trim()) {
      console.log(line);
    }
    
    totalCommands += cmds.length;
  }
  
  console.log(`\n  ✅ Total: ${totalCommands} commandes`);
  console.log('');
}

// Tableau comparatif
console.log('\n╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              📈 TABLEAU COMPARATIF DES PACKS                                                           ║');
console.log('╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
console.log('║ Catégorie                      │  OTAKU  │ GAMIN │ COMPLET │                                                         ║');
console.log('╠════════════════════════════════╪═════════╪═══════╪═════════╣');

const allCategories = new Set();
for (const commands of Object.values(packs)) {
  const categorized = categorizePack(commands);
  Object.keys(categorized).forEach(cat => allCategories.add(cat));
}

for (const category of Array.from(allCategories).sort()) {
  let line = `║ ${category.padEnd(30)} │`;
  
  for (const packName of ['otaku', 'gamin', 'complet']) {
    const categorized = categorizePack(packs[packName] || []);
    const count = categorized[category] ? categorized[category].length : 0;
    line += ` ${count.toString().padEnd(6)} │`;
  }
  
  line += ' '.repeat(48) + '║';
  console.log(line);
}

console.log('╠════════════════════════════════╪═════════╪═══════╪═════════╣');

let totalLine = '║ ' + 'TOTAL'.padEnd(29) + ' │';
const totals = {};
for (const packName of ['otaku', 'gamin', 'complet']) {
  const count = (packs[packName] || []).length;
  totals[packName] = count;
  totalLine += ` ${count.toString().padEnd(6)} │`;
}
totalLine += ' '.repeat(48) + '║';
console.log(totalLine);
console.log('╚════════════════════════════════╧═════════╧═══════╧═════════╛\n');

// Résumé
console.log('📊 RÉSUMÉ:');
console.log(`  📺 OTAKU:    ${totals.otaku} commandes (Anime, RPG, Quêtes, Fun)`);
console.log(`  🎮 GAMIN:    ${totals.gamin} commandes (MLBB uniquement)`);
console.log(`  🌟 COMPLET:  ${totals.complet} commandes (Tout + Admin + NSFW)\n`);
