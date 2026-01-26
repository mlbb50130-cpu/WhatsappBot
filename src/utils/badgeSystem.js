// Badge System - Gère le déverrouillage et le stockage des badges

const BADGES = {
  // Badges de niveau
  newbie: { emoji: '🌟', name: 'Nouveau joueur', condition: 'Level 1', check: (user) => user.level >= 1 },
  adventurer: { emoji: '🗺️', name: 'Aventurier', condition: 'Level 5', check: (user) => user.level >= 5 },
  warrior: { emoji: '⚡', name: 'Guerrier', condition: 'Level 10', check: (user) => user.level >= 10 },
  veteran: { emoji: '🎖️', name: 'Vétéran', condition: 'Level 20', check: (user) => user.level >= 20 },
  legend: { emoji: '🏆', name: 'Légende', condition: 'Level 30', check: (user) => user.level >= 30 },
  godlike: { emoji: '👑', name: 'Divinité', condition: 'Level 50', check: (user) => user.level >= 50 },
  
  // Badges XP
  xp_master: { emoji: '⭐', name: 'Maître XP', condition: '1000 XP', check: (user) => user.xp >= 1000 },
  xp_lord: { emoji: '🌠', name: 'Seigneur XP', condition: '5000 XP', check: (user) => user.xp >= 5000 },
  xp_god: { emoji: '✨', name: 'Dieu XP', condition: '10000 XP', check: (user) => user.xp >= 10000 },
  
  // Badges de combat
  duelist: { emoji: '🥊', name: 'Dueliste', condition: '5 Duels', check: (user) => user.stats && user.stats.duels >= 5 },
  fighter: { emoji: '🤼', name: 'Combattant', condition: '10 Duels', check: (user) => user.stats && user.stats.duels >= 10 },
  victor: { emoji: '🎯', name: 'Vainqueur', condition: '10 Victoires', check: (user) => user.stats && user.stats.wins >= 10 },
  champion: { emoji: '🥇', name: 'Champion', condition: '25 Victoires', check: (user) => user.stats && user.stats.wins >= 25 },
  unstoppable: { emoji: '💥', name: 'Inarrêtable', condition: '50 Victoires', check: (user) => user.stats && user.stats.wins >= 50 },
  
  // Badges Messages
  chatty: { emoji: '💬', name: 'Bavard', condition: '100 Messages', check: (user) => user.stats && user.stats.messages >= 100 },
  talkative: { emoji: '📢', name: 'Bavard Pro', condition: '500 Messages', check: (user) => user.stats && user.stats.messages >= 500 },
  legend_talker: { emoji: '🎤', name: 'Légende Talker', condition: '1000 Messages', check: (user) => user.stats && user.stats.messages >= 1000 },
  
  // Badges Quiz
  scholar: { emoji: '🧠', name: 'Erudit', condition: '5 Quiz', check: (user) => user.stats && user.stats.quiz >= 5 },
  sage: { emoji: '📚', name: 'Sage', condition: '20 Quiz', check: (user) => user.stats && user.stats.quiz >= 20 },
  genius: { emoji: '🎓', name: 'Génie', condition: '50 Quiz', check: (user) => user.stats && user.stats.quiz >= 50 },
  
  // Badges Inventaire
  collector: { emoji: '🎁', name: 'Collectionneur', condition: '10 Objets', check: (user) => user.inventory && user.inventory.length >= 10 },
  hoarder: { emoji: '💰', name: 'Accumulateur', condition: '25 Objets', check: (user) => user.inventory && user.inventory.length >= 25 },
  rich: { emoji: '👑', name: 'Riche', condition: '50 Objets', check: (user) => user.inventory && user.inventory.length >= 50 },
  
  // Badges Spéciaux
  active: { emoji: '🔥', name: 'Actif', condition: 'Jouer 7 jours', check: (user) => {
    if (!user.createdAt) return false;
    const days = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    return days >= 7 && user.stats && user.stats.messages >= 50;
  }},
  lucky: { emoji: '🍀', name: 'Chanceux', condition: 'Chance 80%+', check: (user) => user.badges && user.badges.some(b => b.name === 'Chanceux') }
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
 * Vérifier et attribuer les rangs otaku automatiquement
 * @param {Object} user - Document utilisateur
 * @returns {Object} { rankChanged, oldRank, newRank, user }
 */
function checkAndUpdateRank(user) {
  const rankChanged = false;
  const oldRank = user.rank || 'Genin Otaku';

  // Déterminer le rang basé sur le level
  let newRank = 'Genin Otaku'; // Level 1-5
  let emoji = '🥋';

  if (user.level >= 6 && user.level < 11) {
    newRank = 'Chuunin Otaku';
    emoji = '🎌';
  } else if (user.level >= 11 && user.level < 21) {
    newRank = 'Jounin Otaku';
    emoji = '⚔️';
  } else if (user.level >= 21 && user.level < 31) {
    newRank = 'Sensei Otaku';
    emoji = '👨‍🏫';
  } else if (user.level >= 31 && user.level < 51) {
    newRank = 'Légende Otaku';
    emoji = '✨';
  } else if (user.level >= 51) {
    newRank = 'Dieu Otaku';
    emoji = '👑';
  }

  const hasChanged = newRank !== oldRank;
  if (hasChanged) {
    user.rank = newRank;
  }

  return { rankChanged: hasChanged, oldRank, newRank, emoji, user };
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
  checkAndUpdateRank,
  BADGES
};
