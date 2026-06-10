const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'quotidien',
  description: 'Mission quotidienne - 50 XP bonus',
  category: 'QUÊTES',
  usage: '!quotidien',
  adminOnly: false,
  groupOnly: true,
  cooldown: 86400, // 24 heures

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      const today = new Date().toDateString();
      const lastDaily = user.lastDailyQuest ? new Date(user.lastDailyQuest).toDateString() : null;

      if (lastDaily === today) {
        if (reply) {
        await reply({ text: '❌ Tu as déjà complété ta mission quotidienne!\n⏳ Reviens demain pour une autre!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Tu as déjà complété ta mission quotidienne!\n⏳ Reviens demain pour une autre!' });
      }
        return;
      }

      user.xp += 50;
      user.lastDailyQuest = new Date();
      await user.save();

      const dailyMessage = `
╔════════════════════════════════════╗
║      ✅ 𝔐𝔌𝔖𝔖𝔌𝔒𝔑 𝔔𝔘𝔒𝔗𝔌𝔇𝔌𝔈𝔑𝔑𝔈 ✅     ║
╚════════════════════════════════════╝

🎯 *Connecte-toi chaque jour pour gagner du XP!*

✨ *+50 XP* gagné!

📊 *Ton XP:* ${user.xp}
📈 *Ton niveau:* ${user.level}

💡 Reviens demain pour une autre récompense!

═════════════════════════════════════`;

      if (reply) {
        await reply({ text: dailyMessage });
      } else {
        await sock.sendMessage(senderJid, { text: dailyMessage });
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
