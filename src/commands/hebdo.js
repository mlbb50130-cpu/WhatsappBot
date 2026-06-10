const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'hebdo',
  description: 'Mission hebdomadaire - 200 XP bonus',
  category: 'QUÊTES',
  usage: '!hebdo',
  adminOnly: false,
  groupOnly: true,
  cooldown: 604800, // 7 jours

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekly = user.lastWeeklyQuest ? new Date(user.lastWeeklyQuest) : null;

      if (lastWeekly && lastWeekly >= weekStart) {
        if (reply) {
        await reply({ text: '❌ Tu as déjà complété ta mission hebdomadaire!\n⏳ Reviens la semaine prochaine!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Tu as déjà complété ta mission hebdomadaire!\n⏳ Reviens la semaine prochaine!' });
      }
        return;
      }

      user.xp += 200;
      user.lastWeeklyQuest = new Date();
      await user.save();

      const weeklyMessage = `
╔════════════════════════════════════╗
║     ✅ 𝔐𝔌𝔖𝔖𝔌𝔒𝔑 𝔋𝔈𝔅𝔇𝔒𝔐𝔄𝔇𝔄𝔌𝔕𝔈 ✅    ║
╚════════════════════════════════════╝

🎯 *Complète tes défis de la semaine!*

✨ *+200 XP* gagné!

📊 *Ton XP:* ${user.xp}
📈 *Ton niveau:* ${user.level}

💎 Les missions hebdomadaires rapportent plus d'XP!

═════════════════════════════════════`;

      if (reply) {
        await reply({ text: weeklyMessage });
      } else {
        await sock.sendMessage(senderJid, { text: weeklyMessage });
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
