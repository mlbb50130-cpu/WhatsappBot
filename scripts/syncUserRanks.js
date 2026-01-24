const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const XPSystem = require('../src/utils/xpSystem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot';

async function syncUserRanks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Vérification de ${users.length} utilisateurs...\n`);

    let fixedCount = 0;
    let correctCount = 0;
    const issues = [];

    for (const user of users) {
      // Calculate level from XP
      const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
      const correctRank = XPSystem.getRank(levelInfo.level);

      // Check if rank matches
      const rankMatches = user.rank === correctRank.rank;

      if (!rankMatches) {
        issues.push({
          username: user.username,
          jid: user.jid,
          xp: user.xp,
          level: levelInfo.level,
          currentRank: user.rank,
          correctRank: correctRank.rank,
          correctEmoji: correctRank.emoji
        });

        // Fix the rank
        user.rank = correctRank.rank;
        await user.save();
        fixedCount++;
      } else {
        correctCount++;
      }
    }

    // Print results
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Rangs corrects: ${correctCount}`);
    console.log(`🔧 Rangs corrigés: ${fixedCount}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (issues.length > 0) {
      console.log('📋 UTILISATEURS CORRIGÉS:\n');
      for (const issue of issues) {
        console.log(`👤 ${issue.username} (${issue.jid})`);
        console.log(`   XP: ${issue.xp} → Niveau: ${issue.level}`);
        console.log(`   ❌ Ancien rang: ${issue.currentRank}`);
        console.log(`   ✅ Nouveau rang: ${issue.correctRank} ${issue.correctEmoji}`);
        console.log('');
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Synchronisation des rangs terminée!');
    console.log('═══════════════════════════════════════════════════════════');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

syncUserRanks();
