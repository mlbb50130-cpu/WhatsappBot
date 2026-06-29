const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const QuestSystem = require('../utils/questSystem');
const Luck = require('../utils/luck');
const { SHOP_ITEMS } = require('../data/shopItems');
const { itemXpPerHour, RARITY_EMOJI } = require('../utils/equipmentPassiveXP');

// Poids de base par rarete (biaises ensuite par le buff de chance).
const RARITY_WEIGHT = { common: 50, rare: 30, epic: 15, legendary: 5 };
// XP gagne a l'ouverture selon la rarete obtenue.
const RARITY_LOOT_XP = { common: 20, rare: 50, epic: 100, legendary: 200 };
const INVENTORY_MAX = 50;

module.exports = {
  name: 'loot',
  description: 'Ouvrir un loot d\'equipement (reinitialisation: 10h)',
  category: 'LOOT',
  usage: '!loot',
  adminOnly: false,
  groupOnly: true,
  cooldown: 36000, // 10h

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    if (!Array.isArray(user.inventory)) user.inventory = [];
    if (user.inventory.length >= INVENTORY_MAX) {
      await send({ text: MessageFormatter.warning(`Inventaire plein (${INVENTORY_MAX}). Vends des items avec \`!vendre <index>\`.`) });
      return;
    }

    // Tirage de la rarete, pondere et BIAISE par le buff de chance (!chance)
    const rarityChoices = Object.keys(RARITY_WEIGHT).map((r) => ({
      value: r,
      weight: Math.max(0.1, RARITY_WEIGHT[r] * Luck.lootRarityMultiplier(r, user)),
    }));
    const rarity = RandomUtils.weighted(rarityChoices);

    // Choix d'un equipement REEL du catalogue (avec slot -> equipable/fusionnable)
    const pool = SHOP_ITEMS.filter((i) => i.rarity === rarity);
    const item = pool[Math.floor(Math.random() * pool.length)];

    user.inventory.push({
      itemId: item.itemId,
      name: item.name,
      rarity: item.rarity,
      slot: item.slot,
      quantity: 1,
      exoticLevel: 0,
    });

    const lootXp = RARITY_LOOT_XP[rarity] || 20;
    user.xp += lootXp;

    if (QuestSystem.needsWeeklyReset(user)) QuestSystem.resetWeeklyQuests(user);
    QuestSystem.updateWeeklyProgress(user, 'loots', 1);

    await user.save();

    const index = user.inventory.length - 1;
    const buffNote = Luck.isBuffActive(user) ? `🍀 Buff actif (${Luck.getActiveLuck(user)}%)` : 'Active !chance pour booster';

    const content = MessageFormatter.elegantBox('🎁 𝔏𝔒𝔒𝔗 𝔒𝔅𝔗𝔈𝔑𝔘 🎁', [
      { label: `${RARITY_EMOJI[rarity] || '⚪'} Objet`, value: `${item.name}` },
      { label: '🏷️ Rarete', value: rarity.toUpperCase() },
      { label: '⚡ Passif', value: `+${itemXpPerHour(rarity, 0)} XP/h une fois equipe` },
      { label: '✨ XP', value: `+${lootXp}` },
      { label: '⚔️ Equiper', value: `!equip ${index}` },
      { label: '🍀 Chance', value: buffNote },
      { label: '📦 Inventaire', value: `${user.inventory.length}/${INVENTORY_MAX}` },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
