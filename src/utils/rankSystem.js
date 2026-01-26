// Rank System - Gère les rangs otaku avec déverrouillage automatique

const RANKS = {
  genin: {
    level: 1,
    minLevel: 1,
    maxLevel: 5,
    emoji: '🥋',
    name: 'Genin Otaku',
    description: 'Nouveau venu dans le monde otaku',
    condition: 'Atteindre le Level 1'
  },
  chuunin: {
    level: 2,
    minLevel: 6,
    maxLevel: 10,
    emoji: '🎌',
    name: 'Chuunin Otaku',
    description: 'Otaku intermédiaire avec expérience',
    condition: 'Atteindre le Level 6'
  },
  jounin: {
    level: 3,
    minLevel: 11,
    maxLevel: 20,
    emoji: '⚔️',
    name: 'Jounin Otaku',
    description: 'Guerrier otaku expérimenté',
    condition: 'Atteindre le Level 11'
  },
  sensei: {
    level: 4,
    minLevel: 21,
    maxLevel: 30,
    emoji: '👨‍🏫',
    name: 'Sensei Otaku',
    description: 'Maître otaku respecté',
    condition: 'Atteindre le Level 21'
  },
  legend: {
    level: 5,
    minLevel: 31,
    maxLevel: 50,
    emoji: '✨',
    name: 'Légende Otaku',
    description: 'Légende vivante du monde otaku',
    condition: 'Atteindre le Level 31'
  },
  god: {
    level: 6,
    minLevel: 51,
    maxLevel: 999,
    emoji: '👑',
    name: 'Dieu Otaku',
    description: 'Être suprême du monde otaku',
    condition: 'Atteindre le Level 51'
  }
};

/**
 * Déterminer le rang basé sur le level de l'utilisateur
 * @param {number} level - Level de l'utilisateur
 * @returns {Object} Informations du rang
 */
function getRankByLevel(level) {
  for (const [rankId, rankInfo] of Object.entries(RANKS)) {
    if (level >= rankInfo.minLevel && level <= rankInfo.maxLevel) {
      return { id: rankId, ...rankInfo };
    }
  }
  // Default si level trop haut
  return { id: 'god', ...RANKS.god };
}

/**
 * Vérifier et mettre à jour le rang de l'utilisateur
 * @param {Object} user - Document utilisateur
 * @returns {Object} { rankChanged, oldRank, newRank, rankInfo, user }
 */
function checkAndUpdateRank(user) {
  const oldRank = user.rank || 'Genin Otaku';
  const rankInfo = getRankByLevel(user.level);
  const newRank = rankInfo.name;

  const rankChanged = newRank !== oldRank;
  if (rankChanged) {
    user.rank = newRank;
  }

  return {
    rankChanged,
    oldRank,
    newRank,
    rankInfo,
    user
  };
}

/**
 * Obtenir toutes les informations sur les rangs
 * @returns {Object} RANKS
 */
function getAllRanks() {
  return RANKS;
}

/**
 * Obtenir le prochain rang pour un utilisateur
 * @param {Object} user - Document utilisateur
 * @returns {Object|null} Prochain rang ou null si déjà au maximum
 */
function getNextRank(user) {
  const currentRankInfo = getRankByLevel(user.level);
  
  if (currentRankInfo.id === 'god') {
    return null; // Déjà au maximum
  }

  // Chercher le prochain rang
  for (const [rankId, rankInfo] of Object.entries(RANKS)) {
    if (rankInfo.minLevel > user.level) {
      return { id: rankId, ...rankInfo };
    }
  }

  return null;
}

/**
 * Obtenir la progression vers le prochain rang en pourcentage
 * @param {Object} user - Document utilisateur
 * @returns {number} Pourcentage de progression (0-100)
 */
function getRankProgressPercentage(user) {
  const nextRank = getNextRank(user);
  
  if (!nextRank) {
    return 100; // Rang maximum atteint
  }

  const currentMin = getRankByLevel(user.level).minLevel;
  const nextMin = nextRank.minLevel;
  const currentLevel = user.level;

  const progress = ((currentLevel - currentMin) / (nextMin - currentMin)) * 100;
  return Math.min(Math.round(progress), 99); // Maximum 99% jusqu'au prochain rang
}

module.exports = {
  checkAndUpdateRank,
  getRankByLevel,
  getAllRanks,
  getNextRank,
  getRankProgressPercentage,
  RANKS
};
