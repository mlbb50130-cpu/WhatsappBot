const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  groupId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  moderator: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expired: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
}, { timestamps: true });

module.exports = mongoose.model('Warn', warnSchema);
