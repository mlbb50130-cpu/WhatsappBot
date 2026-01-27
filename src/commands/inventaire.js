const MessageFormatter = require('../utils/messageFormatter');
const equipmentPassiveXP = require('../utils/equipmentPassiveXP');

module.exports = {
  name: 'inventaire',
  description: 'Voir ton inventaire',
  category: 'LOOT',
  usage: '!inventaire',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    if (user.inventory.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Inventaire vide. Utilise !loot'
      });
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
      'legendary': '🟡'
    };

    user.inventory.forEach((item, index) => {
      const emoji = rarityEmoji[item.rarity] || '⚪';
      const rarityText = item.rarity || 'common';
      inventoryText += `\n${index}. ${emoji} ${item.name}`;
      if (item.quantity > 1) {
        inventoryText += ` x${item.quantity}`;
      }
      inventoryText += ` (${rarityText})`;
    });

    inventoryText += `\n═════════════════════════════════════`;

    // Ajouter le passif XP des équipements
    const equipmentXPDetails = equipmentPassiveXP.getEquipmentXPDetails(user.equipped);
    if (equipmentXPDetails && equipmentXPDetails.totalXP > 0) {
      inventoryText += `\n\n📦 PASSIF XP:`;
      equipmentXPDetails.items.forEach(item => {
        const rarityEmojis = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
        inventoryText += `\n  ${rarityEmojis[item.rarity]} ${item.name}: +${item.xpPerHour}/h`;
      });
      inventoryText += `\n  ⚡ Total: +${equipmentXPDetails.totalXP} XP/h`;
    }

    inventoryText += `\n═════════════════════════════════════`;

    await sock.sendMessage(senderJid, { text: inventoryText });
  }
};
