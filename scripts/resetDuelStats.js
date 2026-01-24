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
    console.log('⚔️ Réinitialisation des stats de duels pour tous les utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const users = await User.find({});
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Réinitialiser les stats de duels
      user.stats.duels = 0;
      user.stats.wins = 0;
      user.stats.losses = 0;
      
      await user.save();
      updatedCount++;
      
      console.log(`✅ ${user.username} (Niveau ${user.level}) - Stats duels réinitialisées`);
    }
    
    console.log(`\n✨ Réinitialisation terminée!`);
    console.log(`📈 ${updatedCount}/${users.length} utilisateurs mis à jour`);
    console.log(`\n💡 Tous les stats de duels (wins, losses, duels) ont été réinitialisées à 0`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

resetDuelStats();
