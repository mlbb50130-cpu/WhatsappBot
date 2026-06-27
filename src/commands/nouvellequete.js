const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

const DAILY_LIMIT = 5;

module.exports = {
  name: 'nouvellequete',
  description: 'Coup de pouce: booste la progression d\'une quete quotidienne difficile',
  category: 'QUÊTES',
  usage: '!nouvellequete',
  adminOnly: false,
  groupOnly: true,
  cooldown: 300, // 5 minutes

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }

      // Compteur journalier persiste
      const today = new Date();
      if (!user.newQuestCount) {
        user.newQuestCount = { count: 0, lastReset: today };
      }
      const lastReset = new Date(user.newQuestCount.lastReset || 0);
      if (lastReset.toDateString() !== today.toDateString()) {
        user.newQuestCount.count = 0;
        user.newQuestCount.lastReset = today;
      }

      if (user.newQuestCount.count >= DAILY_LIMIT) {
        await user.save();
        await send({ text: MessageFormatter.warning(`Limite atteinte: ${DAILY_LIMIT} coups de pouce par jour.`) });
        return;
      }

      const dailyQuests = QuestSystem.getDailyQuests();
      const completed = user.dailyQuests.completed || [];

      // Quetes non encore completees
      const pending = dailyQuests.filter((q) => !completed.includes(q.id));
      if (pending.length === 0) {
        await user.save();
        await send({ text: MessageFormatter.info('Toutes tes quetes du jour sont deja completees. Utilise `!valider`.') });
        return;
      }

      // Choisir une quete a booster et ajouter ~50% de l'objectif
      const quest = pending[Math.floor(Math.random() * pending.length)];
      const boost = Math.max(1, Math.ceil(quest.goal * 0.5));

      if (!user.dailyQuests.progress) user.dailyQuests.progress = {};
      const current = user.dailyQuests.progress[quest.stat] || 0;
      user.dailyQuests.progress[quest.stat] = current + boost;

      QuestSystem.checkDailyQuestCompletion(user);

      user.newQuestCount.count += 1;
      user.markModified('dailyQuests');
      user.markModified('newQuestCount');
      await user.save();

      const newProgress = Math.min(quest.goal, user.dailyQuests.progress[quest.stat]);
      const isDone = (user.dailyQuests.completed || []).includes(quest.id);

      const questMsg = `
╔════════════════════════════════════════╗
║        ✨ COUP DE POUCE QUÊTE ✨        ║
╚════════════════════════════════════════╝

${quest.emoji} *${quest.name}*
📝 ${quest.description}
🚀 Boost: +${boost} ${this.getStatLabel(quest.stat)}
📊 Progression: ${newProgress}/${quest.goal}${isDone ? ' ✅ COMPLÉTÉE' : ''}

═════════════════════════════════════════
Coups de pouce utilises: ${user.newQuestCount.count}/${DAILY_LIMIT}
${isDone ? 'Tape `!valider` pour reclamer ta recompense!' : 'Continue pour la terminer, puis `!valider`.'}`;

      await send({ text: questMsg });
    } catch (error) {
      await send({ text: MessageFormatter.error('Erreur lors du coup de pouce!') });
    }
  },

  getStatLabel(stat) {
    const labels = {
      messages: 'messages',
      duels: 'duels gagnes',
      quizCorrect: 'quiz reussis',
      loots: 'loots ouverts',
      level: 'niveau',
    };
    return labels[stat] || stat;
  },
};
