const MessageFormatter = require('../utils/messageFormatter');
const { SHOP_ITEMS, SLOTS, getItemsBySlot } = require('../data/shopItems');

module.exports = {
  name: 'boutique',
  aliases: ['shop', 'store'],
  description: 'Acheter de l\'equipement avec ton gold (passif XP/h)',
  category: 'INVENTAIRE',
  usage: '!boutique [slot]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    // Filtre optionnel par slot
    const slotArg = (args[0] || '').toLowerCase();
    const slots = SLOTS[slotArg] ? [slotArg] : Object.keys(SLOTS);

    let text = `╔════════════════════════════════════╗
║            🛒 BOUTIQUE 🛒
╚════════════════════════════════════╝
👛 Ton gold: ${user.gold || 0}

L'equipement equipe rapporte un passif XP/h.
`;

    slots.forEach((slot) => {
      const info = SLOTS[slot];
      text += `\n${info.emoji} *${info.slotLabel.toUpperCase()}* (slot: ${slot})\n`;
      getItemsBySlot(slot).forEach((item) => {
        text += `  #${item.id} ${item.rarityLabel} — ${item.name}\n     💰 ${item.price} gold • ⚡ +${item.xpPerHour} XP/h\n`;
      });
    });

    text += `\n═════════════════════════════════════
🛍️ Acheter: \`!acheter <id>\`  (ex: \`!acheter 4\`)
🎯 Filtrer: \`!boutique <slot>\` (head/body/hands/feet)
⚔️ Equiper ensuite: \`!equip <index_inventaire> <slot>\`
═════════════════════════════════════`;

    await send({ text });
  },
};
