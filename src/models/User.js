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
    messages: { type: Number, default: 0 },
    quiz: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    duels: { type: Number, default: 0 }
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
  lastChakraReset: {
    type: Date,
    default: Date.now
  },
  powerLevel: {
    type: Number,
    default: 100
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
