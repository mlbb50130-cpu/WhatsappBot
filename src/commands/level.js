const XPSystem = require('../utils/xpSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'level',
  description: 'Voir les informations de niveau',
  category: 'PROFIL',
  usage: '!level',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const rankInfo = XPSystem.getRank(user.level);
    const remaining = levelInfo.requiredXp - levelInfo.currentLevelXp;

    const level = `⬆️ Lvl ${user.level} | ${rankInfo.emoji} ${rankInfo.rank}
📈 ${levelInfo.currentLevelXp}/${levelInfo.requiredXp} XP (${remaining} restant)`;

    await sock.sendMessage(senderJid, { text: level });
  },

  getProgressBar(current, max, length = 20) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(percentage * 100);

    return `[${bar}] ${percent}%`;
  }
};
