module.exports = {
  name: 'inventaire',
  description: 'Voir ton inventaire',
  category: 'LOOT',
  usage: '!inventaire',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!user || !user.inventory || user.inventory.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '📦 Ton inventaire est vide. Utilise `!loot` pour obtenir des objets!'
        });
        return;
      }

      // Group items by name
      const itemsMap = new Map();
      for (const item of user.inventory) {
        if (itemsMap.has(item.name)) {
          const existing = itemsMap.get(item.name);
          existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else {
          itemsMap.set(item.name, { ...item, quantity: item.quantity || 1 });
        }
      }

      let inventory = '╔════════════════════════════════════════╗\n║         📦 INVENTAIRE 📦        ║\n╚════════════════════════════════════════╝\n\n';

      const rarityColors = {
        common: '⚪',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡'
      };

      let index = 1;
      for (const [name, item] of itemsMap) {
        const rarity = item.rarity || 'common';
        inventory += `${index}. ${rarityColors[rarity] || '⚪'} **${name}**\n`;
        inventory += `   ├─ Quantité: ${item.quantity}\n`;
        inventory += `   ├─ Rareté: ${rarity.toUpperCase()}\n`;
        inventory += `   └─ ID: ${(item.itemId || 'N/A').substring(0, 8)}\n\n`;
        index++;
      }

      inventory += `════════════════════════════════════════\n`;
      inventory += `📊 Total: ${user.inventory.length} objets\n`;
      inventory += `💾 Emplacements: ${user.inventory.length}/50\n`;
      inventory += `════════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: inventory });
    } catch (error) {
      console.error('Error getting inventory:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de l\'affichage de ton inventaire. Réessaie!'
      });
    }
  }
};
