const BadgeSystem = require('../utils/badgeSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'badges',
  description: 'Voir tes badges et réalisations',
  category: 'PROFIL',
  usage: '!badges',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const { earned, locked } = BadgeSystem.getBadgeStatus(user);
      const earnedList = earned.length > 0 ? earned.map(b => `${b.emoji}`).join(' ') : '❌';
      const lockedPreview = locked.slice(0, 3).map(b => `🔒 ${b.name}`).join('\n');

      let text = `🎖️ *BADGES* (${earned.length}/${earned.length + locked.length})
${earnedList}

À débloquer:
${lockedPreview}`;

      if (locked.length > 3) text += `\n... et ${locked.length - 3} de plus`;

      await sock.sendMessage(senderJid, { text });
    } catch (error) {
      console.error('Error in badges command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
