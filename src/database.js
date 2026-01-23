const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    console.log('✅ Database already connected');
    return;
  }

  try {
    await mongoose.connect(config.MONGODB_URI);

    isConnected = true;
    console.log(`${config.COLORS.GREEN}✅ MongoDB Connected${config.COLORS.RESET}`);

    // Load models
    require('./models/User');
    require('./models/Group');
    require('./models/Inventory');
    require('./models/Quest');
    require('./models/Warn');

  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Database Connection Error: ${error.message}${config.COLORS.RESET}`);
    setTimeout(connectDatabase, 5000); // Retry after 5 seconds
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

module.exports = {
  connectDatabase,
  disconnectDatabase
};
