module.exports = {
  name: 'equip',
  description: 'Équiper un objet de ton inventaire',
  category: 'INVENTAIRE',
  usage: '!equip <id> <slot>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (args.length < 2) {
        await sock.sendMessage(senderJid, {
          text: '❌ Utilisation: `!equip <id> <slot>`\n\n*Slots disponibles:*\n• head (tête)\n• body (corps)\n• hands (mains)\n• feet (pieds)\n\nExemple: `!equip 3 head`'
        });
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
        name: item.name
      };

      await user.save();

      let message_text = `✅ *${item.name}* équipé au slot *${slot}*!`;
      if (previousItem && previousItem.name) {
        message_text += `\n\n⚠️ *${previousItem.name}* a été retiré.`;
      }

      await sock.sendMessage(senderJid, { text: message_text });
    } catch (error) {
      console.error('Error in equip command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de l\'équipement!' });
    }
  }
};
