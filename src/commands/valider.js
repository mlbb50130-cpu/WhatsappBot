const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'valider',
  description: 'Valider une quête complétée',
  category: 'QUÊTES',
  usage: '!valider',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Check if daily quests need reset
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }

      const dailyQuests = QuestSystem.getDailyQuests();
      
      // Vérifier les quêtes complétées
      const completedQuests = [];
      
      if (user.dailyQuests && user.dailyQuests.completed) {
        for (const questId of user.dailyQuests.completed) {
          const quest = dailyQuests.find(q => q.id === questId);
          if (quest && !user.dailyQuests.validated) {
            completedQuests.push({ quest, questId });
          }
        }
      }

      if (completedQuests.length === 0) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.warning('❌ Aucune quête complétée à valider.')
        });
        return;
      }

      let totalReward = 0;
      let validatedCount = 0;

      for (const { quest } of completedQuests) {
        totalReward += quest.reward;
        validatedCount++;
      }

      // Ajouter les récompenses
      user.xp += totalReward;
      
      // Marquer les quêtes comme validées
      if (!user.dailyQuests.validated) {
        user.dailyQuests.validated = [];
      }
      user.dailyQuests.validated = user.dailyQuests.completed;

      await user.save();

      const validationMsg = `
╔════════════════════════════════════════╗
║       ✅ QUÊTES VALIDÉES! ✅           ║
╚════════════════════════════════════════╝

🎯 Quêtes complétées: ${validatedCount}
💰 Récompenses totales: +${totalReward} XP

═════════════════════════════════════════
Bravo! Reviens demain pour de nouvelles quêtes! 🚀
`;

      await sock.sendMessage(senderJid, { text: validationMsg });

    } catch (error) {
      console.error('Error in valider command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la validation!' });
    }
  }
};
