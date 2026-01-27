const User = require('../models/User');

const RARITY_XP_RATES = {
  common: 10,      // ⚪
  rare: 25,        // 🔵
  epic: 50,        // 🟣
  legendary: 80    // 🟡
};

/**
 * Calcule les XP gagnés par les équipements équipés
 * @param {Object} equipped - Objets équipés (head, body, hands, feet)
 * @returns {number} Total XP par heure
 */
function calculateEquipmentXP(equipped) {
  if (!equipped) return 0;

  let totalXP = 0;
  const slots = ['head', 'body', 'hands', 'feet'];

  slots.forEach(slot => {
    const item = equipped[slot];
    if (item && item.name && item.rarity) {
      const xpPerHour = RARITY_XP_RATES[item.rarity] || 0;
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
      console.log('📦 Aucun utilisateur avec équipements pour les XP passifs');
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
        const equipmentXP = calculateEquipmentXP(user.equipped);

        if (equipmentXP > 0) {
          user.xp += equipmentXP;
          user.lastEquipmentXpTime = new Date();
          await user.save();
          updatedCount++;
        }
      } catch (userError) {
        console.error(`Erreur XP passif pour ${user.username}:`, userError.message);
      }
    }

    console.log(`📦 XP passifs appliqués à ${updatedCount} utilisateurs`);
  } catch (error) {
    console.error('Erreur appliquant XP passifs des équipements:', error.message);
  }
}

/**
 * Obtient le détail des XP gagnés par les équipements
 */
function getEquipmentXPDetails(equipped) {
  if (!equipped) return { items: [], totalXP: 0 };

  const items = [];
  const slots = ['head', 'body', 'hands', 'feet'];
  let totalXP = 0;

  slots.forEach(slot => {
    const item = equipped[slot];
    if (item && item.name && item.rarity) {
      const xpPerHour = RARITY_XP_RATES[item.rarity] || 0;
      items.push({
        slot,
        name: item.name,
        rarity: item.rarity,
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
  RARITY_XP_RATES
};
