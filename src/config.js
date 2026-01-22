require('dotenv').config();

module.exports = {
  // Bot
  PREFIX: '!',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot',
  
  // Sessions
  SESSION_DIR: './whatsapp_auth',
  
  // Features
  GROUP_FEATURES: {
    xpSystem: true,
    levelSystem: true,
    quizSystem: true,
    warningSystem: true,
  },
  
  // Ranks
  RANKS: [
    { level: 1, name: 'Genin', icon: '🥚' },
    { level: 5, name: 'Chuunin', icon: '🐣' },
    { level: 10, name: 'Jounin', icon: '🐤' },
    { level: 20, name: 'Sanin', icon: '🦅' },
    { level: 50, name: 'Hokage', icon: '👑' },
    { level: 100, name: 'Dieu Otaku', icon: '⭐' },
  ],
  LOG_DIR: './logs',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};
