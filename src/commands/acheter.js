const MessageFormatter = require('../utils/messageFormatter');
const { getItemById } = require('../data/shopItems');

const INVENTORY_MAX = 50;

module.exports = {
  name: 'acheter',
  aliases: ['buy'],
  description: 'Acheter un equipement de la boutique',
  category: 'INVENTAIRE',
  usage: '!acheter <id>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    const item = getItemById(args[0]);
    if (!item) {
      await send({ text: MessageFormatter.error('Article introuvable. Utilise `!boutique` pour voir les id disponibles.') });
      return;
    }

    if (!Array.isArray(user.inventory)) user.inventory = [];
    if (user.inventory.length >= INVENTORY_MAX) {
      await send({ text: MessageFormatter.warning(`Inventaire plein (${INVENTORY_MAX}). Libere de la place avant d'acheter.`) });
      return;
    }

    const gold = user.gold || 0;
    if (gold < item.price) {
      await send({ text: MessageFormatter.error(`Gold insuffisant.\n💰 Tu as: ${gold} • Prix: ${item.price}\n💼 Utilise \`!work\` pour en gagner.`) });
      return;
    }

    // Transaction
    user.gold = gold - item.price;
    user.inventory.push({
      itemId: item.itemId,
      name: item.name,
      quantity: 1,
      rarity: item.rarity,
    });
    await user.save();

    const index = user.inventory.length - 1;
    const content = MessageFormatter.elegantBox('🛍️ ACHAT REUSSI', [
      { label: `${item.emoji} Objet`, value: `${item.name} (${item.rarityLabel})` },
      { label: '💰 Paye', value: `-${item.price} gold` },
      { label: '👛 Solde', value: `${user.gold} gold` },
      { label: '⚡ Passif', value: `+${item.xpPerHour} XP/h une fois equipe` },
      { label: '⚔️ Equiper', value: `!equip ${index} ${item.slot}` },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
