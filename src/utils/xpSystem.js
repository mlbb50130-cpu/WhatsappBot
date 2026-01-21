const config = require('../config');

class XPSystem {
  static getLevelRequirement(level) {
    // Logarithmic XP requirement
    return Math.floor(100 * Math.pow(1.15, level - 1));
  }

  static getTotalXpForLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += this.getLevelRequirement(i);
    }
    return total;
  }

  static calculateLevelFromXp(xp) {
    let level = 1;
    let totalXp = 0;

    while (totalXp + this.getLevelRequirement(level) <= xp && level < 999) {
      totalXp += this.getLevelRequirement(level);
      level++;
    }

    return { level, currentLevelXp: xp - totalXp, requiredXp: this.getLevelRequirement(level) };
  }

  static getRank(level) {
    let rank = 'Genin Otaku';
    let emoji = '🥋';

    if (level >= 51) {
      rank = 'Dieu Otaku';
      emoji = '👑';
    } else if (level >= 31) {
      rank = 'Légende Otaku';
      emoji = '✨';
    } else if (level >= 21) {
      rank = 'Sensei Otaku';
      emoji = '👨‍🏫';
    } else if (level >= 11) {
      rank = 'Jounin Otaku';
      emoji = '⚔️';
    } else if (level >= 6) {
      rank = 'Chuunin Otaku';
      emoji = '🎌';
    }

    return { rank, emoji };
  }

  static addXp(currentXp, addedXp) {
    return currentXp + addedXp;
  }
}

module.exports = XPSystem;
