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

      const level = user.level || 1;
      const userXp = user.xp || 0;
      const nextLevelXp = level * 100;
      
      // Capper la progression à 100% maximum
      const percentProgress = Math.min(1, userXp / nextLevelXp);
      const filled = Math.round(percentProgress * 10);
      const empty = 10 - filled;
      const progressPercent = Math.round(percentProgress * 100);
      const progressBar = `[${('█').repeat(filled)}${('░').repeat(empty)}] ${progressPercent}%`;
      
      const xpMessage = `
╔════════════════════════════════════╗
║          💫 TON XP ACTUEL 💫       ║
╚════════════════════════════════════╝

👤 *Utilisateur:* ${user.username || 'Joueur'}
📊 *Niveau:* ${level}
✨ *XP Actuel:* ${userXp}/${nextLevelXp}

*Progression:*
${progressBar}

${userXp >= nextLevelXp ? '🎉 Tu es prêt pour le levelup!' : '⏳ Continue pour progresser!'}

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: xpMessage });
    } catch (error) {
      console.error('Error in xp command:', error.message);
      console.error('User object:', user);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération de ton XP!' });
    }
  }
};
