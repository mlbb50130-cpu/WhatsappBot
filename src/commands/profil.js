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
    
    const progressBar = MessageFormatter.progressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 15);
    
    const badges = user.badges.length > 0 
      ? user.badges.map(b => `${b.emoji} ${b.name}`).join(', ')
      : '❌ Aucun badge';

    // Main profile info
    const profileInfo = [
      { label: '🧡 Nom', value: user.username },
      { label: '⭐ Rang', value: `${rankInfo.emoji} ${user.rank}` },
      { label: '🏷️ Titre', value: user.title || '❌ Aucun' },
      { label: '🔥 XP', value: user.xp },
      { label: '⬆️ Niveau', value: levelInfo.level }
    ];

    const statsInfo = [
      { label: '� Messages', value: user.stats.messages },
      { label: '🧠 Quiz', value: user.stats.quiz },
      { label: '⚡ Duels', value: user.stats.duels },
      { label: '🥇 Victoires', value: user.stats.wins },
      { label: '❌ Défaites', value: user.stats.losses }
    ];

    const inventoryInfo = [
      { label: '💎 Objets', value: user.inventory.length },
      { label: '✨ Emplacements', value: `${user.inventory.length}/50` }
    ];

    const createdDate = new Date(user.createdAt).toLocaleDateString('fr-FR');

    const profile = `${MessageFormatter.elegantBox('TON PROFIL OTAKU', profileInfo)}
${MessageFormatter.elegantSection('STATISTIQUES', statsInfo.map(s => `${s.label}: ${s.value}`))}
${progressBar}
${MessageFormatter.elegantSection('BADGES', [badges])}
${MessageFormatter.elegantSection('INVENTAIRE', inventoryInfo.map(i => `${i.label}: ${i.value}`))}`;

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(profile));
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
