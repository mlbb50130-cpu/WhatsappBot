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
    const nextRankXp = XPSystem.getTotalXpForLevel(user.level + 1);
    
    const progressBar = MessageFormatter.progressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 20);

    const levelItems = [
      { label: '⛅️ Niveau', value: user.level.toString() },
      { label: '⭐ Rang', value: `${rankInfo.emoji} ${rankInfo.rank}` },
      { label: '� Total XP', value: user.xp.toString() },
      { label: '�📈 Progression', value: `${levelInfo.currentLevelXp}/${levelInfo.requiredXp}` },
      { label: '⏳ Manquant', value: (levelInfo.requiredXp - levelInfo.currentLevelXp).toString() }
    ];

    const ranksItems = [
      '🥋 Lv 1-5: Genin Otaku',
      '🎌 Lv 6-10: Chuunin Otaku',
      '⚔️ Lv 11-20: Jounin Otaku',
      '👨‍🏫 Lv 21-30: Sensei Otaku',
      '✨ Lv 31-50: Légende Otaku',
      '👑 Lv 51+: Dieu Otaku'
    ];

    const tipsItems = [
      '💭 5 XP par message (cooldown 5s)',
      '📋 Quêtes +50 XP',
      '🧠 Quiz +25 XP',
      '⚡ Duels +30 XP',
      '🎁 Loots +10 XP'
    ];

    const level = `${MessageFormatter.elegantBox('𝔑𝔌𝔙𝔈𝔄𝔘', levelItems)}
${progressBar}
${MessageFormatter.elegantSection('RANGS', ranksItems)}`;

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(level));
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
