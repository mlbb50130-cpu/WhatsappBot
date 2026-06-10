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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      if (!user) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Utilisateur introuvable!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilisateur introuvable!') });
      }
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

      const xpMessage = `${MessageFormatter.elegantBox('𝔛𝔓 𝔄𝔆𝔗𝔘𝔈𝔏', xpItems)}
${progressBar}`;

      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(xpMessage));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(xpMessage));
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de la récupération de ton XP!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération de ton XP!' });
      }
    }
  }
};
