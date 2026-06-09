const MessageFormatter = require('../utils/messageFormatter');
const ModuleManager = require('../utils/ModuleManager');

const OTAKU_CATEGORIES = {
  1: { name: 'Profil et progression', commands: ['!profil - Voir ton profil', '!level - Voir ton niveau', '!xp - Voir ton XP', '!rank - Voir ton rang', '!stats - Voir tes stats', '!badges - Voir tes badges'] },
  2: { name: 'Quêtes et RPG', commands: ['!quete - Quêtes actives', '!quotidien - Récompense quotidienne', '!hebdo - Récompense hebdomadaire', '!quetelundi - Quête du lundi'] },
  3: { name: 'Duels et combats', commands: ['!duel @user - Défier un joueur', '!powerlevel - Niveau de puissance', '!chakra - Voir ton chakra'] },
  4: { name: 'Quiz et jeux', commands: ['!quiz - Quiz otaku', '!quizanime - Quiz anime', '!reponse [A-D] - Répondre', '!tournoisquiz - Tournoi quiz admin', '!pfc - Pierre-Feuille-Ciseaux', '!roulette - Roulette'] },
  5: { name: 'Gold et économie', commands: ['!work - Travailler', '!daily - Bonus quotidien', '!gold - Solde gold'] },
  6: { name: 'Loot et inventaire', commands: ['!loot - Ouvrir un loot', '!inventaire - Voir inventaire', '!equip - Équiper un objet', '!equipement - Équipement actif', '!collection - Collection'] },
  7: { name: 'Anime et manga', commands: ['!anime [nom] - Info anime', '!manga [nom] - Info manga', '!personnage [nom] - Info personnage', '!voiranime - Où regarder'] },
  8: { name: 'Images anime', commands: ['!waifu - Image waifu', '!husbando - Image husbando', '!neko - Image neko', '!animegif - GIF anime'] },
  9: { name: 'Personnages', commands: ['!bleach - Bleach', '!naruto - Naruto', '!gojo - Gojo', '!deku - Deku', '!madara - Madara', '!sukuna - Sukuna', '!vegito - Vegito', '!miku - Miku', '!zerotwo - Zero Two', '!gokuui - Goku UI', '!jinwoo - Jinwoo', '!livai - Livai', '!makima - Makima', '!mikunakano - Miku Nakano', '!rengokudemon - Rengoku Demon', '!tengen - Tengen', '!tsunade - Tsunade', '!yami - Yami', '!yoruichi - Yoruichi', '!nino - Nino'] },
  10: { name: 'Fun', commands: ['!blagueotaku - Blague', '!roast @user - Roast', '!chance - Chance du jour', '!ship - Compatibilité', '!sticker - Créer un sticker', '!viewonce - Révéler une vue unique'] },
  11: { name: 'Classements', commands: ['!classement - Classement XP', '!topanime - Top animes', '!topmanga - Top mangas'] },
  12: { name: 'Administration', commands: ['!theme [nom] - Changer le thème', '!activatebot - Activer le bot', '!desactivatebot - Désactiver le bot', '!admins - Liste des admins', '!selectpack - Choisir un pack', '!setmodule - Gérer les modules', '!allowhentai on/off - NSFW', '!warn @user - Avertir', '!kick @user - Expulser', '!lock - Verrouiller', '!unlock - Déverrouiller', '!mute - Rendre muet', '!unmute - Retirer le mute', '!promote @user - Promouvoir', '!demote @user - Rétrograder', '!clear - Nettoyer', '!groupinfo - Info groupe', '!setxp - Modifier XP'] },
  13: { name: 'NSFW', commands: ['!hentai - Image adulte', '!hentaivd - Vidéo adulte', '!nsfw - NSFW', '!boahancook - Boa Hancock'] },
  14: { name: 'Bot', commands: ['!menu - Menu', '!ping - Latence', '!info - Info bot', '!regles - Règles', '!whoami - Identité', '!help [cmd] - Aide', '!documentation - Documentation', '!assets - Liste assets', '!chakratest - Debug chakra'] },
};

