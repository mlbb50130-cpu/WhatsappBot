module.exports = {
  name: 'powerlevel',
  description: 'Voir ton power level',
  category: 'PROFIL',
  usage: '!powerlevel [@user]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Calculate power level based on stats
      const basePower = user.level * 100;
      const xpBonus = Math.floor(user.xp / 10);
      const duelBonus = user.duelsWon * 50;
      const totalPower = basePower + xpBonus + duelBonus;

      const powerMessage = `
╔════════════════════════════════════╗
║        ⚡ POWER LEVEL ⚡           ║
╚════════════════════════════════════╝

👤 *Utilisateur:* ${user.pseudo || 'Joueur'}
⚡ *Power Level:* ${totalPower}

📊 *Détails:*
  Base (Level): +${basePower}
  XP: +${xpBonus}
  Duels gagnés: +${duelBonus}

${totalPower > 5000 ? '🌟 Puissance incroyable!' : totalPower > 2000 ? '💪 Très puissant!' : '⏳ Continue de progresser!'}

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: powerMessage });
    } catch (error) {
      console.error('Error in powerlevel command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
