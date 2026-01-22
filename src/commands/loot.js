const RandomUtils = require('../utils/random');

module.exports = {
  name: 'loot',
  description: 'Ouvrir un loot aléatoire',
  category: 'LOOT',
  usage: '!loot',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  lootTable: [
    { name: 'Kunai Ninja', rarity: 'common', emoji: '🔪', weight: 40, xp: 10 },
    { name: 'Shuriken Doré', rarity: 'rare', emoji: '⭐', weight: 25, xp: 25 },
    { name: 'Sabre Katana', rarity: 'epic', emoji: '⚔️', weight: 20, xp: 50 },
    { name: 'Grimoire Ancien', rarity: 'epic', emoji: '📖', weight: 10, xp: 40 },
    { name: 'Relique Légendaire', rarity: 'legendary', emoji: '👑', weight: 5, xp: 100 },
    { name: 'Perle Magique', rarity: 'rare', emoji: '💎', weight: 20, xp: 30 },
    { name: 'Cape de l\'Ombre', rarity: 'epic', emoji: '🌑', weight: 15, xp: 45 },
    { name: 'Anneau du Pouvoir', rarity: 'legendary', emoji: '💍', weight: 5, xp: 80 }
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Weighted random selection
    const items = this.lootTable.map(item => ({
      value: item,
      weight: item.weight
    }));

    const loot = RandomUtils.weighted(items);

    // Add to inventory
    user.inventory.push({
      itemId: RandomUtils.generateId(),
      name: loot.name,
      rarity: loot.rarity,
      quantity: 1
    });

    // Add XP
    user.xp += loot.xp;
    await user.save();

    const rarityColors = {
      common: '⚪',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };

    const result = `
╔════════════════════════════════════════╗
║           🎁 LOOT OBTENU 🎁           ║
╚════════════════════════════════════════╝

${loot.emoji} *${loot.name}*
${rarityColors[loot.rarity]} Rareté: ${loot.rarity.toUpperCase()}

*RÉCOMPENSES:*
  ├─ ✨ XP: +${loot.xp}
  └─ 📦 Objet ajouté à l'inventaire

════════════════════════════════════════
Inventaire: ${user.inventory.length}/50
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: result });
  }
};
