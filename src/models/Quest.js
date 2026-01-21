const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  questId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: String, // daily, weekly, quest
  difficulty: String, // easy, medium, hard
  requirements: {
    minLevel: { type: Number, default: 1 },
    minXp: { type: Number, default: 0 }
  },
  objectives: [{
    objectiveId: String,
    description: String,
    target: Number,
    current: { type: Number, default: 0 }
  }],
  rewards: {
    xp: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    diamonds: { type: Number, default: 0 },
    items: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
