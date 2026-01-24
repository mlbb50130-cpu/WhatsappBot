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
        text: '📦 Ton inventaire est vide. Utilise `!loot` pour obtenir des objets!'
      });
      return;
    }

    let inventoryText = `
╔════════════════════════════════════╗
║        📦 TON INVENTAIRE 📦        ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
📊 *Objets:* ${user.inventory.length}/50

*Tes items:*\n`;

    const rarityEmoji = {
      'common': '⚪',
      'rare': '🔵',
      'epic': '🟣',
      'legendary': '🟡'
    };

    user.inventory.forEach((item, index) => {
      const emoji = rarityEmoji[item.rarity] || '⚪';
      const rarityText = item.rarity || 'common';
      inventoryText += `\n*${index}.* ${emoji} ${item.name}`;
      if (item.quantity > 1) {
        inventoryText += ` x${item.quantity}`;
      }
      inventoryText += `\n    └─ *Rareté:* ${rarityText}`;
    });

    inventoryText += `

═════════════════════════════════════

*Pour équiper un item:*
\`!equip <id> <slot>\`

*Slots disponibles:*
• head (tête)
• body (corps)
• hands (mains)
• feet (pieds)

*Voir ton équipement:*
\`!equipement\`

═════════════════════════════════════`;

    await sock.sendMessage(senderJid, { text: inventoryText });
  }
};
