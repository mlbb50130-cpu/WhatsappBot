require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/tetsubot';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function resetChakraTimer() {
  try {
    
    // Récupérer tous les utilisateurs
    const users = await User.find({});
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Réinitialiser le timer (mettre la date à il y a plus de 24h)
      user.lastChakraReset = new Date(Date.now() - (25 * 60 * 60 * 1000)); // Il y a 25 heures
      
      await user.save();
      updatedCount++;
      
    }
    
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

resetChakraTimer();
