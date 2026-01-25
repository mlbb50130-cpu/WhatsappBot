// Badge System - Gère le déverrouillage et le stockage des badges

const BADGES = {
  newbie: { emoji: '🌟', name: 'Nouveau joueur', condition: 'Level 1', check: (user) => user.level >= 1 },
  adventurer: { emoji: '🗺️', name: 'Aventurier', condition: 'Level 5', check: (user) => user.level >= 5 },
  warrior: { emoji: '⚡', name: 'Guerrier', condition: 'Level 10', check: (user) => user.level >= 10 },
  legend: { emoji: '🏆', name: 'Légende', condition: 'Level 25', check: (user) => user.level >= 25 },
  duelist: { emoji: '🥊', name: 'Dueliste', condition: '10 Duels gagnés', check: (user) => user.stats && user.stats.wins >= 10 },
  collector: { emoji: '🎁', name: 'Collectionneur', condition: '50 Loots', check: (user) => user.inventory && user.inventory.length >= 50 },
  scholar: { emoji: '🧠', name: 'Erudit', condition: '10 Quiz réussis', check: (user) => user.stats && user.stats.quiz >= 10 },
  lucky: { emoji: '✨', name: 'Chanceux', condition: 'Jackpot une fois', check: (user) => user.badges && user.badges.some(b => b.name === 'Chanceux') }
};

/**
 * Vérifier et déverrouiller les badges pour un utilisateur
 * @param {Object} sock - Socket WhatsApp
 * @param {Object} user - Document utilisateur
 * @param {String} senderJid - JID du groupe/utilisateur
 * @returns {Object} { newBadges: [], user }
 */
async function checkAndUnlockBadges(sock, user, senderJid) {
  const newBadges = [];

  for (const [badgeId, badgeInfo] of Object.entries(BADGES)) {
    // Vérifier si le badge est déjà obtenu
    const alreadyHas = user.badges && user.badges.some(b => b.name === badgeInfo.name);
    
    if (!alreadyHas && badgeInfo.check(user)) {
      // Ajouter le badge
      if (!user.badges) user.badges = [];
      
      user.badges.push({
        name: badgeInfo.name,
        emoji: badgeInfo.emoji,
        unlockedAt: new Date()
      });

      newBadges.push({
        id: badgeId,
        ...badgeInfo
      });
    }
  }

  // Sauvegarder si de nouveaux badges ont été déverrouillés
  if (newBadges.length > 0) {
    await user.save();

    // Envoyer une notification pour chaque nouveau badge
    for (const badge of newBadges) {
      const notification = `
╔════════════════════════════════════╗
║  🎉 NOUVEAU BADGE DÉVERROUILLÉ! 🎉║
╚════════════════════════════════════╝

${badge.emoji} *${badge.name}*
${badge.condition}

Félicitations! 🏆
═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: notification });
    }
  }

  return { newBadges, user };
}

/**
 * Obtenir tous les badges déverrouillés et verrouillés
 * @param {Object} user - Document utilisateur
 * @returns {Object} { earned, locked }
 */
function getBadgeStatus(user) {
  const earned = [];
  const locked = [];

  for (const [badgeId, badgeInfo] of Object.entries(BADGES)) {
    const hasIt = user.badges && user.badges.some(b => b.name === badgeInfo.name);
    
    const badgeData = {
      id: badgeId,
      ...badgeInfo
    };

    if (hasIt) {
      earned.push(badgeData);
    } else {
      locked.push(badgeData);
    }
  }

  return { earned, locked };
}

module.exports = {
  checkAndUnlockBadges,
  getBadgeStatus,
  BADGES
};
