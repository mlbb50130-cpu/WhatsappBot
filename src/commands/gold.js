const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'gold',
  description: 'Voir ton solde de gold',
  category: 'GOLD',
  usage: '!gold',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      if (!user) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Utilisateur introuvable!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilisateur introuvable!') });
      }
        return;
      }

      const goldItems = [
        { label: '👛 Gold', value: `${user.gold ?? 0}` },
        { label: '💼 Gagner', value: '!work (toutes les heures)' },
        { label: '🛒 Dépenser', value: '!boutique pour acheter de l\'équipement' }
      ];

      const content = MessageFormatter.elegantBox('GOLD', goldItems);
      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(content));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de la récupération du gold!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération du gold!' });
      }
    }
  }
};
