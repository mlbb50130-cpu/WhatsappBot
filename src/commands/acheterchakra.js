const MessageFormatter = require('../utils/messageFormatter');
const Combat = require('../utils/combat');

// Prix d'un point de chakra (en gold).
const PRICE_PER_POINT = 30;

module.exports = {
  name: 'acheterchakra',
  aliases: ['rechargechakra', 'buychakra', 'chakraplus'],
  description: 'Acheter du chakra avec ton gold (recharge)',
  category: 'GOLD',
  usage: '!acheterchakra [montant]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    Combat.refreshChakra(user);
    const max = Combat.getMaxChakra(user);
    const current = user.chakra || 0;
    const missing = max - current;

    if (missing <= 0) {
      await send({ text: MessageFormatter.info(`Ton chakra est deja au maximum (${current}/${max}).`) });
      return;
    }

    // Montant a acheter: par defaut, recharge complete; sinon le montant demande (plafonne).
    let amount = missing;
    if (args[0]) {
      const parsed = parseInt(args[0], 10);
      if (isNaN(parsed) || parsed <= 0) {
        await send({ text: MessageFormatter.error('Montant invalide. Ex: `!acheterchakra 50`') });
        return;
      }
      amount = Math.min(parsed, missing);
    }

    const cost = amount * PRICE_PER_POINT;
    if ((user.gold || 0) < cost) {
      await send({
        text: MessageFormatter.error(
          `Gold insuffisant.\n💰 Cout: ${cost} (${amount} chakra x ${PRICE_PER_POINT}) • Tu as: ${user.gold || 0}\n💼 Utilise \`!work\` pour gagner du gold.`
        ),
      });
      return;
    }

    user.gold -= cost;
    user.chakra = current + amount;
    await user.save();

    const content = MessageFormatter.elegantBox('🔵 RECHARGE CHAKRA', [
      { label: '⚡ Chakra', value: `+${amount} (${user.chakra}/${max})` },
      { label: '💰 Paye', value: `-${cost} gold` },
      { label: '👛 Solde', value: `${user.gold} gold` },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
