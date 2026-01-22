// Configuration complète avancée du bot TetsuBot
// Copier et adapter selon vos besoins

module.exports = {
  // ==================== BOT SETTINGS ====================
  BOT_NAME: 'TetsuBot',
  BOT_VERSION: '1.0.0',
  BOT_OWNER: 'Your Name',
  BOT_DESCRIPTION: 'Otaku RPG Bot for WhatsApp',

  // ==================== DATABASE ====================
  DATABASE: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tetsubot',
    DB_NAME: 'tetsubot',
    COLLECTION_PREFIX: 'tb_',
    AUTO_RECONNECT: true,
    RECONNECT_INTERVAL: 5000,
    POOL_SIZE: 10,
  },

  // ==================== BAILEYS SETTINGS ====================
  BAILEYS: {
    // Options de session
    AUTH_DIR: './sessions',
    KEEP_ALIVE_INTERVAL: 10000, // 10s
    MARK_ONLINE: true,
    
    // Reconnection
    AUTO_RECONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    RETRY_DELAY: 10000,
    
    // Messages
    STORE_TIMEOUT: 10000,
    CHAT_TIMEOUT: 5000,
    
    // Anti-détection
    BROWSER: ['TetsuBot', 'WhatsApp', '2.2330.12'],
    USER_AGENT: 'WhatsApp/2.2330.12 N',
  },

  // ==================== XP & LEVEL SYSTEM ====================
  XP_SYSTEM: {
    XP_PER_MESSAGE: 5,
    XP_PER_COMMAND: 10,
    XP_MULTIPLIER: 1.15,
    BASE_XP_FOR_LEVEL: 100,
    MAX_LEVEL: 999,
    XP_COOLDOWN: 5000, // 5s
    
    // Bonus XP
    BONUS_XP_QUIZ_WIN: 50,
    BONUS_XP_DUEL_WIN: 100,
    BONUS_XP_ROULETTE_WIN: 150,
    BONUS_XP_PFC_WIN: 20,
    
    // Rank system
    RANK_COLORS: {
      'Novice': '#808080',
      'Apprenti': '#0066FF',
      'Adepte': '#00AA00',
      'Expert': '#FFAA00',
      'Maître': '#FF0000',
      'Légendaire': '#FF00FF',
      'Divin': '#00FFFF',
    }
  },

  // ==================== LOOT SYSTEM ====================
  LOOT_SYSTEM: {
    // Rarité drop rates
    RARITY_RATES: {
      common: 60,    // 60%
      uncommon: 25,  // 25%
      rare: 10,      // 10%
      epic: 4,       // 4%
      legendary: 1,  // 1%
    },
    
    // Items pool
    ITEMS: {
      common: ['Bronze Sword', 'Cloth Armor', 'Wood Shield', 'Iron Ring'],
      uncommon: ['Steel Sword', 'Leather Armor', 'Steel Shield', 'Silver Ring'],
      rare: ['Crystal Blade', 'Mithril Armor', 'Diamond Shield', 'Gold Ring'],
      epic: ['Excalibur', 'Dragon Armor', 'Holy Shield', 'Ruby Ring'],
      legendary: ['Infinity Blade', 'God Armor', 'Ultimate Shield', 'Divine Ring']
    },
    
    // Gold drops
    GOLD_MIN: 10,
    GOLD_MAX: 500,
  },

  // ==================== COMBAT SYSTEM ====================
  COMBAT_SYSTEM: {
    BASE_DAMAGE: 10,
    LEVEL_DAMAGE_MULTIPLIER: 1.5,
    MIN_RANDOM_DAMAGE: 5,
    MAX_RANDOM_DAMAGE: 30,
    CRIT_CHANCE: 0.15, // 15%
    CRIT_MULTIPLIER: 1.5, // 1.5x damage
    
    DUEL_COOLDOWN: 30000, // 30s
    DUEL_TIMEOUT: 60000, // 1m
    DUEL_REWARD_MULTIPLIER: 10, // 10 * level = reward
  },

  // ==================== QUIZ SYSTEM ====================
  QUIZ_SYSTEM: {
    TIME_LIMIT: 30000, // 30s
    QUESTIONS_PER_QUIZ: 6,
    CORRECT_ANSWER_XP: 50,
    STREAK_BONUS_XP: 100,
    QUIZ_COOLDOWN: 60000, // 1m
  },

  // ==================== COOLDOWNS ====================
  COOLDOWNS: {
    command_default: 3000,      // 3s
    quiz_cooldown: 60000,       // 1m
    duel_cooldown: 30000,       // 30s
    loot_cooldown: 10000,       // 10s
    roulette_cooldown: 20000,   // 20s
    chance_cooldown: 86400000,  // 24h (daily)
    xp_message_cooldown: 5000,  // 5s
  },

  // ==================== ANTI-SPAM & SECURITY ====================
  SECURITY: {
    // Anti-spam
    MAX_MESSAGES_PER_INTERVAL: 5,
    SPAM_CHECK_INTERVAL: 10000, // 10s
    
    // Anti-link
    BLOCK_LINKS: true,
    ALLOWED_DOMAINS: [
      'youtube.com',
      'youtu.be',
      'instagram.com',
      'tiktok.com'
    ],
    
    // Warn system
    MAX_WARNINGS: 3,
    WARN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
    AUTO_KICK_ON_WARN: 3,
    AUTO_BAN_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // ==================== PAGINATION ====================
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    TIMEOUT: 30000, // 30s
  },

  // ==================== LOGGING ====================
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
    LOG_FILE: 'tetsubot.log',
    LOG_ROTATION: '1d', // Rotate daily
    KEEP_LOGS: 7, // Keep 7 days of logs
    
    // Sentry
    SENTRY_ENABLED: false,
    SENTRY_DSN: process.env.SENTRY_DSN,
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    // Discord Webhook
    DISCORD_ENABLED: false,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL,
    
    // Telegram
    TELEGRAM_ENABLED: false,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  },

  // ==================== EXTERNAL APIS ====================
  APIS: {
    // Jikan (Anime)
    JIKAN_ENABLED: true,
    JIKAN_API: 'https://api.jikan.moe/v4',
    JIKAN_TIMEOUT: 10000,
    JIKAN_CACHE_TTL: 3600000, // 1 hour
    
    // Waifu
    WAIFU_ENABLED: true,
    WAIFU_API: 'https://api.waifu.pics',
    
    // MyAnimeList
    MAL_ENABLED: false,
    MAL_CLIENT_ID: process.env.MAL_CLIENT_ID,
    
    // Imgflip
    IMGFLIP_ENABLED: false,
    IMGFLIP_USERNAME: process.env.IMGFLIP_USERNAME,
    IMGFLIP_PASSWORD: process.env.IMGFLIP_PASSWORD,
    
    // REST Countries
    COUNTRIES_ENABLED: true,
    COUNTRIES_API: 'https://restcountries.com/v3.1',
    
    // Stripe
    STRIPE_ENABLED: false,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    
    // Firebase
    FIREBASE_ENABLED: false,
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
    
    // AWS S3
    S3_ENABLED: false,
    S3_BUCKET: process.env.AWS_S3_BUCKET,
    S3_REGION: process.env.AWS_REGION || 'eu-west-1',
  },

  // ==================== CACHE ====================
  CACHE: {
    ENABLED: true,
    TTL: 3600000, // 1 hour
    MAX_SIZE: 1000, // max items
    CLEANUP_INTERVAL: 600000, // 10m
  },

  // ==================== COMMANDS ====================
  COMMANDS: {
    // Command prefix
    PREFIX: process.env.PREFIX || '!',
    
    // Disabled commands
    DISABLED_COMMANDS: [],
    
    // Admin commands only in groups
    ADMIN_ONLY_IN_GROUPS: true,
    
    // Default command cooldown
    DEFAULT_COOLDOWN: 3000,
  },

  // ==================== GROUPS ====================
  GROUPS: {
    // Group-only commands
    EXCLUDE_FROM_DM: ['kick', 'warn', 'clear', 'classement'],
    
    // DM-only commands
    DM_ONLY: [],
    
    // Auto-leave settings
    AUTO_LEAVE_ON_ERROR: false,
    AUTO_LEAVE_TIMEOUT: 300000, // 5m
  },

  // ==================== PERMISSIONS ====================
  PERMISSIONS: {
    // Admin JIDs (from .env)
    ADMIN_JIDS: (process.env.ADMIN_JIDS || '').split(',').filter(Boolean),
    
    // Mod roles
    MOD_PERMISSIONS: {
      can_kick: true,
      can_warn: true,
      can_mute: true,
      can_clear_messages: false,
    },
    
    // User permissions
    USER_PERMISSIONS: {
      can_play_games: true,
      can_trade: true,
      can_join_guilds: true,
    }
  },

  // ==================== FEATURES ====================
  FEATURES: {
    // Level system
    LEVEL_SYSTEM_ENABLED: true,
    
    // XP system
    XP_SYSTEM_ENABLED: true,
    
    // Quests
    QUESTS_ENABLED: false,
    
    // Guilds
    GUILDS_ENABLED: false,
    
    // Trading
    TRADING_ENABLED: false,
    
    // Bosses/Raids
    BOSSES_ENABLED: false,
    
    // Events
    EVENTS_ENABLED: false,
    
    // Seasonal content
    SEASONAL_CONTENT_ENABLED: false,
  },

  // ==================== MAINTENANCE ====================
  MAINTENANCE: {
    ENABLED: false,
    MESSAGE: '🔧 Bot en maintenance. Réessayez plus tard!',
    
    // Backup
    AUTO_BACKUP_ENABLED: true,
    BACKUP_INTERVAL: 86400000, // 24h
    BACKUP_DIR: './backups',
    KEEP_BACKUPS: 30, // days
  },

  // ==================== COLORS & EMOJIS ====================
  COLORS: {
    primary: '🎮',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    xp: '⭐',
    level: '📈',
    gold: '💰',
    sword: '⚔️',
    shield: '🛡️',
    heart: '❤️',
    diamond: '💎',
  },

  // ==================== TIMEOUTS ====================
  TIMEOUTS: {
    DATABASE_QUERY: 10000,
    API_REQUEST: 10000,
    COMMAND_EXECUTION: 30000,
    SESSION_SAVE: 5000,
  },
};
