const MessageFormatter = require('../utils/messageFormatter');
const ModuleManager = require('../utils/ModuleManager');

// Menu pour le pack OTAKU
const OTAKU_CATEGORIES = {
  1: { name: 'PROFIL & LEVEL', commands: ['!profil - Voir ton profil', '!level - Voir ton niveau', '!xp - Voir ton XP', '!rank - Voir ton rang', '!stats - Voir tes stats', '!badges - Voir tes badges'] },
  2: { name: 'QUÊTES & RPG', commands: ['!quete - Quêtes', '!quotidien - Quotidienne', '!hebdo - Hebdomadaire', '!quetelundi - Quête lundi'] },
  3: { name: 'DUELS & COMBATS', commands: ['!duel @user - Défier', '!powerlevel - Power level', '!chakra - Chakra'] },
  4: { name: 'QUIZ & JEUX', commands: ['!quiz - Quiz otaku', '!quizanime - Quiz anime', '!pfc - Pierre-Feuille-Ciseaux', '!roulette - Roulette russe'] },
  5: { name: 'GOLD & ÉCONOMIE', commands: ['!work - Travailler 1h', '!daily - Bonus quotidien', '!gold - Solde gold'] },
  6: { name: 'LOOT & INVENTAIRE', commands: ['!loot - Lancer un loot', '!inventaire - Inventaire', '!equip - Équiper', '!collection - Collection'] },
  7: { name: 'ANIME & MANGA', commands: ['!anime [nom] - Info anime', '!manga [nom] - Info manga', '!personnage [nom] - Info perso', '!voiranime - Voir anime'] },
  8: { name: 'IMAGES ANIME', commands: ['!waifu - Waifu', '!husbando - Husbando', '!neko - Chat anime', '!animegif - GIF anime'] },
  9: { name: 'PERSONNAGES', commands: ['!bleach - Bleach', '!naruto - Naruto', '!gojo - Gojo', '!deku - Deku', '!madara - Madara', '!sukuna - Sukuna', '!vegito - Vegito', '!miku - Miku', '!zerotwo - Zero Two'] },
  10: { name: 'FUN', commands: ['!blagueotaku - Blague', '!roast @user - Roast', '!chance - Chance', '!ship - Ship', '!sticker - Sticker'] },
  11: { name: 'CLASSEMENTS', commands: ['!topanime - Top animes', '!topmanga - Top mangas', '!classement - Classement'] },
  12: { name: 'ADMIN', commands: ['!theme [nom] - Changer theme', '!activatebot - Activer bot', '!admins - Admins group'] },
  13: { name: 'BOT', commands: ['!menu - Menu', '!ping - Latence', '!info - Info bot', '!regles - Règles', '!whoami - Identité', '!help [cmd] - Aide', '!documentation - Documentation'] }
};

// Menu pour le pack MLBB
const MLBB_CATEGORIES = {
  1: { name: 'HÉROS & INFOS', commands: ['!hero <nom> - Infos héros', '!heroes - Liste héros', '!build <nom> - Builds', '!counter <nom> - Counters', '!combo <nom> - Combos'] },
  2: { name: 'META & STRATÉGIE', commands: ['!meta - Tier list', '!lane <role> - Guide lane', '!tip - Conseil aléatoire'] },
  3: { name: 'PROFIL & ÉQUIPES', commands: ['!mlbb set <rang> <role> - Profil', '!mlbb me - Mon profil', '!team <nom> - Équipe', '!join <team> - Rejoindre', '!leave - Quitter'] },
  4: { name: 'ADMIN', commands: ['!selectpack - Changer pack', '!setmodule - Gérer modules', '!activatebot - Activer bot'] },
  5: { name: 'BOT', commands: ['!mlbbmenu - Menu MLBB', '!ping - Latence', '!help [cmd] - Aide'] }
};

