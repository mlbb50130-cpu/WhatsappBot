const XPSystem = require('../utils/xpSystem');

module.exports = {
  name: 'xp',
  description: 'Voir ton XP actuel',
  category: 'PROFIL',
  usage: '!xp',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!user) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
        return;
      }

      const levelInfo = XPSystem.calculateLevelFromXp(user.xp || 0);
      const remaining = levelInfo.requiredXp - levelInfo.currentLevelXp;
      
      const text = `💫 XP: ${levelInfo.currentLevelXp}/${levelInfo.requiredXp} (${remaining} restant)`;
      await sock.sendMessage(senderJid, { text });
    } catch (error) {
      console.error('Error in xp command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
