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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Check if daily quests need reset
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }

      const dailyQuests = QuestSystem.getDailyQuests();

      if (!user.dailyQuests.validated) {
        user.dailyQuests.validated = [];
      }

      // Quêtes complétées et pas encore validées
      const completedQuests = [];

      if (user.dailyQuests && user.dailyQuests.completed) {
        for (const questId of user.dailyQuests.completed) {
          const quest = dailyQuests.find(q => q.id === questId);
          if (quest && !user.dailyQuests.validated.includes(questId)) {
            completedQuests.push({ quest, questId });
          }
        }
      }

      if (completedQuests.length === 0) {
        if (reply) {
        await reply({ text: MessageFormatter.warning('❌ Aucune quête complétée à valider.') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.warning('❌ Aucune quête complétée à valider.') });
      }
        return;
      }

      let totalReward = 0;
      let validatedCount = 0;

      for (const { quest, questId } of completedQuests) {
        totalReward += quest.reward;
        validatedCount++;
        // Marquer uniquement cette quête comme validée
        user.dailyQuests.validated.push(questId);
      }

      // Ajouter les récompenses
      user.xp += totalReward;

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

      if (reply) {
        await reply({ text: validationMsg });
      } else {
        await sock.sendMessage(senderJid, { text: validationMsg });
      }

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de la validation!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la validation!' });
      }
    }
  }
};
