module.exports = {
  name: 'hebdo',
  description: 'Mission hebdomadaire - 200 XP bonus',
  category: 'QUÊTES',
  usage: '!hebdo',
  adminOnly: false,
  groupOnly: true,
  cooldown: 604800, // 7 jours

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekly = user.lastWeeklyQuest ? new Date(user.lastWeeklyQuest) : null;

      if (lastWeekly && lastWeekly >= weekStart) {
        await sock.sendMessage(senderJid, {
          text: '❌ Tu as déjà complété ta mission hebdomadaire!\n⏳ Reviens la semaine prochaine!'
        });
        return;
      }

      user.xp += 200;
      user.lastWeeklyQuest = new Date();
      await user.save();

      const weeklyMessage = `
╔════════════════════════════════════╗
║     ✅ MISSION HEBDOMADAIRE ✅    ║
╚════════════════════════════════════╝

🎯 *Complète tes défis de la semaine!*

✨ *+200 XP* gagné!

📊 *Ton XP:* ${user.xp}
📈 *Ton niveau:* ${user.level}

💎 Les missions hebdomadaires rapportent plus d'XP!

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: weeklyMessage });
    } catch (error) {
      console.error('Error in hebdo command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
