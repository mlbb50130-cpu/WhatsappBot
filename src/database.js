const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 secondes

async function connectDatabase() {
  if (isConnected) {
    console.log('✅ Base de données déjà connectée');
    return;
  }

  try {
    console.log(`🔄 Connexion à MongoDB: ${config.MONGODB_URI}`);
    
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2
    });

    isConnected = true;
    retryCount = 0;
    console.log('✅ MongoDB connecté!');
    console.log(`📊 Base: ${mongoose.connection.name}`);
    console.log(`🔗 Hôte: ${mongoose.connection.host}`);

    // Load models
    require('./models/User');
    require('./models/Group');
    require('./models/Inventory');
    require('./models/Quest');
    require('./models/Warn');

    console.log('✅ Modèles chargés');

  } catch (error) {
    console.error(`❌ Erreur MongoDB: ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delaySeconds = RETRY_DELAY / 1000;
      console.log(`⏳ Nouvelle tentative dans ${delaySeconds}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDatabase, RETRY_DELAY);
    } else {
      console.error(`❌ Impossible de se connecter après ${MAX_RETRIES} tentatives`);
      console.log(`\n📌 Assurez-vous que MongoDB est en cours d'exécution:`);
      console.log(`   - Ouvrez MongoDB Compass`);
      console.log(`   - Ou lancez: mongod.exe`);
      process.exit(1);
    }
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB déconnecté');
  } catch (error) {
    console.error(`❌ Erreur de déconnexion: ${error.message}`);
  }
}

// Événements de connexion
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB déconnecté - tentative de reconnexion...');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Erreur MongoDB: ${err.message}`);
});

module.exports = {
  connectDatabase,
  disconnectDatabase
};
