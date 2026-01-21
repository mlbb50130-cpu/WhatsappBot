const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    itemId: String,
    name: String,
    description: String,
    rarity: String, // common, rare, epic, legendary
    type: String, // weapon, armor, accessory, consumable
    stats: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      hp: { type: Number, default: 0 }
    },
    quantity: { type: Number, default: 1 },
    equipped: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now }
  }],
  slots: {
    weapon: {
      itemId: String,
      name: String
    },
    armor: {
      itemId: String,
      name: String
    },
    accessory: {
      itemId: String,
      name: String
    }
  },
  currency: {
    gold: { type: Number, default: 0 },
    diamonds: { type: Number, default: 0 }
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

module.exports = mongoose.model('Inventory', inventorySchema);
