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
        await sock.sendMessage(senderJid, { text: '❌ Utilisateur introuvable!' });
        return;
      }

      // Utiliser le système XP réel
      const levelInfo = XPSystem.calculateLevelFromXp(user.xp || 0);
      const rankInfo = XPSystem.getRank(levelInfo.level);
      
      const progressPercent = Math.round((levelInfo.currentLevelXp / levelInfo.requiredXp) * 100);
      const filled = Math.round((progressPercent / 100) * 15);
      const empty = 15 - filled;
      const progressBar = `[${('█').repeat(filled)}${('░').repeat(empty)}] ${progressPercent}%`;
      
      const xpMessage = `
╔════════════════════════════════════╗
║          💫 TON XP ACTUEL 💫       ║
╚════════════════════════════════════╝

👤 *Utilisateur:* ${user.username || 'Joueur'}
${rankInfo.emoji} *Niveau:* ${levelInfo.level} - ${rankInfo.rank}
✨ *XP Actuel:* ${levelInfo.currentLevelXp}/${levelInfo.requiredXp}
📊 *XP Total:* ${user.xp || 0}

*Progression vers le niveau ${levelInfo.level + 1}:*
${progressBar}

${progressPercent === 100 ? '🎉 Tu es prêt pour le levelup!' : '⏳ Continue pour progresser!'}

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: xpMessage });
    } catch (error) {
      console.error('Error in xp command:', error.message);
      console.error('User object:', user);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération de ton XP!' });
    }
  }
};
