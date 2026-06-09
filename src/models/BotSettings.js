const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global',
  },
  chatbot: {
    pmEnabled: { type: Boolean, default: false },
    selectedCharacter: { type: Number, default: 0 },
  },
  botMode: {
    type: String,
    enum: ['public', 'private', 'self'],
    default: 'public',
  },
  moderators: {
    type: [String],
    default: [],
  },
  announcements: {
    atlasCommandRecapV1: {
      sentAt: Date,
      attemptedAt: Date,
      groupCount: { type: Number, default: 0 },
      groups: { type: [String], default: [] },
      failedGroups: { type: [String], default: [] },
    },
  },
}, { timestamps: true });

botSettingsSchema.statics.getGlobal = async function getGlobal() {
  let settings = await this.findOne({ key: 'global' });

  if (!settings) {
    settings = await this.create({ key: 'global' });
  }

  return settings;
};

module.exports = mongoose.model('BotSettings', botSettingsSchema);
