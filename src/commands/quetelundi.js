const QuestSystem = require('../utils/questSystem');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'quetelundi',
  description: 'Voir tes quêtes hebdomadaires',
  category: 'QUÊTES',
  usage: '!quetelundi',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Reset si nécessaire
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
        await user.save();
      }
      if (QuestSystem.ensureWeeklyAssigned(user)) {
        await user.save();
      }

      const weeklyQuests = QuestSystem.getActiveWeeklyQuests(user);
      const progress = user.weeklyQuests?.progress || {};
      const completed = user.weeklyQuests?.completed || [];

      let questMessage = `
╔════════════════════════════════════════╗
║    📅 𝔔𝔘Ê𝔗𝔈𝔖 𝔋𝔈𝔅𝔇𝔒𝔐𝔄𝔇𝔄𝔌𝔕𝔈𝔖 📅         ║
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
   💰 Récompense: +${quest.reward} XP +${quest.gold || 0} gold

`;
      });

      const totalReward = QuestSystem.getWeeklyReward(user);
      questMessage += `═════════════════════════════════════════
💡 Récompense en attente (complétées): +${totalReward.xp} XP +${totalReward.gold} gold
✅ Réclame avec !valider
⏰ Reset hebdomadaire (7 jours)`;

      if (reply) {
        await reply({ text: questMessage });
      } else {
        await sock.sendMessage(senderJid, { text: questMessage });
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
