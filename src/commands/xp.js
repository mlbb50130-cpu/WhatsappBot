const XPSystem = require('../utils/xpSystem');
const MessageFormatter = require('../utils/messageFormatter');

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
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilisateur introuvable!') });
        return;
      }

      const levelInfo = XPSystem.calculateLevelFromXp(user.xp || 0);
      const rankInfo = XPSystem.getRank(levelInfo.level);
      
      const progressPercent = Math.round((levelInfo.currentLevelXp / levelInfo.requiredXp) * 100);
      const progressBar = MessageFormatter.progressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 15);
      
      const xpItems = [
        { label: '🧡 Utilisateur', value: user.username || 'Joueur' },
        { label: '⬆️ Niveau', value: `${levelInfo.level} - ${rankInfo.rank}` },
        { label: '� XP Actuel', value: `${levelInfo.currentLevelXp}/${levelInfo.requiredXp}` },
        { label: '⭐ XP Total', value: user.xp || 0 }
      ];

      const statusItems = [
        progressPercent === 100 ? '🎉 Tu es prêt pour le levelup!' : '⏳ Continue pour progresser!'
      ];

      const xpMessage = `${MessageFormatter.elegantBox('💫 TON XP ACTUEL 💫', xpItems)}
${progressBar}
${MessageFormatter.elegantSection('📈 STATUT', statusItems)}`;

      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(xpMessage));
    } catch (error) {
      console.error('Error in xp command:', error.message);
      console.error('User object:', user);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération de ton XP!' });
    }
  }
};
