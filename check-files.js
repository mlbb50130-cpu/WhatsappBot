const fs = require('fs');
const path = require('path');

console.clear();
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   🔍 VÉRIFICATION COMPLÈTE DU PROJET               ║');
console.log('║   Vérifie tous les fichiers et dépendances         ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Configuration à vérifier
const requiredFiles = {
  'Core Files': {
    'src/index.js': 'Point d\'entrée du bot',
    'src/handler.js': 'Gestionnaire des messages',
    'src/config.js': 'Configuration',
    'src/database.js': 'Connexion MongoDB',
    'package.json': 'Dépendances npm',
    '.env': 'Variables d\'environnement',
  },
  'Models': {
    'src/models/User.js': 'Modèle utilisateur',
    'src/models/Group.js': 'Modèle groupe',
    'src/models/Inventory.js': 'Modèle inventaire',
    'src/models/Quest.js': 'Modèle quête',
    'src/models/Warn.js': 'Modèle avertissement',
  },
  'Utils': {
    'src/utils/cooldown.js': 'Gestionnaire cooldown',
    'src/utils/xpSystem.js': 'Système XP',
    'src/utils/permissions.js': 'Système permissions',
    'src/utils/groupManager.js': 'Gestionnaire groupes',
    'src/utils/cache.js': 'Cache système',
    'src/utils/errorHandler.js': 'Gestionnaire erreurs',
    'src/utils/jikanAPI.js': 'API Jikan anime',
    'src/utils/antiSpam.js': 'Anti-spam',
    'src/utils/antiLink.js': 'Anti-liens',
    'src/utils/random.js': 'Générateur aléatoire',
    'src/utils/adminActions.js': 'Actions admin',
    'src/utils/permissionManagerV2.js': 'Gestionnaire permissions v2',
  },
  'Commands': {
    'src/commands/ping.js': 'Commande ping',
    'src/commands/help.js': 'Commande aide',
    'src/commands/profil.js': 'Commande profil',
    'src/commands/level.js': 'Commande niveau',
    'src/commands/stats.js': 'Commande stats',
    'src/commands/classement.js': 'Commande classement',
    'src/commands/quiz.js': 'Commande quiz',
    'src/commands/loot.js': 'Commande loot',
    'src/commands/duel.js': 'Commande duel',
    'src/commands/pfc.js': 'Pierre-Papier-Ciseaux',
    'src/commands/roulette.js': 'Commande roulette',
    'src/commands/waifu.js': 'Commande waifu',
    'src/commands/husbando.js': 'Commande husbando',
    'src/commands/ship.js': 'Commande ship',
    'src/commands/blagueotaku.js': 'Blagues otaku',
    'src/commands/roast.js': 'Commande roast',
    'src/commands/inventaire.js': 'Commande inventaire',
    'src/commands/chance.js': 'Commande chance',
    'src/commands/info.js': 'Commande info',
    'src/commands/menu.js': 'Commande menu',
    'src/commands/reponse.js': 'Auto-réponses',
  },
  'Admin Commands': {
    'src/commands/admin/admins.js': 'Gérer admins',
    'src/commands/admin/promote.js': 'Promouvoir modérateur',
    'src/commands/admin/demote.js': 'Rétrograder modérateur',
    'src/commands/admin/warn.js': 'Avertir utilisateur',
    'src/commands/admin/kick.js': 'Expulser utilisateur',
    'src/commands/admin/mute.js': 'Mute utilisateur',
    'src/commands/admin/unmute.js': 'Unmute utilisateur',
    'src/commands/admin/lock.js': 'Verrouiller groupe',
    'src/commands/admin/unlock.js': 'Déverrouiller groupe',
    'src/commands/admin/clear.js': 'Effacer messages',
    'src/commands/admin/setxp.js': 'Définir XP',
    'src/commands/admin/groupinfo.js': 'Info groupe',
  },
  'Config': {
    'src/config/adminConfig.js': 'Configuration admin',
  },
  'Documentation': {
    'README.md': 'Documentation principale',
    'DEPLOY_LOCAL_QUICK.md': 'Guide déploiement local',
    '.env.example.complete': 'Template .env',
  },
};

let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;

// Fonction pour vérifier un fichier
function checkFile(filePath, description) {
  totalFiles++;
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`  ✅ ${filePath.padEnd(45)} (${sizeKB}KB) - ${description}`);
    return true;
  } else {
    console.log(`  ❌ ${filePath.padEnd(45)} MANQUANT - ${description}`);
    totalErrors++;
    return false;
  }
}

// Vérifier chaque catégorie
for (const [category, files] of Object.entries(requiredFiles)) {
  console.log(`\n📁 ${category}:`);
  for (const [file, desc] of Object.entries(files)) {
    checkFile(file, desc);
  }
}

// Vérifier node_modules
console.log(`\n📦 Dépendances:`);
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  const modules = fs.readdirSync(nodeModulesPath).length;
  console.log(`  ✅ node_modules (${modules} packages installed)`);
} else {
  console.log(`  ⚠️  node_modules non trouvé - Lancez: npm install`);
  totalWarnings++;
}

// Vérifier .env
console.log(`\n🔐 Configuration:`);
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasPhoneNumber = envContent.includes('PHONE_NUMBER');
  const hasMongoURI = envContent.includes('MONGODB_URI');
  
  console.log(`  ✅ .env trouvé`);
  console.log(`    ${hasPhoneNumber ? '✅' : '❌'} PHONE_NUMBER configuré`);
  console.log(`    ${hasMongoURI ? '✅' : '❌'} MONGODB_URI configuré`);
  
  if (!hasPhoneNumber || !hasMongoURI) {
    totalWarnings++;
  }
} else {
  console.log(`  ❌ .env non trouvé`);
  totalErrors++;
}

// Résumé
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║                    📊 RÉSUMÉ                        ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log(`📊 Total fichiers vérifiés: ${totalFiles}`);
console.log(`✅ Fichiers présents: ${totalFiles - totalErrors}`);
console.log(`❌ Fichiers manquants: ${totalErrors}`);
console.log(`⚠️  Avertissements: ${totalWarnings}\n`);

if (totalErrors === 0) {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   ✨ TOUS LES FICHIERS SONT PRÉSENTS! ✨          ║');
  console.log('║   Le projet est prêt pour le déploiement           ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  process.exit(0);
} else {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log(`║   ❌ ${totalErrors} FICHIER(S) MANQUANT(S)                      ║`);
  console.log('║   Veuillez créer les fichiers manquants            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  process.exit(1);
}
