const User = require('../models/User');

// Rendement passif par rarete. Concu pour un maximum de 1000 XP/h
// lorsque les 4 slots sont equipes en legendaire (4 x 250 = 1000).
const RARITY_XP_RATES = {
  common: 50,      // ⚪  (4x = 200/h)
  rare: 100,       // 🔵  (4x = 400/h)
  epic: 175,       // 🟣  (4x = 700/h)
  legendary: 250   // 🟡  (4x = 1000/h)
};

// Plafond theorique du passif (4 slots legendaires).
const MAX_PASSIVE_XP = 1000;

/**
 * Calcule les XP gagnés par les équipements équipés
 * @param {Object} equipped - Objets équipés (head, body, hands, feet)
 * @returns {number} Total XP par heure
 */
function calculateEquipmentXP(equipped, inventory = []) {
  if (!equipped) return 0;

  let totalXP = 0;
  const slots = ['head', 'body', 'hands', 'feet'];

  slots.forEach(slot => {
    const item = equipped[slot];
    if (item && item.name) {
      let rarity = item.rarity;
      if (!rarity && Array.isArray(inventory)) {
        const invItem = inventory.find(i => i.itemId === item.itemId || i.name === item.name);
        rarity = invItem?.rarity;
      }
      const xpPerHour = RARITY_XP_RATES[rarity] || 0;
      totalXP += xpPerHour;
    }
  });

  return totalXP;
}

/**
 * Applique les XP passifs de tous les équipements pour tous les utilisateurs
 */
async function applyPassiveEquipmentXP() {
  try {
    const now = Date.now();
    
    // Récupérer tous les utilisateurs avec des équipements
    const users = await User.find({
      'equipped.head.name': { $exists: true, $ne: null }
    });

    if (users.length === 0) {
      return;
    }

    let updatedCount = 0;

    for (const user of users) {
      try {
        // Vérifier si on doit appliquer les XP (toutes les heures)
        const lastTime = user.lastEquipmentXpTime ? new Date(user.lastEquipmentXpTime).getTime() : 0;
        const hourInMs = 3600000;

        if (now - lastTime < hourInMs) {
          continue; // Pas encore 1 heure
        }

        // Calculer les XP à ajouter
        const equipmentXP = calculateEquipmentXP(user.equipped, user.inventory);

        if (equipmentXP > 0) {
          user.xp += equipmentXP;
          user.lastEquipmentXpTime = new Date();
          await user.save();
          updatedCount++;
        }
      } catch (userError) {
      }
    }

  } catch (error) {
  }
}

/**
 * Obtient le détail des XP gagnés par les équipements
 */
function getEquipmentXPDetails(equipped, inventory = []) {
  if (!equipped) return { items: [], totalXP: 0 };

  const items = [];
  const slots = ['head', 'body', 'hands', 'feet'];
  let totalXP = 0;

  slots.forEach(slot => {
    const item = equipped[slot];
    if (item && item.name) {
      let rarity = item.rarity;
      if (!rarity && Array.isArray(inventory)) {
        const invItem = inventory.find(i => i.itemId === item.itemId || i.name === item.name);
        rarity = invItem?.rarity;
      }
      const xpPerHour = RARITY_XP_RATES[rarity] || 0;
      items.push({
        slot,
        name: item.name,
        rarity,
        xpPerHour
      });
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
  MAX_PASSIVE_XP
};
