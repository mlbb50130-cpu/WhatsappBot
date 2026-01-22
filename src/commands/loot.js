const RandomUtils = require('../utils/random');

module.exports = {
  name: 'loot',
  description: 'Ouvrir un loot aléatoire (24h cooldown)',
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

    try {
      // Check 24h cooldown per user
      const now = Date.now();
      const lastLootTime = user.lastLootTime ? new Date(user.lastLootTime).getTime() : 0;
      const timeSinceLastLoot = now - lastLootTime;
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 heures

      // Si lastLootTime existe ET que moins de 24h ont passé
      if (lastLootTime > 0 && timeSinceLastLoot < oneDayInMs) {
        const remainingMs = oneDayInMs - timeSinceLastLoot;
        const hours = Math.floor(remainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        
        await sock.sendMessage(senderJid, {
          text: `⏰ Tu dois attendre ${hours}h ${minutes}m avant de faire un nouveau loot!\nReviens bientôt! 😴`
        });
        return;
      }

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

      // Add XP (scaled by rarity)
      const rarityMultiplier = {
        common: 1,
        rare: 1.5,
        epic: 2.5,
        legendary: 4
      };
      const totalXp = Math.floor(loot.xp * (rarityMultiplier[loot.rarity] || 1));
      user.xp += totalXp;
      user.lastLootTime = new Date();
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
  ├─ ✨ XP: +${totalXp}
  └─ 📦 Objet ajouté à l'inventaire

*PROCHAIN LOOT:* Dans 24h

════════════════════════════════════════
Inventaire: ${user.inventory.length}/50
════════════════════════════════════════
`;

      await sock.sendMessage(senderJid, { text: result });
    } catch (error) {
      console.error('Erreur loot:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de l\'ouverture du loot!' });
    }
  }
};
