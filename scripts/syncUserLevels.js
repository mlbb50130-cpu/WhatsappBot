require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const XPSystem = require('../src/utils/xpSystem');

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/tetsubot';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function syncUserLevels() {
  try {
    console.log('🔄 Synchronisation des niveaux de tous les utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const users = await User.find({});
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Calculer le niveau réel à partir du XP
      const levelInfo = XPSystem.calculateLevelFromXp(user.xp || 0);
      const oldLevel = user.level;
      
      // Mettre à jour le niveau et le rank
      user.level = levelInfo.level;
      
      const rankInfo = XPSystem.getRank(levelInfo.level);
      user.rank = rankInfo.rank;
      
      // Mettre à jour le maxChakra basé sur le nouveau niveau
      user.maxChakra = 100 + (levelInfo.level - 1) * 10;
      
      await user.save();
      updatedCount++;
      
      if (oldLevel !== levelInfo.level) {
        console.log(`✅ ${user.username}: Niveau ${oldLevel} → ${levelInfo.level} (XP: ${user.xp})`);
      } else {
        console.log(`✅ ${user.username}: Niveau ${levelInfo.level} synchronisé (XP: ${user.xp})`);
      }
    }
    
    console.log(`\n✨ Synchronisation terminée!`);
    console.log(`📈 ${updatedCount}/${users.length} utilisateurs mis à jour`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

syncUserLevels();
