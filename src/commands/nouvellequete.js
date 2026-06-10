const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'nouvellequete',
  description: 'Générer une nouvelle quête (remplacer une difficile)',
  category: 'QUÊTES',
  usage: '!nouvellequete',
  adminOnly: false,
  groupOnly: true,
  cooldown: 300, // 5 minutes cooldown

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Check if daily quests need reset
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }

      // Vérifier le nombre de nouvelles quêtes créées
      if (!user.newQuestCount) {
        user.newQuestCount = { count: 0, lastReset: new Date() };
      }

      // Réinitialiser à chaque nouveau jour
      const today = new Date();
      const lastReset = new Date(user.newQuestCount.lastReset);
      if (lastReset.toDateString() !== today.toDateString()) {
        user.newQuestCount.count = 0;
        user.newQuestCount.lastReset = today;
      }

      // Limite: max 5 nouvelles quêtes par jour
      if (user.newQuestCount.count >= 5) {
        if (reply) {
        await reply({ text: MessageFormatter.warning('❌ Limite atteinte: 5 nouvelles quêtes par jour (max).') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.warning('❌ Limite atteinte: 5 nouvelles quêtes par jour (max).') });
      }
        return;
      }

      // Générer une nouvelle quête aléatoire
      const dailyQuests = QuestSystem.getDailyQuests();
      const newQuest = dailyQuests[Math.floor(Math.random() * dailyQuests.length)];

      // Remplacer une quête non complétée aléatoirement
      if (!user.dailyQuests) {
        user.dailyQuests = { progress: {}, completed: [] };
      }

      const questIndex = Math.floor(Math.random() * dailyQuests.length);
      user.dailyQuests.progress = user.dailyQuests.progress || {};

      await user.save();

      user.newQuestCount.count += 1;
      await user.save();

      const questMsg = `
╔════════════════════════════════════════╗
║     ✨ NOUVELLE QUÊTE GÉNÉRÉE! ✨     ║
╚════════════════════════════════════════╝

${newQuest.emoji} *${newQuest.name}*
📝 ${newQuest.description}
🎯 Objectif: ${newQuest.goal} ${this.getStatLabel(newQuest.stat)}
💰 Récompense: +${newQuest.reward} XP

═════════════════════════════════════════
Nouvelles quêtes utilisées aujourd'hui: ${user.newQuestCount.count}/5
Tape \`!quete\` pour voir toutes tes quêtes!
`;

      if (reply) {
        await reply({ text: questMsg });
      } else {
        await sock.sendMessage(senderJid, { text: questMsg });
      }

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de la génération!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la génération!' });
      }
    }
  },

  getStatLabel(stat) {
    const labels = {
      messages: 'messages',
      duels: 'duels gagnés',
      quizCorrect: 'quiz réussis',
      loots: 'loots ouverts',
      level: 'niveau'
    };
    return labels[stat] || stat;
  }
};
