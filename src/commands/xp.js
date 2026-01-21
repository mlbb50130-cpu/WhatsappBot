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
      const nextLevelXp = user.level * 100;
      const progressBar = this.createProgressBar(user.xp, nextLevelXp, 10);
      
      const xpMessage = `
╔════════════════════════════════════╗
║          💫 TON XP ACTUEL 💫       ║
╚════════════════════════════════════╝

👤 *Utilisateur:* ${user.pseudo || 'Joueur'}
📊 *Niveau:* ${user.level}
✨ *XP Actuel:* ${user.xp}/${nextLevelXp}

*Progression:*
${progressBar}

${user.xp >= nextLevelXp ? '🎉 Tu es prêt pour le levelup!' : '⏳ Continue pour progresser!'}

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: xpMessage });
    } catch (error) {
      console.error('Error in xp command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  },

  createProgressBar(current, max, length = 10) {
    const filled = Math.round((current / max) * length);
    const empty = length - filled;
    return `[${('█').repeat(filled)}${('░').repeat(empty)}] ${Math.round((current / max) * 100)}%`;
  }
};
