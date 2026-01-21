const XPSystem = require('../utils/xpSystem');

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
    
    const progressBar = this.getProgressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 20);

    const text = `
╔════════════════════════════════════════╗
║           🎖️ TON NIVEAU 🎖️            ║
╚════════════════════════════════════════╝

*📊 NIVEAU ACTUEL*
  ├─ 🎯 Niveau: \`${user.level}\`
  ├─ 🎌 Rang: ${rankInfo.emoji} ${rankInfo.rank}
  └─ ⭐ Total XP: \`${user.xp}\`

*📈 PROGRESSION VERS NIVEAU ${user.level + 1}*
${progressBar}
  ├─ XP gagné: \`${levelInfo.currentLevelXp}\`
  ├─ XP requis: \`${levelInfo.requiredXp}\`
  └─ XP manquant: \`${levelInfo.requiredXp - levelInfo.currentLevelXp}\`

*🏆 RANGS DISPONIBLES*
  ├─ 🥋 Lv 1-5: Genin Otaku
  ├─ 🎌 Lv 6-10: Chuunin Otaku
  ├─ ⚔️ Lv 11-20: Jounin Otaku
  ├─ 👨‍🏫 Lv 21-30: Sensei Otaku
  ├─ ✨ Lv 31-50: Légende Otaku
  └─ 👑 Lv 51+: Dieu Otaku

*💡 CONSEILS*
  ├─ 💬 Gagne 5 XP par message (cooldown 5s)
  ├─ 🎯 Complète les quêtes (+50 XP)
  ├─ 🎯 Gagne les quiz (+25 XP)
  ├─ ⚔️ Gagne les duels (+30 XP)
  └─ 🎁 Ouvre les loots (+10 XP)

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text });
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
