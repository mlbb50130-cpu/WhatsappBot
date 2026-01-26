// Script pour recalculer les rangs de tous les utilisateurs existants
// Utilisation: node scripts/recalculateUserRanks.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const RankSystem = require('../src/utils/rankSystem');
const config = require('../src/config');

let updateCount = 0;
let rankChangeCount = 0;
let promotionCount = 0;
let demotionCount = 0;

async function recalculateUserRanks() {
  try {
    console.log(`📊 Connexion à MongoDB (${config.MONGODB_URI})...`);
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🔄 Récupération de tous les utilisateurs...');
    const users = await User.find();
    console.log(`📌 Total utilisateurs: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔄 Calcul des rangs...\n');

    for (const user of users) {
      const oldRank = user.rank || 'Aucun';
      const rankResult = RankSystem.checkAndUpdateRank(user);

      if (rankResult.rankChanged) {
        updateCount++;
        rankChangeCount++;

        // Déterminer s'il y a une promotion ou une rétrogradation
        const oldRankLevel = Object.values(RankSystem.RANKS).find(r => r.name === oldRank)?.level || 0;
        const newRankLevel = rankResult.rankInfo.level;

        if (newRankLevel > oldRankLevel) {
          promotionCount++;
          console.log(`⬆️  PROMOTION: ${user.username || 'Anonymous'} (L${user.level})`);
          console.log(`   ${oldRank} → ${rankResult.newRank} ${rankResult.rankInfo.emoji}`);
        } else if (newRankLevel < oldRankLevel) {
          demotionCount++;
          console.log(`⬇️  RÉTROGRADATION: ${user.username || 'Anonymous'} (L${user.level})`);
          console.log(`   ${oldRank} → ${rankResult.newRank} ${rankResult.rankInfo.emoji}`);
        }

        await user.save();
      }
    }

    console.log('\n═══════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════');
    console.log(`✅ Utilisateurs mis à jour: ${updateCount}/${users.length}`);
    console.log(`📈 Changements de rang: ${rankChangeCount}`);
    console.log(`⬆️  Promotions: ${promotionCount}`);
    console.log(`⬇️  Rétrograrations: ${demotionCount}`);
    console.log('═══════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

recalculateUserRanks();
