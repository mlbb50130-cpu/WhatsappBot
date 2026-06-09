const MessageFormatter = require('../utils/messageFormatter');
const ModuleManager = require('../utils/ModuleManager');

const OTAKU_CATEGORIES = {
  1: { name: 'Profil', commands: ['!profil', '!level', '!xp', '!rank', '!stats', '!badges'] },
  2: { name: 'Quetes', commands: ['!quete', '!quotidien', '!hebdo', '!quetelundi'] },
  3: { name: 'Duels', commands: ['!duel @user', '!powerlevel', '!chakra'] },
  4: { name: 'Jeux', commands: ['!quiz', '!quizanime', '!reponse A-D', '!pfc', '!roulette'] },
  5: { name: 'Gold', commands: ['!work', '!daily', '!gold'] },
  6: { name: 'Inventaire', commands: ['!loot', '!inventaire', '!equip', '!equipement'] },
  7: { name: 'Anime', commands: ['!anime <nom>', '!manga <nom>', '!personnage <nom>', '!voiranime'] },
  8: { name: 'Images', commands: ['!waifu', '!husbando', '!neko', '!animegif'] },
  9: { name: 'Persos', commands: ['!naruto', '!gojo', '!sukuna', '!miku', '!livai', '!nino'] },
  10: { name: 'Fun', commands: ['!blagueotaku', '!roast @user', '!chance', '!ship', '!sticker'] },
  11: { name: 'Classements', commands: ['!classement', '!topanime', '!topmanga'] },
  12: { name: 'Admin', commands: ['!activatebot', '!selectpack', '!setmodule', '!warn', '!kick', '!mute'] },
  13: { name: 'NSFW', commands: ['!hentai', '!hentaivd', '!nsfw', '!boahancook'] },
  14: { name: 'Bot', commands: ['!menu', '!ping', '!info', '!help', '!documentation'] },
};

const MLBB_CATEGORIES = {
  1: { name: 'Heros', commands: ['!hero <nom>', '!heroes', '!build <nom>', '!counter <nom>', '!combo <nom>'] },
  2: { name: 'Meta', commands: ['!meta', '!lane <role>', '!tip'] },
  3: { name: 'Profil MLBB', commands: ['!mlbb set <rang> <role>', '!mlbb me', '!team <nom>', '!join <team>'] },
  4: { name: 'Admin', commands: ['!selectpack', '!setmodule', '!activatebot'] },
  5: { name: 'Bot', commands: ['!mlbbmenu', '!ping', '!help <cmd>'] },
};

const COMPLET_CATEGORIES = {
  ...OTAKU_CATEGORIES,
  11: { name: 'MLBB', commands: ['!mlbb', '!hero <nom>', '!build <nom>', '!counter <nom>', '!meta', '!team <nom>'] },
  12: { name: 'Classements', commands: ['!classement', '!topanime', '!topmanga'] },
  13: { name: 'Admin', commands: OTAKU_CATEGORIES[12].commands },
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
    return `${number}. ${category.name} - !menu ${number}`;
  });

  return MessageFormatter.panel({
    title: 'Menu',
    subtitle: `Pack: ${activePack}`,
    body: categoryLines,
    footer: 'Ouvre une categorie avec !menu <numero>.',
  });
}

function buildCategoryMenu(number, category) {
  const visibleCommands = category.commands.slice(0, 8);
  const footer = category.commands.length > visibleCommands.length
    ? 'Liste reduite. Detail: !help <commande>'
    : 'Retour: !menu';

  return MessageFormatter.panel({
    title: `${number}. ${category.name}`,
    body: visibleCommands,
    footer,
  });
}

module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  category: 'BOT',
  usage: '!menu [numero]',
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
      const text = MessageFormatter.warning(`Categorie introuvable. Choisis 1 a ${Object.keys(activeCategories).length}.`);
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
