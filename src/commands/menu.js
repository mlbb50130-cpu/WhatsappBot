const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  category: 'BOT',
  usage: '!menu',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    
    const profil = ['!profil - Voir ton profil', '!level - Voir ton niveau', '!xp - Voir ton XP', '!rank - Voir ton rang', '!stats - Voir tes stats', '!badges - Voir tes badges'];
    const duels = ['!duel @user - Défier', '!powerlevel - Power level', '!chakra - Chakra'];
    const quests = ['!quete - Quêtes', '!quotidien - Quotidienne', '!hebdo - Hebdomadaire', '!quetelundi - Quête lundi'];
    const quiz = ['!quiz - Quiz otaku', '!quizanime - Quiz anime', '!pfc - Pierre-Feuille-Ciseaux', '!roulette - Roulette russe'];
    const loot = ['!loot - Lancer un loot', '!inventaire - Inventaire', '!equip - Équiper', '!collection - Collection'];
    const images = ['!waifu - Waifu', '!husbando - Husbando', '!neko - Chat anime', '!animegif - GIF anime'];
    const special = ['!bleach - Bleach', '!naruto - Naruto', '!gojo - Gojo', '!deku - Deku', '!madara - Madara', '!sukuna - Sukuna', '!vegito - Vegito', '!miku - Miku', '!zerotwo - Zero Two'];
    const fun = ['!blagueotaku - Blague', '!roast @user - Roast', '!chance - Chance', '!ship - Ship', '!sticker - Sticker'];
    const media = ['!anime [nom] - Info anime', '!manga [nom] - Info manga', '!personnage [nom] - Info perso', '!voiranime - Voir anime'];
    const top = ['!topanime - Top animes', '!topmanga - Top mangas', '!classement - Classement'];
    const admin = ['!theme [nom] - Changer theme (Admin)', '!activatebot - Activer bot (Owner)', '!admins - Admins group'];
    const bot = ['!ping - Latence', '!info - Info bot', '!regles - Règles', '!help [cmd] - Aide', '!documentation - Documentation'];

    const menu = `${MessageFormatter.elegantSection('👤 PROFIL & LEVEL', profil)}
${MessageFormatter.elegantSection('⚔️ DUELS & COMBATS', duels)}
${MessageFormatter.elegantSection('📖 QUÊTES & RPG', quests)}
${MessageFormatter.elegantSection('🎯 QUIZ & JEUX', quiz)}
${MessageFormatter.elegantSection('🎁 LOOT & INVENTAIRE', loot)}
${MessageFormatter.elegantSection('🎨 IMAGES ANIME', images)}
${MessageFormatter.elegantSection('🌟 PERSONNAGES', special)}
${MessageFormatter.elegantSection('🎪 FUN', fun)}
${MessageFormatter.elegantSection('📺 ANIME & MANGA', media)}
${MessageFormatter.elegantSection('🏆 CLASSEMENTS', top)}
${MessageFormatter.elegantSection('🛠️ ADMIN', admin)}
${MessageFormatter.elegantSection('📌 BOT', bot)}

💎 Gagne du XP en parlant!
🎯 Complète des quêtes!
⚡ Affronte d'autres joueurs!`;

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(menu));
  }
};
