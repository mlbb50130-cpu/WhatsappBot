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

    const content = `
👤 *NOM*: \`${user.username}\`
🎌 *RANG*: ${rankInfo.emoji} ${user.rank}
📍 *TITRE*: ${user.title}

${MessageFormatter.section('STATISTIQUES', [
  { label: '🎯 Niveau', value: levelInfo.level },
  { label: '⭐ XP', value: user.xp },
  { label: '💬 Messages', value: user.stats.messages },
  { label: '🎯 Quiz', value: user.stats.quiz },
  { label: '⚔️ Duels', value: user.stats.duels },
  { label: '🏆 Victoires', value: user.stats.wins },
  { label: '💔 Défaites', value: user.stats.losses }
])}

*🎖️ PROGRESSION*
${progressBar} ${levelInfo.currentLevelXp}/${levelInfo.requiredXp}

${MessageFormatter.section('BADGES', [])}
${badges}

${MessageFormatter.section('INVENTAIRE', [
  { label: '📦 Objets', value: user.inventory.length },
  { label: '🎁 Emplacements', value: `${user.inventory.length}/50` }
])}

📆 *COMPTE CRÉÉ LE*: \`${new Date(user.createdAt).toLocaleDateString('fr-FR')}\`
`;

    const profile = MessageFormatter.box('👤 TON PROFIL OTAKU 👤', content);

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
