require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/tetsubot';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function resetDuelStats() {
  try {
    
    // Récupérer tous les utilisateurs
    const users = await User.find({});
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Réinitialiser les stats de duels
      user.stats.duels = 0;
      user.stats.wins = 0;
      user.stats.losses = 0;
      
      await user.save();
      updatedCount++;
      
    }
    
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

resetDuelStats();
