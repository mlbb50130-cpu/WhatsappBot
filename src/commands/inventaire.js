const MessageFormatter = require('../utils/messageFormatter');
const equipmentPassiveXP = require('../utils/equipmentPassiveXP');
const { getItemById } = require('../data/shopItems');

function itemSlot(item) {
  const valid = ['head', 'body', 'hands', 'feet'];
  if (item.slot && valid.includes(item.slot)) return item.slot;
  if (typeof item.itemId === 'string' && item.itemId.startsWith('shop_')) {
    const shopItem = getItemById(item.itemId.slice(5));
    if (shopItem) return shopItem.slot;
  }
  return null;
}

module.exports = {
  name: 'inventaire',
  description: 'Voir ton inventaire',
  category: 'LOOT',
  usage: '!inventaire',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    if (user.inventory.length === 0) {
      if (reply) {
        await reply({ text: '❌ Inventaire vide. Utilise !loot' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Inventaire vide. Utilise !loot' });
      }
      return;
    }

    let inventoryText = `╔════════════════════════════════════╗
║        INVENTAIRE
╚════════════════════════════════════╝
👤 ${user.username || 'Joueur'}
📊 Objets: ${user.inventory.length}/50

Tes items:`;

    const rarityEmoji = {
      'common': '⚪',
      'rare': '🔵',
      'epic': '🟣',
      'legendary': '🟡',
      'exotic': '🌈'
    };

    user.inventory.forEach((item, index) => {
      const emoji = rarityEmoji[item.rarity] || '⚪';
      const rarityText = item.rarity || 'common';
      inventoryText += `\n${index}. ${emoji} ${item.name}`;
      if (item.quantity > 1) {
        inventoryText += ` x${item.quantity}`;
      }
      inventoryText += ` (${rarityText}${item.rarity === 'exotic' ? ` Niv.${item.exoticLevel || 1}` : ''})`;
      const slot = itemSlot(item);
      if (slot) {
        inventoryText += ` • slot: ${slot} → \`!equip ${index}\``;
      }
    });

    inventoryText += `\n═════════════════════════════════════`;

    // Ajouter le passif XP des équipements
    const equipmentXPDetails = equipmentPassiveXP.getEquipmentXPDetails(user.equipped, user.inventory);
    if (equipmentXPDetails && equipmentXPDetails.totalXP > 0) {
      inventoryText += `\n\n📦 PASSIF XP:`;
      equipmentXPDetails.items.forEach(item => {
        const rarityEmojis = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
        inventoryText += `\n  ${rarityEmojis[item.rarity]} ${item.name}: +${item.xpPerHour}/h`;
      });
      inventoryText += `\n  ⚡ Total: +${equipmentXPDetails.totalXP} XP/h`;
    } else {
      inventoryText += `\n\n📦 PASSIF XP:\n  Aucun équipement actif`;
    }

    inventoryText += `\n═════════════════════════════════════`;

    if (reply) {
        await reply({ text: inventoryText });
      } else {
        await sock.sendMessage(senderJid, { text: inventoryText });
      }
  }
};
