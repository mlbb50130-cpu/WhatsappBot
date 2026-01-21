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
      const badges = {
        newbie: { emoji: '👶', name: 'Nouveau joueur', condition: 'Level 1' },
        adventurer: { emoji: '⚔️', name: 'Aventurier', condition: 'Level 5' },
        warrior: { emoji: '🗡️', name: 'Guerrier', condition: 'Level 10' },
        legend: { emoji: '👑', name: 'Légende', condition: 'Level 25' },
        duelist: { emoji: '🤺', name: 'Dueliste', condition: '10 Duels gagnés' },
        collector: { emoji: '💎', name: 'Collectionneur', condition: '50 Loots' },
        scholar: { emoji: '📚', name: 'Erudit', condition: '10 Quiz réussis' },
        lucky: { emoji: '🍀', name: 'Chanceux', condition: 'Jackpot une fois' }
      };

      let earnedBadges = [];
      
      if (user.level >= 1) earnedBadges.push(badges.newbie);
      if (user.level >= 5) earnedBadges.push(badges.adventurer);
      if (user.level >= 10) earnedBadges.push(badges.warrior);
      if (user.level >= 25) earnedBadges.push(badges.legend);
      if (user.duelsWon >= 10) earnedBadges.push(badges.duelist);
      if (user.lootsOpened >= 50) earnedBadges.push(badges.collector);
      if (user.quizWon >= 10) earnedBadges.push(badges.scholar);

      let badgeMessage = `
╔════════════════════════════════════╗
║        🎖️ TES BADGES 🎖️           ║
╚════════════════════════════════════╝

👤 *${user.pseudo || 'Joueur'}*
🏆 *Badges obtenus:* ${earnedBadges.length}/8

═════════════════════════════════════`;

      earnedBadges.forEach(badge => {
        badgeMessage += `\n${badge.emoji} *${badge.name}* - ${badge.condition}`;
      });

      if (earnedBadges.length === 0) {
        badgeMessage += '\n❌ Aucun badge pour le moment...';
      }

      badgeMessage += `\n═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: badgeMessage });
    } catch (error) {
      console.error('Error in badges command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
