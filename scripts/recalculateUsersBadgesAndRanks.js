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
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📊 Récupération de tous les utilisateurs...');
    const users = await User.find();
    console.log(`✅ ${users.length} utilisateurs trouvés\n`);

    let updatedCount = 0;
    let badgesCount = 0;
    let ranksCount = 0;

    for (const user of users) {
      let userChanged = false;

      // Mettre à jour le rang
      const rankUpdate = BadgeSystem.checkAndUpdateRank(user);
      if (rankUpdate.rankChanged) {
        console.log(`👤 ${user.username} - Rang changé: ${rankUpdate.oldRank} → ${rankUpdate.newRank}`);
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

          console.log(`🏆 ${user.username} - Badge déverrouillé: ${badgeInfo.emoji} ${badgeInfo.name}`);
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

    console.log('\n' + '='.repeat(50));
    console.log('📈 RÉSUMÉ DES CHANGEMENTS:');
    console.log('='.repeat(50));
    console.log(`✅ Utilisateurs mis à jour: ${updatedCount}/${users.length}`);
    console.log(`🏆 Badges déverrouillés: ${badgesCount}`);
    console.log(`📊 Rangs mis à jour: ${ranksCount}`);
    console.log('='.repeat(50) + '\n');

    console.log('✅ Recalculation terminée!');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
