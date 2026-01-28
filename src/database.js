const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(config.MONGODB_URI);

    isConnected = true;

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
  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Disconnect Error: ${error.message}${config.COLORS.RESET}`);
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};
