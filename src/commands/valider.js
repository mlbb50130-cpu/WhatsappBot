const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

// Collecte les quetes completees mais pas encore validees, et les marque validees.
function claim(questBucket, questDefs) {
  if (!questBucket) return { reward: 0, count: 0 };
  if (!Array.isArray(questBucket.validated)) questBucket.validated = [];

  let reward = 0;
  let count = 0;

  (questBucket.completed || []).forEach((questId) => {
    const quest = questDefs.find((q) => q.id === questId);
    if (quest && !questBucket.validated.includes(questId)) {
      reward += quest.reward;
      count += 1;
      questBucket.validated.push(questId);
    }
  });

  return { reward, count };
}

module.exports = {
  name: 'valider',
  description: 'Valider tes quetes completees (quotidiennes et hebdomadaires)',
  category: 'QUÊTES',
  usage: '!valider',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      // Resets si necessaire (n'ecrase pas si deja a jour)
      if (QuestSystem.needsDailyReset(user)) QuestSystem.resetDailyQuests(user);
      if (QuestSystem.needsWeeklyReset(user)) QuestSystem.resetWeeklyQuests(user);

      const daily = claim(user.dailyQuests, QuestSystem.getDailyQuests());
      const weekly = claim(user.weeklyQuests, QuestSystem.getWeeklyQuests());

      const totalCount = daily.count + weekly.count;
      const totalReward = daily.reward + weekly.reward;

      if (totalCount === 0) {
        await send({ text: MessageFormatter.warning('Aucune quete completee a valider pour le moment.') });
        return;
      }

      user.xp += totalReward;
      await user.save();

      let body = '';
      if (daily.count > 0) body += `\n⏰ Quotidiennes: ${daily.count} (+${daily.reward} XP)`;
      if (weekly.count > 0) body += `\n📅 Hebdomadaires: ${weekly.count} (+${weekly.reward} XP)`;

      const validationMsg = `
╔════════════════════════════════════════╗
║       ✅ QUÊTES VALIDÉES! ✅           ║
╚════════════════════════════════════════╝
${body}

💰 Total: +${totalReward} XP
═════════════════════════════════════════`;

      await send({ text: validationMsg });
    } catch (error) {
      await send({ text: MessageFormatter.error('Erreur lors de la validation!') });
    }
  },
};
