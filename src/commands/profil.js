const XPSystem = require('../utils/xpSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'profil',
  description: 'Voir ton profil otaku',
  category: 'PROFIL',
  usage: '!profil',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const rankInfo = XPSystem.getRank(levelInfo.level);
    const winRate = user.stats.duels > 0 ? Math.round((user.stats.wins / user.stats.duels) * 100) : 0;
    const badges = user.badges.length > 0 ? user.badges.map(b => `${b.emoji}`).join(' ') : '❌';

    const profile = `🎭 *${user.username}*
${rankInfo.emoji} ${user.rank} | Lvl ${user.level} | ${user.xp} XP

📊 Msg: ${user.stats.messages} | Quiz: ${user.stats.quiz} | Duels: ${user.stats.duels} | Win: ${winRate}%
💎 Items: ${user.inventory.length}/50 | Badges: ${badges}`;

    await sock.sendMessage(senderJid, { text: profile });
  },

  getProgressBar(current, max, length = 15) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(percentage * 100);

    return `[${bar}] ${percent}%`;
  }
};
