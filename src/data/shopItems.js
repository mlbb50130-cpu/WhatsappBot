// Catalogue de la boutique d'equipement.
// Le passif XP/h est derive de la rarete (voir utils/equipmentPassiveXP.js RARITY_XP_RATES).

const { RARITY_XP_RATES } = require('../utils/equipmentPassiveXP');

const RARITY_LABEL = {
  common: '⚪ Commun',
  rare: '🔵 Rare',
  epic: '🟣 Epique',
  legendary: '🟡 Legendaire',
};

const RARITY_PRICE = {
  common: 1500,
  rare: 5000,
  epic: 12000,
  legendary: 25000,
};

const SLOTS = {
  head: { label: 'Tete', emoji: '👑' },
  body: { label: 'Corps', emoji: '🧥' },
  hands: { label: 'Mains', emoji: '🤚' },
  feet: { label: 'Pieds', emoji: '👞' },
};

// name + slot + rarity suffisent, prix et xp/h sont calcules a partir de la rarete.
const RAW_ITEMS = [
  // Tete
  { name: 'Bandeau Frontal', slot: 'head', rarity: 'common' },
  { name: 'Casque de Chunin', slot: 'head', rarity: 'rare' },
  { name: 'Couronne de Jonin', slot: 'head', rarity: 'epic' },
  { name: 'Diademe du Hokage', slot: 'head', rarity: 'legendary' },
  // Corps
  { name: 'Tunique d\'Entrainement', slot: 'body', rarity: 'common' },
  { name: 'Armure de Samourai', slot: 'body', rarity: 'rare' },
  { name: 'Manteau de l\'Akatsuki', slot: 'body', rarity: 'epic' },
  { name: 'Armure du Susanoo', slot: 'body', rarity: 'legendary' },
  // Mains
  { name: 'Gants de Cuir', slot: 'hands', rarity: 'common' },
  { name: 'Gantelets de Chakra', slot: 'hands', rarity: 'rare' },
  { name: 'Poings d\'Acier', slot: 'hands', rarity: 'epic' },
  { name: 'Gants du Dragon Divin', slot: 'hands', rarity: 'legendary' },
  // Pieds
  { name: 'Sandales Ninja', slot: 'feet', rarity: 'common' },
  { name: 'Bottes de Vitesse', slot: 'feet', rarity: 'rare' },
  { name: 'Bottes Volantes', slot: 'feet', rarity: 'epic' },
  { name: 'Bottes du Dieu Eclair', slot: 'feet', rarity: 'legendary' },
];

const SHOP_ITEMS = RAW_ITEMS.map((item, index) => ({
  id: index + 1,
  itemId: `shop_${index + 1}`,
  name: item.name,
  slot: item.slot,
  slotLabel: SLOTS[item.slot].label,
  emoji: SLOTS[item.slot].emoji,
  rarity: item.rarity,
  rarityLabel: RARITY_LABEL[item.rarity],
  price: RARITY_PRICE[item.rarity],
  xpPerHour: RARITY_XP_RATES[item.rarity] || 0,
}));

function getItemById(id) {
  const numId = parseInt(id, 10);
  if (!Number.isInteger(numId)) return null;
  return SHOP_ITEMS.find((item) => item.id === numId) || null;
}

function getItemsBySlot(slot) {
  return SHOP_ITEMS.filter((item) => item.slot === slot);
}

module.exports = {
  SHOP_ITEMS,
  SLOTS,
  RARITY_PRICE,
  getItemById,
  getItemsBySlot,
};
