const MessageFormatter = require('../utils/messageFormatter');

const CATEGORIES = {
  1: {
    emoji: '👤',
    name: 'PROFIL & LEVEL',
    commands: ['!profil', '!level', '!xp', '!rank', '!stats', '!badges']
  },
  2: {
    emoji: '⚔️',
    name: 'DUELS & COMBATS',
    commands: ['!duel @user', '!powerlevel', '!chakra']
  },
  3: {
    emoji: '📖',
    name: 'QUÊTES & RPG',
    commands: ['!quete', '!quotidien', '!hebdo', '!quetelundi']
  },
  4: {
    emoji: '🎯',
    name: 'QUIZ & JEUX',
    commands: ['!quiz', '!quizanime', '!pfc', '!roulette']
  },
  5: {
    emoji: '🎁',
    name: 'LOOT & INVENTAIRE',
    commands: ['!loot', '!inventaire', '!equip', '!collection']
  },
  6: {
    emoji: '🎨',
    name: 'IMAGES ANIME',
    commands: ['!waifu', '!husbando', '!neko', '!animegif']
  },
  7: {
    emoji: '🌟',
    name: 'PERSONNAGES',
    commands: ['!bleach', '!naruto', '!gojo', '!deku', '!madara', '!sukuna', '!vegito', '!miku', '!zerotwo']
  },
  8: {
    emoji: '🎪',
    name: 'FUN',
    commands: ['!blagueotaku', '!roast @user', '!chance', '!ship', '!sticker']
  },
  9: {
    emoji: '📺',
    name: 'ANIME & MANGA',
    commands: ['!anime [nom]', '!manga [nom]', '!personnage [nom]', '!voiranime']
  },
  10: {
    emoji: '🏆',
    name: 'CLASSEMENTS',
    commands: ['!topanime', '!topmanga', '!classement']
  },
  11: {
    emoji: '🛠️',
    name: 'ADMIN',
    commands: ['!theme [nom]', '!activatebot', '!admins']
  },
  12: {
    emoji: '📌',
    name: 'BOT',
    commands: ['!ping', '!info', '!regles', '!help [cmd]', '!documentation']
  }
};

module.exports = {
  name: 'menu',
  description: 'Affiche le menu du bot',
  category: 'BOT',
  usage: '!menu [numero]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const categoryNum = args[0];

    if (!categoryNum) {
      // Afficher le menu principal avec catégories numérotées
      let mainMenu = '*📋 MENU PRINCIPAL*\n\n';
      for (const [num, cat] of Object.entries(CATEGORIES)) {
        mainMenu += `${num}️⃣ ${cat.emoji} ${cat.name}\n`;
      }
      mainMenu += '\n💡 Tapez: `!menu [numero]` pour voir les commandes';

      await sock.sendMessage(senderJid, { text: mainMenu });
      return;
    }

    // Afficher une catégorie spécifique
    const category = CATEGORIES[categoryNum];
    if (!category) {
      await sock.sendMessage(senderJid, { text: '❌ Catégorie invalide (1-12)' });
      return;
    }

    let categoryMenu = `${category.emoji} *${category.name}*\n\n`;
    category.commands.forEach((cmd, i) => {
      categoryMenu += `├ ${cmd}\n`;
    });

    await sock.sendMessage(senderJid, { text: categoryMenu });
  }
};
