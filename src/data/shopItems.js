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
// Chaque objet appartient a UN seul slot (tete/corps/mains/pieds) et ne peut etre
// equipe que dans ce slot (verifie par !equip).
const RAW_ITEMS = [
  // === TETE ===
  { name: 'Bandeau Frontal', slot: 'head', rarity: 'common' },
  { name: 'Casque de Cuir', slot: 'head', rarity: 'common' },
  { name: 'Casque de Chunin', slot: 'head', rarity: 'rare' },
  { name: 'Masque Anbu', slot: 'head', rarity: 'rare' },
  { name: 'Couronne de Jonin', slot: 'head', rarity: 'epic' },
  { name: 'Heaume du Kage', slot: 'head', rarity: 'epic' },
  { name: 'Diademe du Hokage', slot: 'head', rarity: 'legendary' },
  { name: 'Couronne du Roi Demon', slot: 'head', rarity: 'legendary' },
  // === CORPS ===
  { name: 'Tunique d\'Entrainement', slot: 'body', rarity: 'common' },
  { name: 'Gilet de Genin', slot: 'body', rarity: 'common' },
  { name: 'Armure de Samourai', slot: 'body', rarity: 'rare' },
  { name: 'Veste Tactique', slot: 'body', rarity: 'rare' },
  { name: 'Manteau de l\'Akatsuki', slot: 'body', rarity: 'epic' },
  { name: 'Cuirasse de Mithril', slot: 'body', rarity: 'epic' },
  { name: 'Armure du Susanoo', slot: 'body', rarity: 'legendary' },
  { name: 'Manteau du Dieu Dragon', slot: 'body', rarity: 'legendary' },
  // === MAINS ===
  { name: 'Gants de Cuir', slot: 'hands', rarity: 'common' },
  { name: 'Mitaines d\'Entrainement', slot: 'hands', rarity: 'common' },
  { name: 'Gantelets de Chakra', slot: 'hands', rarity: 'rare' },
  { name: 'Bracelets de Force', slot: 'hands', rarity: 'rare' },
  { name: 'Poings d\'Acier', slot: 'hands', rarity: 'epic' },
  { name: 'Griffes d\'Ombre', slot: 'hands', rarity: 'epic' },
  { name: 'Gants du Dragon Divin', slot: 'hands', rarity: 'legendary' },
  { name: 'Poings du Titan', slot: 'hands', rarity: 'legendary' },
  // === PIEDS ===
  { name: 'Sandales Ninja', slot: 'feet', rarity: 'common' },
  { name: 'Chaussures de Course', slot: 'feet', rarity: 'common' },
  { name: 'Bottes de Vitesse', slot: 'feet', rarity: 'rare' },
  { name: 'Bottes Renforcees', slot: 'feet', rarity: 'rare' },
  { name: 'Bottes Volantes', slot: 'feet', rarity: 'epic' },
  { name: 'Jambieres du Tonnerre', slot: 'feet', rarity: 'epic' },
  { name: 'Bottes du Dieu Eclair', slot: 'feet', rarity: 'legendary' },
  { name: 'Bottes de l\'Eclair Jaune', slot: 'feet', rarity: 'legendary' },
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
