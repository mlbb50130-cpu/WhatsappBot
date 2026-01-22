/**
 * Configuration Avancée du Bot
 * ==============================
 * 
 * Fichier de configuration pour les paramètres avancés
 * du bot TetsuBot
 */

module.exports = {
  // ===== XP SYSTEM =====
  XP_CONFIG: {
    PER_MESSAGE: 5,              // XP par message
    PER_QUIZ: 25,                // XP par quiz correct
    PER_DUEL_WIN: 30,            // XP par victoire duel
    PER_LOOT: 10,                // XP de base par loot (varie par rareté)
    MESSAGE_COOLDOWN: 5000,      // 5 secondes entre chaque XP message
    QUEST_BONUS: 50              // XP bonus par quête complétée
  },

  // ===== LEVEL THRESHOLDS =====
  LEVEL_CONFIG: {
    BASE_XP_FOR_LEVEL: 100,      // XP de base pour le niveau 1
    XP_MULTIPLIER: 1.15,         // Multiplicateur par niveau
    MAX_LEVEL: 999               // Niveau maximum
  },

  // ===== INVENTORY =====
  INVENTORY_CONFIG: {
    MAX_SLOTS: 50,               // Slots d'inventaire max
    LOOT_CHANCE: {
      common: 40,                // 40% chance
      rare: 25,                  // 25% chance
      epic: 20,                  // 20% chance
      legendary: 15              // 15% chance
    }
  },

  // ===== DUELS =====
  DUEL_CONFIG: {
    BASE_DAMAGE: 10,             // Dégâts de base
    LEVEL_MULTIPLIER: 1.5,       // Multiplicateur par niveau
    RANDOMNESS: 50,              // +/- points aléatoires
    REWARD_WIN: 30,              // XP pour victoire
    REWARD_LOSS: 10              // XP pour défaite
  },

  // ===== QUIZ =====
  QUIZ_CONFIG: {
    TIME_LIMIT: 30000,           // 30 secondes pour répondre
    REWARD_CORRECT: 25,          // XP pour bonne réponse
    REWARD_WRONG: 0,             // XP pour mauvaise réponse
    DIFFICULTY_LEVELS: {
      easy: 15,
      medium: 25,
      hard: 50
    }
  },

  // ===== MINI-GAMES =====
  GAMES_CONFIG: {
    PFC: {
      WIN_REWARD: 20,
      LOSS_REWARD: 5,
      DRAW_REWARD: 10
    },
    ROULETTE: {
      WIN_REWARD: 100,
      LOSS_REWARD: 20,
      WIN_CHANCE: 66                // % de chance de gagner
    },
    CHANCE: {
      MIN: 0,
      MAX: 100,
      VARIANCE: 20
    }
  },

  // ===== MODERATION =====
  MODERATION_CONFIG: {
    MAX_WARNINGS: 3,             // Warnings avant ban
    WARNING_EXPIRE_DAYS: 30,     // Jours avant expiration
    SPAM_THRESHOLD: 5,           // Messages avant spam
    SPAM_WINDOW: 10000,          // 10 secondes
    LINK_ALLOWED_FOR_ADMIN: true // Admin peut envoyer des liens
  },

  // ===== LOOT TABLE =====
  LOOT_TABLE: [
    // Common (40%)
    {
      id: 'kunai',
      name: 'Kunai Ninja',
      rarity: 'common',
      emoji: '🔪',
      weight: 40,
      xp: 10,
      stats: { attack: 5 }
    },
    // Rare (25%)
    {
      id: 'shuriken',
      name: 'Shuriken Doré',
      rarity: 'rare',
      emoji: '⭐',
      weight: 25,
      xp: 25,
      stats: { attack: 15 }
    },
    // Epic (20%)
    {
      id: 'katana',
      name: 'Sabre Katana',
      rarity: 'epic',
      emoji: '⚔️',
      weight: 20,
      xp: 50,
      stats: { attack: 30 }
    },
    // Legendary (15%)
    {
      id: 'relic',
      name: 'Relique Légendaire',
      rarity: 'legendary',
      emoji: '👑',
      weight: 5,
      xp: 100,
      stats: { attack: 50, defense: 10 }
    }
  ],

  // ===== RANK SYSTEM =====
  RANKS: {
    1: { name: 'Genin Otaku', emoji: '🥋', color: '#AAAAAA' },
    6: { name: 'Chuunin Otaku', emoji: '🎌', color: '#4169E1' },
    11: { name: 'Jounin Otaku', emoji: '⚔️', color: '#FF8C00' },
    21: { name: 'Sensei Otaku', emoji: '👨‍🏫', color: '#FFD700' },
    31: { name: 'Légende Otaku', emoji: '✨', color: '#FF1493' },
    51: { name: 'Dieu Otaku', emoji: '👑', color: '#FF69B4' }
  },

  // ===== COOLDOWNS =====
  COOLDOWN_CONFIG: {
    COMMAND_DEFAULT: 3000,       // 3 secondes par défaut
    COMMAND_MIN: 1000,           // Min 1 secondes
    COMMAND_MAX: 60000,          // Max 60 secondes
    XP_COOLDOWN: 5000            // 5 secondes pour XP message
  },

  // ===== ANTI-FEATURES =====
  ANTI_CONFIG: {
    ANTI_LINK: true,
    ANTI_SPAM: true,
    ANTI_MENTION_SPAM: true,
    ANTI_STICKER_SPAM: true,
    SPAM_KICK_THRESHOLD: 10,    // Kick après X messages spam
    WARNING_ON_LINK: false       // Avertir au lieu de supprimer
  },

  // ===== DATABASE =====
  DATABASE_CONFIG: {
    COLLECTION_PREFIX: 'otaku_',
    AUTO_BACKUP: false,
    BACKUP_INTERVAL: 86400000,  // 24 heures
    CONNECTION_TIMEOUT: 5000,
    RECONNECT_TRIES: 10
  },

  // ===== LOGGING =====
  LOGGING_CONFIG: {
    LEVEL: 'info',              // debug, info, warn, error
    CONSOLE_COLOR: true,
    FILE_LOGGING: false,
    LOG_FILE: 'logs/bot.log',
    TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss'
  },

  // ===== CACHE =====
  CACHE_CONFIG: {
    ENABLED: true,
    USER_CACHE_TIME: 300000,    // 5 minutes
    COMMAND_CACHE_TIME: 60000,  // 1 minute
    MAX_CACHE_SIZE: 1000        // Max éléments en cache
  },

  // ===== API EXTERNAL =====
  API_CONFIG: {
    WAIFU_PICS_ENABLED: true,
    JIKAN_ENABLED: false,       // Données anime
    TIMEOUT: 10000,             // Timeout 10s
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  },

  // ===== FEATURES TOGGLES =====
  FEATURES: {
    LEVEL_SYSTEM: true,
    QUIZ_SYSTEM: true,
    DUEL_SYSTEM: true,
    LOOT_SYSTEM: true,
    QUEST_SYSTEM: false,        // À implémenter
    RAID_SYSTEM: false,         // À implémenter
    INVENTORY: true,
    MODERATION: true,
    AUTO_ROLE: false,
    WELCOME_MESSAGE: true,
    GOODBYE_MESSAGE: false
  },

  // ===== MESSAGES =====
  MESSAGES: {
    WELCOME: '🎌 Bienvenue {username} dans ce groupe otaku!',
    GOODBYE: '👋 {username} a quitté le groupe.',
    GROUP_RULES: 'Respectez les règles du groupe!',
    SPAM_WARNING: '⚠️ Stop le spam!',
    LINK_BLOCKED: '🚫 Lien non autorisé.',
    WELCOME_MESSAGE_ENABLED: false
  },

  // ===== PERMISSIONS =====
  PERMISSIONS: {
    ADMIN_COMMANDS_DM: true,     // Admin peut utiliser cmd admin en DM
    MOD_CAN_KICK: true,
    MOD_CAN_WARN: true,
    MOD_CAN_MUTE: true,
    OWNER_ONLY_RESET: true,      // Seulement owner peut reset stats
    RESTRICTED_CMDS: ['setxp', 'setlevel', 'ban']
  },

  // ===== TIMEOUTS & DELAYS =====
  TIMEOUTS: {
    MESSAGE_PROCESS: 1000,
    DATABASE_QUERY: 5000,
    API_REQUEST: 10000,
    BOT_RESPONSE: 500
  }
};
