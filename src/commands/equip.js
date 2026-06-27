const MessageFormatter = require('../utils/messageFormatter');
const equipmentPassiveXP = require('../utils/equipmentPassiveXP');
const { getItemById } = require('../data/shopItems');

const VALID_SLOTS = ['head', 'body', 'hands', 'feet'];
const SLOT_LABEL = { head: 'tete', body: 'corps', hands: 'mains', feet: 'pieds' };

// Determine le slot d'un objet d'inventaire (champ slot, sinon catalogue boutique).
function resolveItemSlot(item) {
  if (item.slot && VALID_SLOTS.includes(item.slot)) return item.slot;
  if (typeof item.itemId === 'string' && item.itemId.startsWith('shop_')) {
    const shopItem = getItemById(item.itemId.slice(5));
    if (shopItem) return shopItem.slot;
  }
  return null;
}

module.exports = {
  name: 'equip',
  description: 'Equiper un objet de ton inventaire (chaque objet a un slot)',
  category: 'INVENTAIRE',
  usage: '!equip <id> [slot]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      if (args.length < 1) {
        await send({ text: MessageFormatter.error('Utilisation: `!equip <id> [slot]`\n\nL\'id est l\'index dans `!inventaire`.\nLe slot est deduit automatiquement; tu peux le forcer: head/body/hands/feet.\nExemple: `!equip 3`') });
        return;
      }

      const itemIndex = parseInt(args[0], 10);
      const item = Array.isArray(user.inventory) ? user.inventory[itemIndex] : null;
      if (!item) {
        await send({ text: MessageFormatter.error(`Objet introuvable a l'index ${args[0]}. Verifie avec \`!inventaire\`.`) });
        return;
      }

      const itemSlot = resolveItemSlot(item);
      const requestedSlot = args[1] ? args[1].toLowerCase() : null;

      if (requestedSlot && !VALID_SLOTS.includes(requestedSlot)) {
        await send({ text: MessageFormatter.error(`Slot invalide. Slots: ${VALID_SLOTS.join(', ')}.`) });
        return;
      }

      // Verrouillage: un objet ne va que dans son slot.
      if (itemSlot && requestedSlot && requestedSlot !== itemSlot) {
        await send({ text: MessageFormatter.error(`*${item.name}* se porte sur *${SLOT_LABEL[itemSlot]}* (${itemSlot}), pas sur *${SLOT_LABEL[requestedSlot]}*.`) });
        return;
      }

      const slot = itemSlot || requestedSlot;
      if (!slot) {
        await send({ text: MessageFormatter.error(`Impossible de deduire le slot de *${item.name}*. Precise-le: \`!equip ${itemIndex} <head|body|hands|feet>\`.`) });
        return;
      }

      if (!user.equipped) {
        user.equipped = { head: null, body: null, hands: null, feet: null };
      }

      const previousItem = user.equipped[slot];
      user.equipped[slot] = {
        itemId: item.itemId,
        name: item.name,
        rarity: item.rarity,
      };
      user.markModified('equipped');
      await user.save();

      let text = `✅ *${item.name}* equipe sur *${SLOT_LABEL[slot]}* (${slot})!`;
      if (previousItem && previousItem.name) {
        text += `\n⚠️ *${previousItem.name}* a ete retire.`;
      }

      const details = equipmentPassiveXP.getEquipmentXPDetails(user.equipped, user.inventory);
      if (details && details.totalXP > 0) {
        const emojis = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
        text += `\n\n📦 *Passif XP equipement:*`;
        details.items.forEach((eq) => {
          text += `\n  ${emojis[eq.rarity] || '⚪'} ${eq.name}: +${eq.xpPerHour}/h`;
        });
        text += `\n  ⚡ *Total: +${details.totalXP} XP/h* (max ${equipmentPassiveXP.MAX_PASSIVE_XP})`;
      }

      await send({ text });
    } catch (error) {
      await send({ text: MessageFormatter.error('Erreur lors de l\'equipement.') });
    }
  },
};
