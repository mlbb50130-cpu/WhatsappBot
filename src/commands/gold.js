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

      const now = Date.now();
      const lastReset = user.lastGoldReset ? new Date(user.lastGoldReset).getTime() : 0;
      const hoursPassed = (now - lastReset) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        user.gold = 5000;
        user.lastGoldReset = new Date();
        await user.save();
      }

      const hoursRemaining = Math.max(0, 24 - Math.floor(hoursPassed));
      const goldItems = [
        { label: '👛 Gold', value: `${user.gold ?? 0}` },
        { label: '🔁 Reset', value: hoursRemaining === 0 ? 'disponible' : `dans ${hoursRemaining}h` },
        { label: '🏦 Max', value: '5000 / 24h' }
      ];

      const content = MessageFormatter.elegantBox('GOLD', goldItems);
      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(content));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
      }
    } catch (error) {
      console.error('Error in gold command:', error.message);
      if (reply) {
        await reply({ text: '❌ Erreur lors de la récupération du gold!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération du gold!' });
      }
    }
  }
};
