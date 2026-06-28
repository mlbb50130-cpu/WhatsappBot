const MessageFormatter = require('../utils/messageFormatter');
const RandomUtils = require('../utils/random');
const { nextRarity, RARITY_EMOJI, itemXpPerHour } = require('../utils/equipmentPassiveXP');

const REQUIRED = 3;

module.exports = {
  name: 'fusion',
  aliases: ['merge', 'fusionner'],
  description: 'Fusionner 3 equipements identiques en un de rarete superieure',
  category: 'INVENTAIRE',
  usage: '!fusion <index>',
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
    const ref = user.inventory[index];
    if (!ref) {
      await send({ text: MessageFormatter.error(`Objet introuvable a l'index ${args[0]}. Verifie avec \`!inventaire\`.`) });
      return;
    }

    const target = nextRarity(ref.rarity);
    if (!target) {
      await send({ text: MessageFormatter.warning(`*${ref.name}* est deja exotique. Utilise \`!ameliorer\` pour le renforcer.`) });
      return;
    }

    // Indices des items identiques (meme nom + meme rarete)
    const matches = [];
    user.inventory.forEach((it, i) => {
      if (it.name === ref.name && it.rarity === ref.rarity) matches.push(i);
    });

    if (matches.length < REQUIRED) {
      await send({
        text: MessageFormatter.warning(
          `Il faut ${REQUIRED}x *${ref.name}* (${ref.rarity}) pour fusionner. Tu en as ${matches.length}.`
        ),
      });
      return;
    }

    // Retirer 3 exemplaires (du plus grand index au plus petit)
    const toRemove = matches.slice(0, REQUIRED).sort((a, b) => b - a);
    const slot = ref.slot;
    toRemove.forEach((i) => user.inventory.splice(i, 1));

    const isExotic = target === 'exotic';
    const newItem = {
      itemId: RandomUtils.generateId ? RandomUtils.generateId() : `fusion_${Date.now()}`,
      name: ref.name,
      quantity: 1,
      rarity: target,
      slot,
      exoticLevel: isExotic ? 1 : 0,
    };
    user.inventory.push(newItem);
    await user.save();

    const newIndex = user.inventory.length - 1;
    const xp = itemXpPerHour(target, newItem.exoticLevel);

    const content = MessageFormatter.elegantBox('🔮 FUSION REUSSIE', [
      { label: 'Consomme', value: `3x ${RARITY_EMOJI[ref.rarity] || ''} ${ref.name} (${ref.rarity})` },
      { label: 'Obtenu', value: `${RARITY_EMOJI[target] || ''} ${newItem.name} (${target})${isExotic ? ' Niv.1' : ''}` },
      { label: '⚡ Passif', value: `+${xp} XP/h une fois equipe` },
      { label: slot ? '⚔️ Equiper' : 'ℹ️', value: slot ? `!equip ${newIndex}` : 'objet non equipable' },
      ...(isExotic ? [{ label: '✨ Astuce', value: `!ameliorer ${newIndex} pour le renforcer` }] : []),
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
