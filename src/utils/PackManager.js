// Gestionnaire de packs de commandes
const ModuleManager = require('./ModuleManager');

// Définir les commandes par pack
const PACK_COMMANDS = {
  otaku: [
    // Profil & Niveau
    'profil', 'level', 'xp', 'rank', 'stats', 'badges',
    // Duels & Combats
    'duel', 'powerlevel', 'chakra',
    // Quêtes & RPG
    'quete', 'quotidien', 'hebdo', 'quetelundi',
    // Quiz & Jeux
    'quiz', 'quizanime', 'pfc', 'roulette', 'reponse',
    // Loot & Inventaire
    'loot', 'inventaire', 'equip', 'equipement', 'collection',
    // Images Anime
    'waifu', 'husbando', 'neko', 'animegif', 'ship',
    // Personnages (anime characters avec assets)
    'bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo',
    'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi',
    'nino',
    // Fun
    'blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick',
    // Anime & Manga
    'anime', 'manga', 'mangadex', 'personnage', 'voiranime',
    // Classements
    'topanime', 'topmanga', 'classement',
    // Admin & Système (OTAKU SEULEMENT - pas MLBB assets)
    'theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow',
    // NSFW
    'hentai', 'hentaivd', 'boahancook', 'nsfw',
    // Bot
    'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami'
  ],
  gamin: [
    // Profil MLBB
    'mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile',
    // Héros & Infos
    'hero', 'heroe', 'champion', 'personnage',
    'build', 'builds', 'items', 'set',
    'counter', 'counters', 'beat', 'antiheroe',
    'combo', 'combos', 'cc', 'rotation',
    // Meta & Stratégie
    'meta', 'metagame', 'tier', 'tierlist',
    'lane', 'lanes', 'guide', 'position', 'role',
    'tip', 'tips', 'conseil', 'conseils',
    // Équipes
    'team', 'equipe', 'squad', 'crew',
    'join', 'j',
    'leave', 'l',
    // Menus & Guides
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    // Admin
    'selectpack', 'setmodule', 'pack', 'packselect', 'choosepack',
    'activatebot', 'admins', 'admin',
    // Bot
    'ping', 'info', 'regles', 'help', 'documentation', 'menu'
  ],
  complet: [
    // Profil & Niveau (OTAKU)
    'profil', 'level', 'xp', 'rank', 'stats', 'badges',
    // Duels & Combats (OTAKU)
    'duel', 'powerlevel', 'chakra',
    // Quêtes & RPG (OTAKU)
    'quete', 'quotidien', 'hebdo', 'quetelundi',
    // Quiz & Jeux (OTAKU)
    'quiz', 'quizanime', 'pfc', 'roulette', 'reponse',
    // Loot & Inventaire (OTAKU)
    'loot', 'inventaire', 'equip', 'equipement', 'collection',
    // Images Anime (OTAKU)
    'waifu', 'husbando', 'neko', 'animegif', 'ship',
    // Personnages Anime (OTAKU)
    'bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo',
    'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi',
    'nino',
    // Fun (OTAKU)
    'blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick',
    // Anime & Manga (OTAKU)
    'anime', 'manga', 'mangadex', 'personnage', 'voiranime',
    // Classements (OTAKU)
    'topanime', 'topmanga', 'classement',
    // Profil MLBB (GAMIN)
    'mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile',
    // Héros & Infos (GAMIN)
    'hero', 'heroe', 'champion',
    'build', 'builds', 'items', 'set',
    'counter', 'counters', 'beat', 'antiheroe',
    'combo', 'combos', 'cc', 'rotation',
    // Meta & Stratégie (GAMIN)
    'meta', 'metagame', 'tier', 'tierlist',
    'lane', 'lanes', 'guide', 'position', 'role',
    'tip', 'tips', 'conseil', 'conseils',
    // Équipes (GAMIN)
    'team', 'equipe', 'squad', 'crew',
    'join', 'j',
    'leave', 'l',
    // Menus & Guides (GAMIN)
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    // Admin & Modération (COMPLET SEULEMENT)
    'selectpack', 'setmodule', 'pack', 'packselect', 'choosepack',
    'warn', 'avertir', 'kick', 'expulser', 'lock', 'verrouiller', 'unlock', 'deverrouiller',
    'mute', 'silence', 'desimulet', 'unmute', 'promote', 'promouvoir', 'demote', 'retrograder',
    'clear', 'nettoyer', 'groupinfo', 'groupeinfo', 'infogroupes', 'everyone', 'all', 'tous',
    'setxp', 'fixerxp', 'tournoisquiz', 'tournoi', 'tourquiz',
    // Thème & Système
    'theme', 'activatebot', 'admins', 'admin', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow',
    // NSFW (COMPLET SEULEMENT)
    'hentai', 'hentaivd', 'boahancook', 'nsfw',
    // Bot
    'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami', 'assets', 'chakratest'
  ]
};

class PackManager {
  static PACKS = {
    otaku: {
      name: '📺 RPG OTAKU',
      description: 'Commandes Anime, RPG, Quêtes, Aventures, NSFW',
      emoji: '🎌',
      modules: {
        anime: true,
        fun: true,
        xp: true,
        items: true,
        quete: true,
        nsfw: true,
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