const MLBB_CATEGORIES = {
  1: { name: 'Héros et infos', commands: ['!hero <nom> - Infos héros', '!heroes - Liste des héros', '!build <nom> - Builds', '!counter <nom> - Counters', '!combo <nom> - Combos'] },
  2: { name: 'Meta et stratégie', commands: ['!meta - Tier list', '!lane <role> - Guide lane', '!tip - Conseil aléatoire'] },
  3: { name: 'Profil et équipes', commands: ['!mlbb set <rang> <role> - Profil MLBB', '!mlbb me - Mon profil', '!team <nom> - Équipe', '!join <team> - Rejoindre', '!leave - Quitter'] },
  4: { name: 'Administration', commands: ['!selectpack - Changer de pack', '!setmodule - Gérer les modules', '!activatebot - Activer le bot'] },
  5: { name: 'Bot', commands: ['!mlbbmenu - Menu MLBB', '!ping - Latence', '!help [cmd] - Aide'] },
};

const COMPLET_CATEGORIES = {
  ...OTAKU_CATEGORIES,
  11: { name: 'MLBB', commands: ['!mlbb - Menu MLBB', '!hero <nom> - Infos héros', '!heroes - Liste héros', '!build <nom> - Builds', '!counter <nom> - Counters', '!combo <nom> - Combos', '!meta - Tier list', '!lane <role> - Guide lane', '!tip - Conseil', '!team <nom> - Équipe', '!join <team> - Rejoindre', '!leave - Quitter'] },
  12: { name: 'Classements', commands: ['!classement - Classement XP', '!topanime - Top animes', '!topmanga - Top mangas'] },
  13: { name: 'Administration', commands: OTAKU_CATEGORIES[12].commands },
  14: { name: 'NSFW', commands: OTAKU_CATEGORIES[13].commands },
  15: { name: 'Bot', commands: OTAKU_CATEGORIES[14].commands },
};

function resolveActiveMenu(senderJid, isGroup, groupData) {
  let activePack = 'otaku';
  let activeCategories = OTAKU_CATEGORIES;

  if (isGroup && groupData) {
    const groupModules = ModuleManager.getGroupModules(senderJid);
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

  return { activePack, activeCategories };
}

function buildMainMenu(activePack, categories) {
  const categoryLines = Object.entries(categories).map(([number, category]) => {
    return `${number}. ${category.name} — \`!menu ${number}\``;
  });

  return MessageFormatter.panel({
    title: 'TetsuBot - Menu',
    subtitle: `Pack actif: ${activePack.toUpperCase()}`,
    body: [
      ...categoryLines,
      '',
      'Utilise `!menu <numéro>` pour ouvrir une catégorie.',
      'Utilise `!help <commande>` pour obtenir le détail d’une commande.',
    ],
  });
}

function buildCategoryMenu(number, category) {
  return MessageFormatter.panel({
    title: category.name,
    subtitle: `Catégorie ${number}`,
    body: [
      ...category.commands,
      '',
      'Retour au menu principal: `!menu`',
    ],
  });
}

module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  category: 'BOT',
  usage: '!menu [numéro]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const categoryNum = args[0] ? parseInt(args[0], 10) : null;
    const { activePack, activeCategories } = resolveActiveMenu(senderJid, isGroup, groupData);

    if (categoryNum && activeCategories[categoryNum]) {
      const menu = buildCategoryMenu(categoryNum, activeCategories[categoryNum]);
      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(menu));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(menu));
      }
      return;
    }

    if (categoryNum && !activeCategories[categoryNum]) {
      const text = MessageFormatter.warning(`Catégorie introuvable. Choisis un numéro entre 1 et ${Object.keys(activeCategories).length}.`);
      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(senderJid, { text });
      }
      return;
    }

    const mainMenu = buildMainMenu(activePack, activeCategories);

    if (reply) {
      await reply(MessageFormatter.createMessageWithImage(mainMenu));
    } else {
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(mainMenu));
    }
  },
};
