const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const QuestSystem = require('../utils/questSystem');
const Luck = require('../utils/luck');

module.exports = {
  name: 'loot',
  description: 'Ouvrir un loot aléatoire (réinitialisation: 10h)',
  category: 'LOOT',
  usage: '!loot',
  adminOnly: false,
  groupOnly: true,
  cooldown: 36000, // 10h

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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    // Weighted random selection, biaisee par la chance du jour:
    // chance haute -> objets rares plus probables, communs moins probables.
    const items = this.lootTable.map(item => ({
      value: item,
      weight: Math.max(0.1, item.weight * Luck.lootRarityMultiplier(item.rarity, user))
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

    // Weekly quest progress (loots)
    if (QuestSystem.needsWeeklyReset(user)) {
      QuestSystem.resetWeeklyQuests(user);
    }
    QuestSystem.updateWeeklyProgress(user, 'loots', 1);

    await user.save();

    const rarityEmojis = {
      common: '⚪',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };

    const content = MessageFormatter.elegantBox('🎁 𝔏𝔒𝔒𝔗 𝔒𝔅𝔗𝔈𝔑𝔘 🎁', [
      { label: `${loot.emoji} Objet`, value: loot.name },
      { label: `${rarityEmojis[loot.rarity]} Rareté`, value: loot.rarity.toUpperCase() },
      { label: '✨ XP Gagné', value: `+${loot.xp}` },
      { label: '📦 Inventaire', value: `${user.inventory.length}/50` }
    ]);

    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(content));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
      }
  }
};
