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

    // Get all users
    const users = await User.find({});

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

    if (issues.length > 0) {
      for (const issue of issues) {
      }
    }


    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

syncUserRanks();
