const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║         ⚠️  COMMANDES NON CONFIGURÉES DANS LES PACKS              ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

// Récupérer toutes les commandes existantes
function getAllCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, 'src/commands');
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'admin' && file !== 'assets') {
        scanDir(fullPath);
      } else if (file.endsWith('.js') && !file.startsWith('.')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
          const aliasesMatch = content.match(/aliases:\s*\[([\s\S]*?)\]/);
          
          if (nameMatch) {
            const name = nameMatch[1];
            const aliases = [];
            
            if (aliasesMatch) {
              const aliasStr = aliasesMatch[1];
              const matches = aliasStr.match(/['"]([^'"]+)['"]/g);
              if (matches) {
                matches.forEach(m => {
                  const clean = m.replace(/['"]/, '').replace(/['"]/, '');
                  aliases.push(clean);
                });
              }
            }
            
            if (!commands.has(name)) {
              commands.set(name, {
                name,
                aliases,
                file: path.relative(process.cwd(), fullPath)
              });
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    });
  }
  
  scanDir(commandsPath);
  return commands;
}

// Commandes configurées
const configuredCommands = new Set([
  // OTAKU
  'profil', 'level', 'xp', 'rank', 'stats', 'badges',
  'duel', 'powerlevel', 'chakra',
  'quete', 'quotidien', 'hebdo', 'quetelundi',
  'quiz', 'quizanime', 'pfc', 'roulette', 'reponse',
  'loot', 'inventaire', 'equip', 'equipement', 'collection',
  'waifu', 'husbando', 'neko', 'animegif', 'ship',
  'bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo',
  'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi',
  'nino',
  'blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick',
  'anime', 'manga', 'mangadex', 'personnage', 'voiranime',
  'topanime', 'topmanga', 'classement',
  'theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow',
  'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami',
  // GAMIN
  'mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile',
  'hero', 'heroe', 'champion', 'personnage',
  'build', 'builds', 'items', 'set',
  'counter', 'counters', 'beat', 'antiheroe',
  'combo', 'combos', 'cc', 'rotation',
  'meta', 'metagame', 'tier', 'tierlist',
  'lane', 'lanes', 'guide', 'position', 'role',
  'tip', 'tips', 'conseil', 'conseils',
  'team', 'equipe', 'squad', 'crew',
  'join', 'j',
  'leave', 'l',
  'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
  'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
  'selectpack', 'setmodule', 'pack', 'packselect', 'choosepack',
  'activatebot', 'admins', 'admin',
  // COMPLET (admin + nsfw)
  'warn', 'avertir', 'kick', 'expulser', 'lock', 'verrouiller', 'unlock', 'deverrouiller',
  'mute', 'silence', 'desimulet', 'unmute', 'promote', 'promouvoir', 'demote', 'retrograder',
  'clear', 'nettoyer', 'groupinfo', 'groupeinfo', 'infogroupes', 'everyone', 'tous', 'all',
  'setxp', 'fixerxp', 'tournoisquiz', 'tournoi', 'tourquiz',
  'hentai', 'hentaivd', 'boahancook', 'nsfw',
  'assets', 'chakratest'
]);

// Récupérer les commandes
const allCommands = getAllCommands();

// Trouver les commandes non configurées
const notConfigured = [];
allCommands.forEach((cmd, name) => {
  if (!configuredCommands.has(name)) {
    notConfigured.push(cmd);
  }
});

// Trier
notConfigured.sort((a, b) => a.name.localeCompare(b.name));

if (notConfigured.length === 0) {
  console.log('✅ EXCELLENT! Toutes les commandes sont configurées dans les packs!\n');
} else {
  console.log(`❌ ${notConfigured.length} commandes ne sont pas configurées:\n`);
  
  notConfigured.forEach((cmd, idx) => {
    console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${cmd.name.padEnd(25)} (${cmd.file})`);
    if (cmd.aliases.length > 0) {
      console.log(`    Aliases: ${cmd.aliases.join(', ')}`);
    }
  });
  
  console.log('\n');
  console.log('📝 SUGGESTIONS:');
  console.log('─'.repeat(70));
  notConfigured.forEach(cmd => {
    console.log(`  • ${cmd.name}`);
  });
}

console.log('\n📊 RÉSUMÉ');
console.log('═'.repeat(70));
console.log(`  ✅ Commandes configurées: ${allCommands.size - notConfigured.length}/${allCommands.size}`);
console.log(`  ❌ Commandes non configurées: ${notConfigured.length}/${allCommands.size}`);
console.log(`  📈 Couverture: ${Math.round(((allCommands.size - notConfigured.length) / allCommands.size) * 100)}%`);
console.log('');
