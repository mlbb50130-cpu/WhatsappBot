const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'daily',
  description: 'Bonus quotidien de gold (réinitialisation: 24h)',
  category: 'GOLD',
  usage: '!daily',
  adminOnly: false,
  groupOnly: true,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const now = new Date();

    // Check if user already claimed daily today
    if (user.lastDailyBonus) {
      const lastDaily = new Date(user.lastDailyBonus);
      const timeDiff = now - lastDaily;
      const hoursRemaining = 24 - Math.floor(timeDiff / (1000 * 60 * 60));

      if (hoursRemaining > 0) {
        const content = MessageFormatter.elegantBox('⏳ 𝔠𝔯𝔬𝔠𝔥𝔱 𝔤𝔞𝔰𝔦𝔠𝔞𝔱𝔞𝔦𝔯𝔦 ⏳', [
          { label: '⚠️ Bonus Déjà Réclamé', value: 'Oui' },
          { label: '⏰ Prochain Bonus', value: `dans ${hoursRemaining}h` },
          { label: '👛 Gold Total', value: `${user.gold}` }
        ]);

        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
        return;
      }
    }

    // Award daily bonus
    const dailyBonus = 750 + Math.floor(Math.random() * 250); // 750-1000 gold
    user.gold = Math.max(0, (user.gold || 0) + dailyBonus);
    user.lastDailyBonus = now;
    await user.save();

    const content = MessageFormatter.elegantBox('🎁 𝔅𝔬𝔯𝔲𝔰 ℭ𝔬𝔮𝔲𝔦𝔡𝔦𝔬𝔯𝔦 🎁', [
      { label: '⭐ Bonus Quotidien', value: `+${dailyBonus}` },
      { label: '👛 Gold Total', value: `${user.gold}` },
      { label: '📅 Prochain Bonus', value: 'demain à la même heure' },
      { label: '💡 Conseil', value: 'Combinez avec !work (1h)' }
    ]);

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
  }
};
