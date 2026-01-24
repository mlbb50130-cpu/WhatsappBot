const QuestSystem = require('../utils/questSystem');

module.exports = {
  name: 'quetelundi',
  description: 'Voir tes quêtes hebdomadaires',
  category: 'QUÊTES',
  usage: '!quetelundi',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Reset si nécessaire
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
        await user.save();
      }

      const weeklyQuests = QuestSystem.getWeeklyQuests();
      const progress = user.weeklyQuests?.progress || {};
      const completed = user.weeklyQuests?.completed || [];

      let questMessage = `
╔════════════════════════════════════════╗
║    📅 QUÊTES HEBDOMADAIRES 📅         ║
╚════════════════════════════════════════╝

`;

      weeklyQuests.forEach((quest) => {
        const current = progress[quest.stat] || 0;
        const isCompleted = completed.includes(quest.id);
        const percentage = Math.min(100, Math.floor((current / quest.goal) * 100));
        const barLength = 15;
        const filledLength = Math.floor((percentage / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        const status = isCompleted ? '✅ COMPLÉTÉE' : `${percentage}%`;
        
        questMessage += `${quest.emoji} *${quest.name}* ${isCompleted ? '✅' : ''}
   ${progressBar} ${status}
   Progress: ${current}/${quest.goal}
   📝 ${quest.description}
   💰 Récompense: +${quest.reward} XP

`;
      });

      const totalReward = QuestSystem.getWeeklyReward(user);
      questMessage += `═════════════════════════════════════════
💡 Récompense totale: +${totalReward} XP
⏰ Reset tous les lundi (heure serveur)`;

      await sock.sendMessage(senderJid, { text: questMessage });
    } catch (error) {
      console.error('Error in quetelundi command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
