const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 secondes

async function connectDatabase() {
  if (isConnected) {
    console.log('✅ Database already connected');
    return;
  }

  try {
    console.log(`🔄 Tentative de connexion à MongoDB: ${config.MONGODB_URI}`);
    
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
    retryCount = 0; // Réinitialiser le compteur en cas de succès
    console.log(`${config.COLORS.GREEN}✅ MongoDB Connected avec succès!${config.COLORS.RESET}`);
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    console.log(`🔗 Hôte: ${mongoose.connection.host}`);

    // Load models
    require('./models/User');
    require('./models/Group');
    require('./models/Inventory');
    require('./models/Quest');
    require('./models/Warn');

    console.log(`${config.COLORS.GREEN}✅ Tous les modèles chargés${config.COLORS.RESET}`);

  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Erreur de connexion MongoDB: ${error.message}${config.COLORS.RESET}`);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delaySeconds = RETRY_DELAY / 1000;
      console.log(`⏳ Nouvelle tentative dans ${delaySeconds}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDatabase, RETRY_DELAY);
    } else {
      console.error(`${config.COLORS.RED}❌ Impossible de se connecter après ${MAX_RETRIES} tentatives${config.COLORS.RESET}`);
      console.log(`\n📌 Assurez-vous que MongoDB est en cours d'exécution:`);
      console.log(`   - Ouvrez MongoDB Compass`);
      console.log(`   - Ou lancez: C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe`);
      process.exit(1);
    }
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log(`${config.COLORS.GREEN}✅ MongoDB Disconnected${config.COLORS.RESET}`);
  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Disconnect Error: ${error.message}${config.COLORS.RESET}`);
  }
}

// Événements de connexion
mongoose.connection.on('disconnected', () => {
  console.log(`${config.COLORS.YELLOW}⚠️  MongoDB Disconnected - attempting to reconnect...${config.COLORS.RESET}`);
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`${config.COLORS.RED}❌ MongoDB Connection Error: ${err.message}${config.COLORS.RESET}`);
});

module.exports = {
  connectDatabase,
  disconnectDatabase
};
