/**
 * Script pour recalculer les badges et rangs de tous les utilisateurs
 * Usage: node scripts/recalculateUsersBadgesAndRanks.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const User = require('../src/models/User');
const BadgeSystem = require('../src/utils/badgeSystem');

async function main() {
  try {
    await mongoose.connect(config.MONGODB_URI);

    const users = await User.find();

    let updatedCount = 0;
    let badgesCount = 0;
    let ranksCount = 0;

    for (const user of users) {
      let userChanged = false;

      // Mettre à jour le rang
      const rankUpdate = BadgeSystem.checkAndUpdateRank(user);
      if (rankUpdate.rankChanged) {
        ranksCount++;
        userChanged = true;
      }

      // Vérifier et débloquer les badges
      for (const [badgeId, badgeInfo] of Object.entries(BadgeSystem.BADGES)) {
        const alreadyHas = user.badges && user.badges.some(b => b.name === badgeInfo.name);
        
        if (!alreadyHas && badgeInfo.check(user)) {
          if (!user.badges) user.badges = [];
          
          user.badges.push({
            name: badgeInfo.name,
            emoji: badgeInfo.emoji,
            unlockedAt: new Date()
          });

          badgesCount++;
          userChanged = true;
        }
      }

      // Sauvegarder si quelque chose a changé
      if (userChanged) {
        await user.save();
        updatedCount++;
      }
    }


    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    process.exit(1);
  }
}

main();
