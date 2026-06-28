const User = require('../models/User');

// Rendement passif par rarete (4 slots legendaires = 1000 XP/h).
const RARITY_XP_RATES = {
  common: 50,      // ⚪  (4x = 200/h)
  rare: 100,       // 🔵  (4x = 400/h)
  epic: 175,       // 🟣  (4x = 700/h)
  legendary: 250   // 🟡  (4x = 1000/h)
};

// Progression des raretes (fusion 3x identiques -> rarete suivante).
const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'exotic'];

const RARITY_EMOJI = {
  common: '⚪',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
  exotic: '🌈'
};

// Exotique: rendement croissant par niveau d'amelioration.
const EXOTIC_BASE_XP = 300;
const EXOTIC_XP_PER_LEVEL = 30;
const EXOTIC_MAX_LEVEL = 10;

// Plafond theorique pour les raretes non-exotiques (4 legendaires).
const MAX_PASSIVE_XP = 1000;

function nextRarity(rarity) {
  const i = RARITY_ORDER.indexOf(rarity);
  if (i === -1 || i >= RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[i + 1];
}

function exoticXpPerHour(level = 1) {
  const lvl = Math.max(1, Math.min(EXOTIC_MAX_LEVEL, level || 1));
  return EXOTIC_BASE_XP + (lvl - 1) * EXOTIC_XP_PER_LEVEL;
}

// XP/h d'un item (gere l'exotique a niveau).
function itemXpPerHour(rarity, exoticLevel = 0) {
  if (rarity === 'exotic') return exoticXpPerHour(exoticLevel || 1);
  return RARITY_XP_RATES[rarity] || 0;
}

function resolveItem(item, inventory) {
  let rarity = item.rarity;
  let exoticLevel = item.exoticLevel || 0;
  if ((!rarity || (rarity === 'exotic' && !exoticLevel)) && Array.isArray(inventory)) {
    const invItem = inventory.find(i => i.itemId === item.itemId || i.name === item.name);
    if (invItem) {
      rarity = rarity || invItem.rarity;
      if (!exoticLevel) exoticLevel = invItem.exoticLevel || 0;
    }
  }
  return { rarity, exoticLevel };
}

function calculateEquipmentXP(equipped, inventory = []) {
  if (!equipped) return 0;
  let totalXP = 0;
  ['head', 'body', 'hands', 'feet'].forEach(slot => {
    const item = equipped[slot];
    if (item && item.name) {
      const { rarity, exoticLevel } = resolveItem(item, inventory);
      totalXP += itemXpPerHour(rarity, exoticLevel);
    }
  });
  return totalXP;
}

async function applyPassiveEquipmentXP() {
  try {
    const now = Date.now();
    const users = await User.find({ 'equipped.head.name': { $exists: true, $ne: null } });
    if (users.length === 0) return;

    for (const user of users) {
      try {
        const lastTime = user.lastEquipmentXpTime ? new Date(user.lastEquipmentXpTime).getTime() : 0;
        if (now - lastTime < 3600000) continue; // toutes les heures

        const equipmentXP = calculateEquipmentXP(user.equipped, user.inventory);
        if (equipmentXP > 0) {
          user.xp += equipmentXP;
          user.lastEquipmentXpTime = new Date();
          await user.save();
        }
      } catch (userError) {
        // ignore par utilisateur
      }
    }
  } catch (error) {
    // ignore
  }
}

function getEquipmentXPDetails(equipped, inventory = []) {
  if (!equipped) return { items: [], totalXP: 0 };
  const items = [];
  let totalXP = 0;
  ['head', 'body', 'hands', 'feet'].forEach(slot => {
    const item = equipped[slot];
    if (item && item.name) {
      const { rarity, exoticLevel } = resolveItem(item, inventory);
      const xpPerHour = itemXpPerHour(rarity, exoticLevel);
      items.push({ slot, name: item.name, rarity, exoticLevel, xpPerHour });
      totalXP += xpPerHour;
    }
  });
  return { items, totalXP };
}

module.exports = {
  calculateEquipmentXP,
  applyPassiveEquipmentXP,
  getEquipmentXPDetails,
  RARITY_XP_RATES,
  RARITY_ORDER,
  RARITY_EMOJI,
  MAX_PASSIVE_XP,
  EXOTIC_MAX_LEVEL,
  nextRarity,
  exoticXpPerHour,
  itemXpPerHour,
};
