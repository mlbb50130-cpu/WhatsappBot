const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'stats',
  description: 'Voir tes statistiques',
  category: 'PROFIL',
  usage: '!stats',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const winRate = user.stats.duels > 0 
      ? Math.round((user.stats.wins / user.stats.duels) * 100) 
      : 0;

    const statsItems = [
      { label: '💭 Messages', value: user.stats.messages },
      { label: '🧠 Quizzes', value: user.stats.quiz },
      { label: '⚡ Duels', value: user.stats.duels },
      { label: '🥇 Victoires', value: user.stats.wins },
      { label: '❌ Défaites', value: user.stats.losses },
      { label: '📊 Taux', value: `${winRate}%` },
      { label: '⬆️ Niveau', value: user.level },
      { label: '🔥 XP total', value: user.xp },
      { label: '🌟 Badges', value: user.badges.length },
      { label: '💎 Objets', value: `${user.inventory.length}/50` },
      { label: '⚠️ Avertissements', value: `${user.warnings}/3` }
    ];

    const stats = MessageFormatter.elegantBox('📊 TES STATISTIQUES 📊', statsItems);
    await sock.sendMessage(senderJid, { text: stats });
  }
};
