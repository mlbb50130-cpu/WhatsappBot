const QuestSystem = require('../utils/questSystem');

module.exports = {
  name: 'quetejour',
  description: 'Voir tes quêtes journalières',
  category: 'QUÊTES',
  usage: '!quetejour',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Reset si nécessaire
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
        await user.save();
      }

      const dailyQuests = QuestSystem.getDailyQuests();
      const progress = user.dailyQuests?.progress || {};
      const completed = user.dailyQuests?.completed || [];

      let questMessage = `
╔════════════════════════════════════════╗
║     🌅 QUÊTES JOURNALIÈRES 🌅        ║
╚════════════════════════════════════════╝

`;

      dailyQuests.forEach((quest) => {
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

      const totalReward = QuestSystem.getDailyReward(user);
      questMessage += `═════════════════════════════════════════
💡 Récompense totale: +${totalReward} XP
⏰ Reset à minuit (heure serveur)`;

      await sock.sendMessage(senderJid, { text: questMessage });
    } catch (error) {
      console.error('Error in quetejour command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
