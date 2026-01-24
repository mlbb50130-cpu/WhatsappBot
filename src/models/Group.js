// 👥 Configuration des Groupes WhatsApp

const mongoose = require('mongoose');

// Schéma pour stocker les paramètres des groupes
const groupSchema = new mongoose.Schema({
  groupJid: {
    type: String,
    required: true,
    unique: true
  },
  groupName: {
    type: String,
    required: true
  },
  groupOwner: String,
  prefix: {
    type: String,
    default: '!'
  },
  // Activation du bot
  isActive: {
    type: Boolean,
    default: false
  },
  activatedBy: String,
  activatedAt: Date,
  deactivatedBy: String,
  deactivatedAt: Date,
  // Features activées/désactivées
  features: {
    xpSystem: { type: Boolean, default: true },
    levelSystem: { type: Boolean, default: true },
    quizSystem: { type: Boolean, default: true },
    duelSystem: { type: Boolean, default: true },
    lootSystem: { type: Boolean, default: true },
    leaderboard: { type: Boolean, default: true },
    antiSpam: { type: Boolean, default: true },
    antiLink: { type: Boolean, default: false },
    autoWelcome: { type: Boolean, default: true },
    autoGoodbye: { type: Boolean, default: false }
  },

  // Paramètres
  settings: {
    xpPerMessage: { type: Number, default: 5 },
    xpCooldown: { type: Number, default: 5000 },
    commandCooldown: { type: Number, default: 3000 },
    autoSaveInterval: { type: Number, default: 300000 } // 5 minutes
  },

  // Permissions personnalisées
  permissions: {
    onlyAdminsCanUseCommands: { type: Boolean, default: false },
    onlyMembersCanDuel: { type: Boolean, default: true },
    blockInviteLinks: { type: Boolean, default: false },
    blockNSFW: { type: Boolean, default: true }
  },

  // Messages personnalisés
  messages: {
    welcome: { type: String, default: '👋 Bienvenue dans le groupe!' },
    goodbye: { type: String, default: 'Au revoir!' },
    cmdNotFound: { type: String, default: '❌ Commande non trouvée' },
    noPermission: { type: String, default: '🚫 Permission refusée' }
  },

  // Statistiques du groupe
  stats: {
    totalMessages: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalCommands: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },

  // Membres modérés
  moderators: [String], // JIDs des modérateurs
  bannedMembers: [
    {
      jid: String,
      reason: String,
      bannedAt: Date,
      bannedUntil: Date
    }
  ],

  // Logs
  logs: {
    enabled: { type: Boolean, default: true },
    logJoins: { type: Boolean, default: true },
    logLeaves: { type: Boolean, default: true },
    logDeletes: { type: Boolean, default: true }
  },

  // Daily image rotation per group (24h)
  dailyImages: {
    lastReset: { type: Date, default: Date.now },
    used: {
      naruto: { type: [String], default: [] },
      madara: { type: [String], default: [] },
      miku: { type: [String], default: [] },
      nino: { type: [String], default: [] },
      yoruichi: { type: [String], default: [] },
      bleach: { type: [String], default: [] },
      zerotwo: { type: [String], default: [] },
      yami: { type: [String], default: [] },
      tsunade: { type: [String], default: [] },
      tengen: { type: [String], default: [] },
      sukuna: { type: [String], default: [] },
      rengokudemon: { type: [String], default: [] },
      makima: { type: [String], default: [] },
      mikunakano: { type: [String], default: [] },
      livai: { type: [String], default: [] },
      nsfw: { type: [String], default: [] },
      jinwoo: { type: [String], default: [] },
      husbando: { type: [String], default: [] },
      gokuui: { type: [String], default: [] },
      gojo: { type: [String], default: [] },
      deku: { type: [String], default: [] },
      boahancook: { type: [String], default: [] }
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index pour performance
groupSchema.index({ updatedAt: -1 });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
