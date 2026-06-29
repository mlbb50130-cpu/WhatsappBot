const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

// Collecte TOUTES les quetes completees non encore validees et les marque validees.
// resolveById resout depuis le pool complet (pas seulement 'assigned') pour ne
// jamais ignorer une quete completee (desync assigned/completed, comptes migres).
function claim(questBucket, resolveById) {
  if (!questBucket) return { xp: 0, gold: 0, count: 0 };
  if (!Array.isArray(questBucket.validated)) questBucket.validated = [];

  let xp = 0;
  let gold = 0;
  let count = 0;

  (questBucket.completed || []).forEach((questId) => {
    const quest = resolveById(questId);
    if (quest && !questBucket.validated.includes(questId)) {
      xp += quest.reward;
      gold += quest.gold || 0;
      count += 1;
      questBucket.validated.push(questId);
    }
  });

  return { xp, gold, count };
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
      if (QuestSystem.needsDailyReset(user)) QuestSystem.resetDailyQuests(user);
      if (QuestSystem.needsWeeklyReset(user)) QuestSystem.resetWeeklyQuests(user);
      QuestSystem.ensureDailyAssigned(user);
      QuestSystem.ensureWeeklyAssigned(user);

      const daily = claim(user.dailyQuests, (id) => QuestSystem.getDailyQuestById(id));
      const weekly = claim(user.weeklyQuests, (id) => QuestSystem.getWeeklyQuestById(id));

      const totalCount = daily.count + weekly.count;
      const totalXp = daily.xp + weekly.xp;
      const totalGold = daily.gold + weekly.gold;

      if (totalCount === 0) {
        await send({ text: MessageFormatter.warning('Aucune quete completee a valider pour le moment.') });
        return;
      }

      user.xp += totalXp;
      user.gold = (user.gold || 0) + totalGold;
      user.markModified('dailyQuests');
      user.markModified('weeklyQuests');
      await user.save();

      let body = '';
      if (daily.count > 0) body += `\n⏰ Quotidiennes: ${daily.count} (+${daily.xp} XP, +${daily.gold} gold)`;
      if (weekly.count > 0) body += `\n📅 Hebdomadaires: ${weekly.count} (+${weekly.xp} XP, +${weekly.gold} gold)`;

      const validationMsg = `
╔════════════════════════════════════════╗
║       ✅ QUÊTES VALIDÉES! ✅           ║
╚════════════════════════════════════════╝
${body}

💰 Total: +${totalXp} XP | +${totalGold} gold
👛 Solde: ${user.gold} gold
═════════════════════════════════════════`;

      await send({ text: validationMsg });
    } catch (error) {
      await send({ text: MessageFormatter.error('Erreur lors de la validation!') });
    }
  },
};
