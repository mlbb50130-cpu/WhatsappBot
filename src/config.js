require('dotenv').config();

module.exports = {
  // 🤖 Bot Configuration
  PREFIX: process.env.PREFIX || process.env.BOT_PREFIX || '!',
  ADMIN_JIDS: process.env.ADMIN_JIDS ? process.env.ADMIN_JIDS.split(',').map(j => j.trim()) : [],
  BOT_NAME: 'TetsuBot',
  BOT_VERSION: '1.0.0',
  
  // 💾 Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot',
  DB_NAME: 'tetsubot',
  
  // 🔐 Session
  SESSION_NAME: process.env.WHATSAPP_SESSION_NAME || 'tetsubot_session',
  SESSION_DIR: './sessions',
  
  // 👥 GROUP SETTINGS
  GROUP_FEATURES: {
    xpSystem: true,
    levelSystem: true,
    quizSystem: true,
    duelSystem: true,
    lootSystem: true,
    leaderboard: true,
    antiSpam: true,
    antiLink: false,
    autoWelcome: true
  },

  // 🎮 Game Features
  XP_PER_MESSAGE: parseInt(process.env.XP_PER_MESSAGE) || 5,
  XP_COOLDOWN: parseInt(process.env.XP_COOLDOWN) || 5000,
  COMMAND_COOLDOWN: 6000,
  
  // 📊 Levels & Ranks
  RANKS: {
    1: { name: 'Genin Otaku', emoji: '🥋' },
    6: { name: 'Chuunin Otaku', emoji: '🎌' },
    11: { name: 'Jounin Otaku', emoji: '⚔️' },
    21: { name: 'Sensei Otaku', emoji: '👨‍🏫' },
    31: { name: 'Légende Otaku', emoji: '✨' },
    51: { name: 'Dieu Otaku', emoji: '👑' }
  },
  
  // 🛡️ Anti-Features
  ANTI_SPAM_THRESHOLD: 5,
  ANTI_SPAM_WINDOW: 10000,
  BLOCK_LINKS: process.env.BLOCK_LINKS !== 'false',
  
  // 🎌 APIs
  JIKAN_API: process.env.JIKAN_API || 'https://api.jikan.moe/v4',
  JIKAN_ENABLED: process.env.JIKAN_ENABLED !== 'false',
  
  // 🖥️ Console Colors
  COLORS: {
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    MAGENTA: '\x1b[35m'
  },

  // 📝 Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: './logs',
  
  // 🌍 Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEV_MODE: process.env.DEV_MODE === 'true'
};
