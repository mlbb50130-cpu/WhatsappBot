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
    await mongoose.connect(config.MONGODB_URI);

    const users = await User.find();

    if (users.length === 0) {
      await mongoose.disconnect();
      return;
    }


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
        } else if (newRankLevel < oldRankLevel) {
          demotionCount++;
        }

        await user.save();
      }
    }


    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    await mongoose.disconnect();
    process.exit(1);
  }
}

recalculateUserRanks();
