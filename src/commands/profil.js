const XPSystem = require('../utils/xpSystem');

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
    const rankInfo = XPSystem.getRank(user.level);
    
    const progressBar = this.getProgressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 15);
    
    const badges = user.badges.length > 0 
      ? user.badges.map(b => `${b.emoji} ${b.name}`).join(', ')
      : '❌ Aucun badge';

    const profile = `
╔════════════════════════════════════════╗
║         👤 TON PROFIL OTAKU 👤        ║
╚════════════════════════════════════════╝

*👤 Nom:* ${user.username}
*🎌 Rang:* ${rankInfo.emoji} ${user.rank}
*📍 Titre:* ${user.title}

*📊 STATISTIQUES*
  ├─ 🎯 Niveau: ${user.level}
  ├─ ⭐ XP: ${user.xp}
  ├─ 💬 Messages: ${user.stats.messages}
  ├─ 🎯 Quiz: ${user.stats.quiz}
  ├─ ⚔️ Duels: ${user.stats.duels}
  ├─ 🏆 Victoires: ${user.stats.wins}
  └─ 💔 Défaites: ${user.stats.losses}

*🎖️ PROGRESSION*
${progressBar} ${levelInfo.currentLevelXp}/${levelInfo.requiredXp}

*🏅 BADGES*
${badges}

*⚖️ INVENTAIRE*
  ├─ 📦 Objets: ${user.inventory.length}
  └─ 🎁 Emplacements: ${user.inventory.length}/50

*📅 COMPTE*
  └─ 📆 Créé le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}

════════════════════════════════════════
Utilise \`!help\` pour voir les commandes!
════════════════════════════════════════
`;

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
