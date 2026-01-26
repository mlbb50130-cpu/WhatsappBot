const MessageFormatter = require('../utils/messageFormatter');

const CATEGORIES = {
  1: { name: 'PROFIL & LEVEL', commands: ['!profil - Voir ton profil', '!level - Voir ton niveau', '!xp - Voir ton XP', '!rank - Voir ton rang', '!stats - Voir tes stats', '!badges - Voir tes badges'] },
  2: { name: 'DUELS & COMBATS', commands: ['!duel @user - Défier', '!powerlevel - Power level', '!chakra - Chakra'] },
  3: { name: 'QUÊTES & RPG', commands: ['!quete - Quêtes', '!quotidien - Quotidienne', '!hebdo - Hebdomadaire', '!quetelundi - Quête lundi'] },
  4: { name: 'QUIZ & JEUX', commands: ['!quiz - Quiz otaku', '!quizanime - Quiz anime', '!pfc - Pierre-Feuille-Ciseaux', '!roulette - Roulette russe'] },
  5: { name: 'LOOT & INVENTAIRE', commands: ['!loot - Lancer un loot', '!inventaire - Inventaire', '!equip - Équiper', '!collection - Collection'] },
  6: { name: 'IMAGES ANIME', commands: ['!waifu - Waifu', '!husbando - Husbando', '!neko - Chat anime', '!animegif - GIF anime'] },
  7: { name: 'PERSONNAGES', commands: ['!bleach - Bleach', '!naruto - Naruto', '!gojo - Gojo', '!deku - Deku', '!madara - Madara', '!sukuna - Sukuna', '!vegito - Vegito', '!miku - Miku', '!zerotwo - Zero Two'] },
  8: { name: 'FUN', commands: ['!blagueotaku - Blague', '!roast @user - Roast', '!chance - Chance', '!ship - Ship', '!sticker - Sticker'] },
  9: { name: 'ANIME & MANGA', commands: ['!anime [nom] - Info anime', '!manga [nom] - Info manga', '!personnage [nom] - Info perso', '!voiranime - Voir anime'] },
  10: { name: 'CLASSEMENTS', commands: ['!topanime - Top animes', '!topmanga - Top mangas', '!classement - Classement'] },
  11: { name: 'ADMIN', commands: ['!theme [nom] - Changer theme', '!activatebot - Activer bot', '!admins - Admins group'] },
  12: { name: 'BOT', commands: ['!ping - Latence', '!info - Info bot', '!regles - Règles', '!help [cmd] - Aide', '!documentation - Documentation'] }
};

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

    // Si un numéro est fourni, afficher la catégorie
    if (categoryNum && CATEGORIES[categoryNum]) {
      const category = CATEGORIES[categoryNum];
      const menu = MessageFormatter.elegantSection(category.name, category.commands);
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(menu));
      return;
    }

    // Sinon afficher le menu principal avec les catégories numérotées
    let mainMenu = `╔════════════════════════════════════╗
║            MENU                   ║
╚════════════════════════════════════╝

`;

    const categoryKeys = Object.keys(CATEGORIES);
    for (let i = 0; i < categoryKeys.length; i++) {
      const key = categoryKeys[i];
      const category = CATEGORIES[key];
      const isLast = i === categoryKeys.length - 1;
      const prefix = isLast ? '└' : '├';
      mainMenu += `${prefix} ☆ ${key} - ${category.name}\n`;
    }

    mainMenu += '\n═════════════════════════════════════';

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(mainMenu));
  }
};