// Menu pour le pack COMPLET (tous les modules)
const COMPLET_CATEGORIES = {
  1: { name: 'PROFIL & LEVEL', commands: ['!profil - Voir ton profil', '!level - Voir ton niveau', '!xp - Voir ton XP', '!rank - Voir ton rang', '!stats - Voir tes stats', '!badges - Voir tes badges'] },
  2: { name: 'QUÊTES & RPG', commands: ['!quete - Quêtes', '!quotidien - Quotidienne', '!hebdo - Hebdomadaire', '!quetelundi - Quête lundi'] },
  3: { name: 'DUELS & COMBATS', commands: ['!duel @user - Défier', '!powerlevel - Power level', '!chakra - Chakra'] },
  4: { name: 'QUIZ & JEUX', commands: ['!quiz - Quiz otaku', '!quizanime - Quiz anime', '!pfc - Pierre-Feuille-Ciseaux', '!roulette - Roulette russe'] },
  5: { name: 'GOLD & ÉCONOMIE', commands: ['!work - Travailler 1h', '!daily - Bonus quotidien', '!gold - Solde gold'] },
  6: { name: 'LOOT & INVENTAIRE', commands: ['!loot - Lancer un loot', '!inventaire - Inventaire', '!equip - Équiper', '!collection - Collection'] },
  7: { name: 'ANIME & MANGA', commands: ['!anime [nom] - Info anime', '!manga [nom] - Info manga', '!personnage [nom] - Info perso', '!voiranime - Voir anime'] },
  8: { name: 'IMAGES ANIME', commands: ['!waifu - Waifu', '!husbando - Husbando', '!neko - Chat anime', '!animegif - GIF anime'] },
  9: { name: 'PERSONNAGES', commands: ['!bleach - Bleach', '!naruto - Naruto', '!gojo - Gojo', '!deku - Deku', '!madara - Madara', '!sukuna - Sukuna', '!vegito - Vegito', '!miku - Miku', '!zerotwo - Zero Two'] },
  10: { name: 'FUN', commands: ['!blagueotaku - Blague', '!roast @user - Roast', '!chance - Chance', '!ship - Ship', '!sticker - Sticker'] },
  11: { name: 'MLBB', commands: ['!mlbb - Menu MLBB', '!hero <nom> - Infos héros', '!build <nom> - Builds', '!counter <nom> - Counters', '!combo <nom> - Combos', '!meta - Tier list', '!lane <role> - Guide lane', '!team <nom> - Équipe'] },
  12: { name: 'CLASSEMENTS', commands: ['!topanime - Top animes', '!topmanga - Top mangas', '!classement - Classement'] },
  13: { name: 'ADMIN', commands: ['!theme [nom] - Changer theme', '!selectpack - Changer pack', '!setmodule - Modules', '!activatebot - Activer bot', '!admins - Admins'] },
  14: { name: 'BOT', commands: ['!menu - Menu', '!ping - Latence', '!info - Info bot', '!regles - Règles', '!whoami - Identité', '!help [cmd] - Aide', '!documentation - Documentation'] }
};

const CATEGORIES = OTAKU_CATEGORIES; // Par défaut

module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  category: 'BOT',
  usage: '!menu [numéro]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const categoryNum = args[0] ? parseInt(args[0]) : null;

    // Déterminer quel pack est activé pour ce groupe
    let activePack = 'otaku'; // Par défaut
    let activeCategories = OTAKU_CATEGORIES;
    
    if (isGroup && groupData) {
      const groupModules = ModuleManager.getGroupModules(senderJid);
      
      // Vérifier quel pack est activé
      const mlbbEnabled = groupModules.mlbb === true;
      const animeEnabled = groupModules.anime !== false;
      const xpEnabled = groupModules.xp !== false;
      const queteEnabled = groupModules.quete !== false;
      
      if (mlbbEnabled && !animeEnabled && !xpEnabled && !queteEnabled) {
        activePack = 'mlbb';
        activeCategories = MLBB_CATEGORIES;
      } else if (mlbbEnabled && animeEnabled && xpEnabled && queteEnabled) {
        activePack = 'complet';
        activeCategories = COMPLET_CATEGORIES;
      }
    }

    // Si un numéro est fourni, afficher la catégorie
    if (categoryNum && activeCategories[categoryNum]) {
      const category = activeCategories[categoryNum];
      const menu = MessageFormatter.elegantSection(category.name, category.commands);
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(menu));
      return;
    }

    // Sinon afficher le menu principal avec les catégories numérotées
    let mainMenu = `╔════════════════════════════════════╗
║    MENU - Pack: ${activePack.toUpperCase()}              ║
╚════════════════════════════════════╝
`;

    const categoryKeys = Object.keys(activeCategories);
    for (let i = 0; i < categoryKeys.length; i++) {
      const key = categoryKeys[i];
      const category = activeCategories[key];
      const isLast = i === categoryKeys.length - 1;
      const prefix = isLast ? '└' : '├';
      mainMenu += `${prefix} ☆ ${key} - ${category.name}\n`;
    }

    mainMenu += '═════════════════════════════════════';

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(mainMenu));
  }
};
