const mongoose = require('mongoose');

// Schéma pour les stats de chaque utilisateur dans chaque groupe
const groupUserStatsSchema = new mongoose.Schema({
  groupJid: {
    type: String,
    required: true,
    index: true
  },
  userJid: {
    type: String,
    required: true,
    index: true
  },
  username: String,
  
  // Stats spécifiques au groupe
  stats: {
    messages: { type: Number, default: 0, min: 0 },
    quiz: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    duels: { type: Number, default: 0, min: 0 },
    loots: { type: Number, default: 0, min: 0 }
  },
  
  // XP et level locaux au groupe
  groupXp: {
    type: Number,
    default: 0,
    min: 0
  },
  groupLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  groupRank: {
    type: String,
    default: 'Genin Otaku'
  },
  
  // Timestamps
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
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

// Index composé pour rechercher rapidement les stats d'un utilisateur dans un groupe
groupUserStatsSchema.index({ groupJid: 1, userJid: 1 }, { unique: true });
groupUserStatsSchema.index({ groupJid: 1, groupXp: -1 }); // Pour les leaderboards
groupUserStatsSchema.index({ groupJid: 1, groupLevel: -1 });

module.exports = mongoose.model('GroupUserStats', groupUserStatsSchema);
