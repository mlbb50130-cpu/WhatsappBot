const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot';

async function resetChakraAndLoot() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Resetting ${users.length} users...\n`);

    let resetCount = 0;

    for (const user of users) {
      const oldChakra = user.chakra;
      const oldLootTime = user.lootTime;

      // Reset chakra
      const maxChakra = 100 + (user.level - 1) * 10;
      user.chakra = maxChakra;
      user.lastChakraReset = new Date();

      // Reset loot time
      user.lootTime = null;

      await user.save();
      resetCount++;

      console.log(`✅ ${user.username}`);
      console.log(`   Chakra: ${oldChakra} → ${maxChakra}`);
      console.log(`   LootTime: ${oldLootTime ? 'reset' : 'already null'}\n`);
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Reset completed: ${resetCount} users`);
    console.log('═══════════════════════════════════════');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetChakraAndLoot();
