const MessageFormatter = require('../utils/messageFormatter');
const { RARITY_EMOJI } = require('../utils/equipmentPassiveXP');

// Prix de revente par rarete (volontairement < prix boutique pour eviter les boucles).
const SELL_PRICE = { common: 300, rare: 1000, epic: 2500, legendary: 6000 };

function sellPrice(item) {
  if (item.rarity === 'exotic') return 12000 + (item.exoticLevel || 1) * 1500;
  return SELL_PRICE[item.rarity] || 100;
}

module.exports = {
  name: 'vendre',
  aliases: ['sell'],
  description: 'Vendre un objet de l\'inventaire contre du gold',
  category: 'GOLD',
  usage: '!vendre <index>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    if (!Array.isArray(user.inventory) || user.inventory.length === 0) {
      await send({ text: MessageFormatter.warning('Inventaire vide.') });
      return;
    }

    const index = parseInt(args[0], 10);
    const item = user.inventory[index];
    if (!item) {
      await send({ text: MessageFormatter.error(`Objet introuvable a l'index ${args[0]}. Verifie avec \`!inventaire\`.`) });
      return;
    }

    const price = sellPrice(item);
    const sold = user.inventory.splice(index, 1)[0];
    user.gold = (user.gold || 0) + price;
    user.markModified('inventory');
    await user.save();

    const content = MessageFormatter.elegantBox('💸 VENTE', [
      { label: `${RARITY_EMOJI[sold.rarity] || '⚪'} Vendu`, value: `${sold.name} (${sold.rarity || 'common'})` },
      { label: '💰 Gagne', value: `+${price} gold` },
      { label: '👛 Solde', value: `${user.gold} gold` },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
