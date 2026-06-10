const fs = require('fs');
const path = require('path');

// Charger les pack commands
const PackManager = require('./src/utils/PackManager');

// Récupérer toutes les commandes physiques
function getAllCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, 'src/commands');
  
  // Scanner récursivement
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        // Ne pas compter le dossier assets
        if (file !== 'assets') {
          scanDir(fullPath);
        }
      } else if (file.endsWith('.js') && !file.startsWith('.')) {
        // Lire le fichier pour obtenir le nom et les alias
        const content = fs.readFileSync(fullPath, 'utf8');
        const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
        const aliasesMatch = content.match(/aliases:\s*\[(.*?)\]/s);
        
        if (nameMatch) {
          const name = nameMatch[1];
          const aliases = [];
          if (aliasesMatch) {
            const aliasStr = aliasesMatch[1];
            const matches = aliasStr.match(/['"]([^'"]+)['"]/g);
            if (matches) {
              matches.forEach(m => {
                aliases.push(m.replace(/['"]/, '').replace(/['"]/, ''));
              });
            }
          }
          commands.push({ name, aliases, file });
        }
      }
    });
  }
  
  scanDir(commandsPath);
  return commands;
}

// Récupérer les packs
const packs = require('./src/utils/PackManager');
const PACK_COMMANDS = {
  otaku: [
    'profil', 'level', 'xp', 'rank', 'stats', 'badges',
    'duel', 'powerlevel', 'chakra',
    'quete', 'quotidien', 'hebdo', 'quetelundi',
    'quiz', 'quizanime', 'pfc', 'roulette', 'reponse',
    'loot', 'inventaire', 'equip', 'equipement', 'collection',
    'waifu', 'husbando', 'neko', 'animegif', 'ship',
    'bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo',
    'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi',
    'blagueotaku', 'roast', 'chance', 'sticker',
    'anime', 'manga', 'mangadex', 'personnage', 'voiranime',
    'topanime', 'topmanga', 'classement',
    'theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami'
  ],
  gamin: [
    'mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile',
    'hero', 'heroe', 'champion', 'personnage',
    'build', 'builds', 'items', 'set',
    'counter', 'counters', 'beat', 'antiheroe',
    'combo', 'combos',
    'meta', 'metagame', 'tier', 'tierlist',
    'lane', 'lanes',
    'tip', 'tips', 'conseil', 'conseils',
    'team', 'equipe', 'squad', 'crew',
    'join', 'j',
    'leave', 'l',
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    'selectpack', 'setmodule',
    'activatebot', 'admins',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu'
  ]
};

const allCommands = getAllCommands();


// Afficher pack OTAKU
const otakuCommands = PACK_COMMANDS.otaku;

// Afficher pack GAMIN
const gaminCommands = PACK_COMMANDS.gamin;

// Commandes non configurées
const allCommandNames = new Set();
allCommands.forEach(cmd => {
  allCommandNames.add(cmd.name);
  cmd.aliases.forEach(alias => allCommandNames.add(alias));
});

const configuredCommands = new Set([...PACK_COMMANDS.otaku, ...PACK_COMMANDS.gamin]);
const notConfigured = Array.from(allCommandNames).filter(cmd => !configuredCommands.has(cmd)).sort();

if (notConfigured.length > 0) {
  notConfigured.forEach(cmd => {
    const cmdInfo = allCommands.find(c => c.name === cmd || c.aliases.includes(cmd));
    if (cmdInfo) {
    }
  });
} else {
}
