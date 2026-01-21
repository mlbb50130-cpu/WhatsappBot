module.exports = {
  name: 'quotidien',
  description: 'Mission quotidienne - 50 XP bonus',
  category: 'QUÊTES',
  usage: '!quotidien',
  adminOnly: false,
  groupOnly: false,
  cooldown: 86400, // 24 heures

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const today = new Date().toDateString();
      const lastDaily = user.lastDailyQuest ? new Date(user.lastDailyQuest).toDateString() : null;

      if (lastDaily === today) {
        await sock.sendMessage(senderJid, {
          text: '❌ Tu as déjà complété ta mission quotidienne!\n⏳ Reviens demain pour une autre!'
        });
        return;
      }

      user.xp += 50;
      user.lastDailyQuest = new Date();
      await user.save();

      const dailyMessage = `
╔════════════════════════════════════╗
║      ✅ MISSION QUOTIDIENNE ✅     ║
╚════════════════════════════════════╝

🎯 *Connecte-toi chaque jour pour gagner du XP!*

✨ *+50 XP* gagné!

📊 *Ton XP:* ${user.xp}
📈 *Ton niveau:* ${user.level}

💡 Reviens demain pour une autre récompense!

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: dailyMessage });
    } catch (error) {
      console.error('Error in quotidien command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
