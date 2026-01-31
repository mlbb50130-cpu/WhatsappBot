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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Vérifier et déverrouiller les nouveaux badges
      await BadgeSystem.checkAndUnlockBadges(sock, user, senderJid);

      // Obtenir le statut des badges
      const { earned, locked } = BadgeSystem.getBadgeStatus(user);

      let badgeMessage = `╔════════════════════════════════════╗
║           𝔅𝔄𝔇𝔊𝔈𝔖                  ║
╚════════════════════════════════════╝
👤 ${user.username || 'Joueur'}
🏆 Obtenus: ${earned.length}/23
`;

      if (earned.length > 0) {
        earned.forEach(badge => {
          badgeMessage += `${badge.emoji} ${badge.name}\n`;
        });
      } else {
        badgeMessage += '❌ Aucun badge\n';
      }

      badgeMessage += `
À DÉBLOQUER:`;
      
      locked.forEach(badge => {
        badgeMessage += `\n🔒 ${badge.name} - ${badge.condition}`;
      });

      badgeMessage += `\n═════════════════════════════════════`;

      if (reply) {
        await reply({ text: badgeMessage });
      } else {
        await sock.sendMessage(senderJid, { text: badgeMessage });
      }
    } catch (error) {
      console.error('Error in badges command:', error.message);
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
