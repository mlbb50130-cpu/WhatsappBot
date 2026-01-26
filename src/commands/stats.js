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
    const winRate = user.stats.duels > 0 ? Math.round((user.stats.wins / user.stats.duels) * 100) : 0;

    const stats = `📊 *STATS*
💭 Messages: ${user.stats.messages} | 🧠 Quiz: ${user.stats.quiz}
⚡ Duels: ${user.stats.duels} | 🥇 Wins: ${user.stats.wins} | ❌ Loss: ${user.stats.losses} (${winRate}%)
⬆️ Lvl: ${user.level} | 🔥 XP: ${user.xp}
🌟 Badges: ${user.badges.length} | 💎 Items: ${user.inventory.length}/50`;

    await sock.sendMessage(senderJid, { text: stats });
  }
};
