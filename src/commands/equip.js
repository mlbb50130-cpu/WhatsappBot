const MessageFormatter = require('../utils/messageFormatter');
const equipmentPassiveXP = require('../utils/equipmentPassiveXP');

module.exports = {
  name: 'equip',
  description: 'Équiper un objet de ton inventaire',
  category: 'INVENTAIRE',
  usage: '!equip <id> <slot>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      if (args.length < 2) {
        if (reply) {
        await reply({ text: '❌ Utilisation: `!equip <id> <slot>`\n\n*Slots disponibles:*\n• head (tête)\n• body (corps)\n• hands (mains)\n• feet (pieds)\n\nExemple: `!equip 3 head`' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Utilisation: `!equip <id> <slot>`\n\n*Slots disponibles:*\n• head (tête)\n• body (corps)\n• hands (mains)\n• feet (pieds)\n\nExemple: `!equip 3 head`' });
      }
        return;
      }

      const itemId = parseInt(args[0]);
      const slot = args[1].toLowerCase();

      // Vérifier les slots valides
      const validSlots = ['head', 'body', 'hands', 'feet'];
      if (!validSlots.includes(slot)) {
        await sock.sendMessage(senderJid, {
          text: `❌ Slot invalide! Slots disponibles: ${validSlots.join(', ')}`
        });
        return;
      }

      // Vérifier si l'item existe dans l'inventaire
      const item = user.inventory[itemId];
      if (!item) {
        await sock.sendMessage(senderJid, {
          text: `❌ Item non trouvé à l'index ${itemId}!`
        });
        return;
      }

      // Initialiser equipped si n'existe pas
      if (!user.equipped) {
        user.equipped = { head: null, body: null, hands: null, feet: null };
      }

      // Équiper l'item
      const previousItem = user.equipped[slot];
      user.equipped[slot] = {
        itemId: item.itemId,
        name: item.name,
        rarity: item.rarity
      };

      await user.save();

      let message_text = `✅ *${item.name}* équipé au slot *${slot}*!`;
      if (previousItem && previousItem.name) {
        message_text += `\n\n⚠️ *${previousItem.name}* a été retiré.`;
      }

      // Afficher le passif XP mis à jour
      const equipmentXPDetails = equipmentPassiveXP.getEquipmentXPDetails(user.equipped, user.inventory);
      if (equipmentXPDetails && equipmentXPDetails.totalXP > 0) {
        message_text += `\n\n📦 *Passif XP Équipement:*`;
        equipmentXPDetails.items.forEach(eq => {
          const rarityEmojis = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
          message_text += `\n  ${rarityEmojis[eq.rarity]} ${eq.name}: +${eq.xpPerHour}/h`;
        });
        message_text += `\n  ⚡ *Total: +${equipmentXPDetails.totalXP} XP/heure*`;
      }

      if (reply) {
        await reply({ text: message_text });
      } else {
        await sock.sendMessage(senderJid, { text: message_text });
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de l\'équipement!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de l\'équipement!' });
      }
    }
  }
};
