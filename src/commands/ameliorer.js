const MessageFormatter = require('../utils/messageFormatter');
const { EXOTIC_MAX_LEVEL, exoticXpPerHour } = require('../utils/equipmentPassiveXP');

const COST_PER_LEVEL = 4000; // cout = COST_PER_LEVEL * niveau actuel

module.exports = {
  name: 'ameliorer',
  aliases: ['upgrade', 'ameliore'],
  description: 'Ameliorer un equipement exotique (augmente son XP/h)',
  category: 'INVENTAIRE',
  usage: '!ameliorer <index>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

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
      await send({ text: MessageFormatter.error(`Objet introuvable a l'index ${args[0]}.`) });
      return;
    }

    if (item.rarity !== 'exotic') {
      await send({ text: MessageFormatter.warning('Seuls les equipements exotiques peuvent etre ameliores. Fusionne 3 legendaires identiques avec `!fusion`.') });
      return;
    }

    const level = item.exoticLevel || 1;
    if (level >= EXOTIC_MAX_LEVEL) {
      await send({ text: MessageFormatter.info(`*${item.name}* est deja au niveau maximum (${EXOTIC_MAX_LEVEL}) — ${exoticXpPerHour(level)} XP/h.`) });
      return;
    }

    const cost = COST_PER_LEVEL * level;
    if ((user.gold || 0) < cost) {
      await send({ text: MessageFormatter.error(`Gold insuffisant. Cout: ${cost} (niveau ${level} -> ${level + 1}). Tu as ${user.gold || 0}.`) });
      return;
    }

    const newLevel = level + 1;
    user.gold -= cost;
    item.exoticLevel = newLevel;

    // Synchroniser l'exemplaire equipe si c'est le meme exotique
    if (user.equipped) {
      ['head', 'body', 'hands', 'feet'].forEach((slot) => {
        const eq = user.equipped[slot];
        if (eq && eq.name === item.name && eq.rarity === 'exotic') {
          eq.exoticLevel = newLevel;
        }
      });
      user.markModified('equipped');
    }
    user.markModified('inventory');
    await user.save();

    const oldXp = exoticXpPerHour(level);
    const newXp = exoticXpPerHour(newLevel);

    const content = MessageFormatter.elegantBox('✨ AMELIORATION', [
      { label: '🌈 Objet', value: `${item.name} (exotique)` },
      { label: '⬆️ Niveau', value: `${level} -> ${newLevel}/${EXOTIC_MAX_LEVEL}` },
      { label: '⚡ Passif', value: `${oldXp} -> ${newXp} XP/h` },
      { label: '💰 Paye', value: `-${cost} gold` },
      { label: '👛 Solde', value: `${user.gold} gold` },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
