// Gestionnaire de packs de commandes
const ModuleManager = require('./ModuleManager');

// Définir les commandes par pack
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
    'mlbb', 'ml', 'legends', 'moba',
    'hero', 'build', 'counter', 'combo',
    'meta', 'lane', 'tip',
    'team', 'join', 'leave',
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    'selectpack', 'setmodule',
    'activatebot', 'admins',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu'
  ],
  complet: [
    // Tous les OTAKU + MLBB
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
    'mlbb', 'ml', 'legends', 'moba',
    'hero', 'build', 'counter', 'combo',
    'meta', 'lane', 'tip',
    'team', 'join', 'leave',
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    'selectpack', 'setmodule',
    'theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai',
    'hentai', 'hentaivd', 'boahancook',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami', 'assets', 'nsfw', 'chakratest'
  ]
};

class PackManager {
  static PACKS = {
    otaku: {
      name: '📺 RPG OTAKU',
      description: 'Commandes Anime, RPG, Quêtes, Aventures',
      emoji: '🎌',
      modules: {
        anime: true,
        fun: true,
        xp: true,
        items: true,
        quete: true,
        nsfw: false,
        mlbb: false
      }
    },
    gamin: {
      name: '🎮 MLBB GAMIN',
      description: 'Commandes Mobile Legends Bang Bang',
      emoji: '🎯',
      modules: {
        mlbb: true,
        anime: false,
        fun: false,
        xp: false,
        items: false,
        quete: false,
        nsfw: false
      }
    },
    complet: {
      name: '🌟 COMPLET',
      description: 'Tous les modules activés (Otaku + MLBB)',
      emoji: '⭐',
      modules: {
        mlbb: true,
        anime: true,
        fun: true,
        xp: true,
        items: true,
        quete: true,
        nsfw: false
      }
    },
    custom: {
      name: '⚙️ PERSONNALISÉ',
      description: 'Configurer chaque module individuellement',
      emoji: '🔧',
      modules: null // À configurer
    }
  };

  static getPacks() {
    return Object.entries(this.PACKS).map(([key, pack]) => ({
      id: key,
      ...pack
    }));
  }

  static getPackMessage() {
    const packs = this.getPacks();
    let message = `
╔═══════════════════════════════════╗
║   🎯 CHOISIR UN PACK DE COMMANDES ║
╚═══════════════════════════════════╝

Quel type de commandes voulez-vous?

`;

    packs.forEach((pack, i) => {
      message += `${i + 1}. ${pack.emoji} *${pack.name}*\n   ${pack.description}\n\n`;
    });

    message += `_Réponds par le numéro (ex: 1, 2, 3, ou 4)_\n\n`;
    message += `💡 *Exemple:* \`1\` pour RPG OTAKU`;

    return message;
  }

  static applyPack(packId, groupJid) {
    const pack = this.PACKS[packId.toLowerCase()];
    
    if (!pack || !pack.modules) {
      return null;
    }

    ModuleManager.setGroupModules(groupJid, pack.modules);
    return pack;
  }

  static getPackNameById(packId) {
    const pack = this.PACKS[packId.toLowerCase()];
    return pack ? pack.name : null;
  }

  static getPackDocumentation(packId) {
    const pack = this.PACKS[packId.toLowerCase()];
    
    if (!pack) return null;

    const docs = {
      otaku: `
╔═══════════════════════════════════╗
║    📺 RPG OTAKU - DOCUMENTATION   ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

📚 *MODULES ACTIVÉS:*
• 🎌 Anime - Personnages, waifus, husbandos
• 🎲 Fun - Jeux amusants, quiz, duels
• ⭐ XP - Système de niveaux et classement
• 📦 Items - Inventaire et équipement
• 📜 Quêtes - Aventures quotidiennes

🎮 *COMMANDES PRINCIPALES:*
!xp - Voir ton XP et niveau
!quete - Quêtes disponibles
!personnage - Infos sur un personnage
!duel @user - Défier quelqu'un
!inventaire - Voir ton inventaire

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      gamin: `
╔═══════════════════════════════════╗
║  🎮 MLBB GAMIN - DOCUMENTATION    ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

🎮 *MODULES ACTIVÉS:*
• 🎯 MLBB - Mobile Legends Bang Bang

📚 *COMMANDES PRINCIPALES:*
!hero <nom> - Info sur un héros
!build <nom> - Builds recommandées
!counter <nom> - Counters efficaces
!combo <nom> - Combos optimaux
!meta - État du meta actuel
!lane <nom> - Guide par lane
!team <nom> - Gestion équipes

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      complet: `
╔═══════════════════════════════════╗
║   🌟 COMPLET - DOCUMENTATION      ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

🎮 *TOUS LES MODULES ACTIVÉS:*
• 📺 Anime - Personnages et waifus
• 🎲 Fun - Jeux et divertissements
• ⭐ XP - Système RPG complet
• 📦 Items - Inventaire avancé
• 📜 Quêtes - Aventures quotidiennes
• 🎯 MLBB - Mobile Legends Bang Bang

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      custom: `
╔═══════════════════════════════════╗
║  ⚙️ PERSONNALISÉ - CONFIGURATION   ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

Vous pouvez configurer chaque module:
!setmodule on <module>
!setmodule off <module>
!setmodule status

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``
    };

    return docs[packId.toLowerCase()] || null;
  }

  // Déterminer quel pack est actuellement actif pour un groupe
  static getActivePack(groupJid) {
    const groupModules = ModuleManager.getGroupModules(groupJid);
    
    const mlbbEnabled = groupModules.mlbb === true;
    const animeEnabled = groupModules.anime !== false;
    const xpEnabled = groupModules.xp !== false;
    const queteEnabled = groupModules.quete !== false;
    
    if (mlbbEnabled && !animeEnabled && !xpEnabled && !queteEnabled) {
      return 'gamin';
    } else if (mlbbEnabled && animeEnabled && xpEnabled && queteEnabled) {
      return 'complet';
    }
    
    return 'otaku'; // Par défaut
  }

  // Vérifier si une commande est autorisée pour le pack du groupe
  static isCommandAllowedInPack(groupJid, commandName) {
    // Normaliser le nom de la commande
    const normalizedCommand = commandName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Les commandes globales sont toujours autorisées
    const globalCommands = ['ping', 'info', 'help', 'documentation', 'regles', 'menu', 'activatebot', 'admins', 'selectpack', 'setmodule', 'theme'];
    if (globalCommands.includes(normalizedCommand)) {
      return true;
    }

    const activePack = this.getActivePack(groupJid);
    const allowedCommands = PACK_COMMANDS[activePack] || [];
    
    return allowedCommands.includes(normalizedCommand);
  }

  // Obtenir le message d'erreur pour une commande non autorisée
  static getUnauthorizedMessage(groupJid, commandName) {
    const activePack = this.getActivePack(groupJid);
    const packInfo = this.PACKS[activePack];
    
    return `🚫 *Commande non disponible dans ce groupe*

Le groupe utilise actuellement le pack: *${packInfo.name}*

Cette commande n'est pas disponible dans ce pack.

Pour changer de pack, l'admin peut utiliser: \`!selectpack\``;
  }
}

module.exports = PackManager;
