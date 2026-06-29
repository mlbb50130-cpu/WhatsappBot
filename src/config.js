require('dotenv').config({ quiet: true });

module.exports = {
  // 🤖 Bot Configuration
  PREFIX: process.env.PREFIX || process.env.BOT_PREFIX || '!',
  ADMIN_JIDS: process.env.ADMIN_JIDS ? process.env.ADMIN_JIDS.split(',').map(j => j.trim()) : [],
  BOT_NAME: process.env.BOT_NAME || 'Kassim-bot',
  BOT_VERSION: '1.0.0',
  
  // 💾 Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot',
  DB_NAME: 'tetsubot',
  
  // 🔐 Session
  SESSION_NAME: process.env.WHATSAPP_SESSION_NAME || 'tetsubot_session',
  SESSION_DIR: './sessions',

  // 🔗 Connexion WhatsApp (multi-device) - pairing code au lieu du QR
  // Numero du bot (format international, sans + ni espaces), ex: 2376XXXXXXXX
  PHONE_NUMBER: (process.env.BOT_PHONE_NUMBER || process.env.PHONE_NUMBER || '').replace(/[^0-9]/g, ''),
  // Pairing code actif par defaut des qu'un numero est fourni (sauf USE_PAIRING_CODE=false)
  USE_PAIRING_CODE: process.env.USE_PAIRING_CODE
    ? process.env.USE_PAIRING_CODE !== 'false'
    : Boolean((process.env.BOT_PHONE_NUMBER || process.env.PHONE_NUMBER || '').trim()),
  
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
  XP_PER_MESSAGE: parseInt(process.env.XP_PER_MESSAGE) || 20,
  XP_COOLDOWN: parseInt(process.env.XP_COOLDOWN) || 5000,
  COMMAND_COOLDOWN: 1000,
  XP_COMMAND_BONUS: parseInt(process.env.XP_COMMAND_BONUS) || 100,
  
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
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ||
    process.env.GEMINI_APIKEY ||
    process.env.GEMINI_API ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GENAI_API_KEY ||
    process.env.GEMENI_API_KEY ||
    process.env.GEMENI_APIKEY ||
    process.env.GEMENI_API ||
    process.env.GEMENI_KEY ||
    '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  
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
