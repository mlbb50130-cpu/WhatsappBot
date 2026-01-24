require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/tetsubot';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function resetAllChakra() {
  try {
    console.log('🔄 Réinitialisation du chakra de tous les utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const users = await User.find({});
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Calculer le maxChakra basé sur le niveau
      const newMaxChakra = 100 + (user.level - 1) * 10;
      
      // Réinitialiser chakra et maxChakra
      user.chakra = newMaxChakra;
      user.maxChakra = newMaxChakra;
      user.lastChakraReset = new Date();
      
      await user.save();
      updatedCount++;
      
      console.log(`✅ ${user.username} (Niveau ${user.level}) - Chakra réinitialisé à ${newMaxChakra}`);
    }
    
    console.log(`\n✨ Réinitialisation terminée!`);
    console.log(`📈 ${updatedCount}/${users.length} utilisateurs mis à jour`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

resetAllChakra();
