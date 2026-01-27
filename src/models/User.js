const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  rank: {
    type: String,
    default: 'Genin Otaku'
  },
  title: {
    type: String,
    default: '🎌 Otaku'
  },
  badges: [{
    name: String,
    emoji: String,
    unlockedAt: Date
  }],
  lastXpTime: {
    type: Date,
    default: Date.now
  },
  inventory: [{
    itemId: String,
    name: String,
    quantity: { type: Number, default: 1 },
    rarity: String, // common, rare, epic, legendary
    addedAt: { type: Date, default: Date.now }
  }],
  stats: {
    messages: { type: Number, default: 0, min: 0 },
    quiz: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    duels: { type: Number, default: 0, min: 0 }
  },
  warnings: {
    type: Number,
    default: 0
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: Date,
  chakra: {
    type: Number,
    default: 100
  },
  maxChakra: {
    type: Number,
    default: 100
  },
  lastChakraReset: {
    type: Date,
    default: Date.now
  },
  powerLevel: {
    type: Number,
    default: 100
  },
  quizHistory: {
    type: [Number],
    default: []
  },
  equipped: {
    head: { itemId: String, name: String },
    body: { itemId: String, name: String },
    hands: { itemId: String, name: String },
    feet: { itemId: String, name: String }
  },
  lastEquipmentXpTime: {
    type: Date,
    default: null
  },
  dailyQuests: {
    lastReset: { type: Date, default: Date.now },
    progress: {
      messages: { type: Number, default: 0 },
      duels: { type: Number, default: 0 },
      quizCorrect: { type: Number, default: 0 }
    },
    completed: { type: [Number], default: [] }
  },
  weeklyQuests: {
    lastReset: { type: Date, default: Date.now },
    progress: {
      loots: { type: Number, default: 0 },
      level: { type: Number, default: 1 }
    },
    completed: { type: [Number], default: [] }
  },
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
      boahancook: { type: [String], default: [] },
      waifu: { type: [String], default: [] },
      hentai: { type: [String], default: [] },
      hentaivd: { type: [String], default: [] },
      vegito: { type: [String], default: [] }
    }
  },
  hentaiUsageToday: {
    lastReset: { type: Date, default: Date.now },
    hentai: { type: Number, default: 0 },
    hentaivd: { type: Number, default: 0 }
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

// Index for performance
userSchema.index({ level: -1, xp: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
