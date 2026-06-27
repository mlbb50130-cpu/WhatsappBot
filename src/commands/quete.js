const QuestSystem = require('../utils/questSystem');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'quete',
  description: 'Voir les quêtes disponibles et ta progression',
  category: 'QUÊTES',
  usage: '!quete',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      let needsSave = false;

      // Check if daily quests need reset
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
        needsSave = true;
      }

      // Check if weekly quests need reset
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
        needsSave = true;
      }

      const dailyQuests = QuestSystem.getDailyQuests();
      const weeklyQuests = QuestSystem.getWeeklyQuests();

      let questMessage = `
╔════════════════════════════════════════╗
║       📋 𝔗𝔄 𝔓𝔕𝔒𝔊𝔕𝔈𝔖𝔖𝔌𝔒𝔑 📋            ║
╚════════════════════════════════════════╝

⏰ *QUÊTES QUOTIDIENNES* ⏰
${this.formatQuestList(dailyQuests, user.dailyQuests)}

📅 *QUÊTES HEBDOMADAIRES* 📅
${this.formatQuestList(weeklyQuests, user.weeklyQuests)}

═════════════════════════════════════════
💡 Complète les quêtes pour gagner des récompenses!`;

      if (reply) {
        await reply({ text: questMessage });
      } else {
        await sock.sendMessage(senderJid, { text: questMessage });
      }
      
      // Save user if any resets were done
      if (needsSave) {
        await user.save();
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  },

  formatQuestList(quests, questData) {
    if (!questData || !questData.progress) {
      return 'Aucune donnée de quête';
    }

    const mapStatToName = {
      messages: 'messages',
      duels: 'duels remportés',
      quizCorrect: 'quiz réussis',
      loots: 'loots ouverts',
      level: 'niveau'
    };

    return quests.map((quest, index) => {
      const current = questData.progress[quest.stat] || 0;
      const isCompleted = questData.completed && questData.completed.includes(quest.id);
      const percentage = Math.min(100, Math.floor((current / quest.goal) * 100));
      const barLength = 12;
      const filledLength = Math.floor((percentage / 100) * barLength);
      const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      const status = isCompleted ? '✅ COMPLÉTÉE' : `${percentage}%`;
      const statName = mapStatToName[quest.stat] || quest.stat;
      
      return `${index + 1}. ${quest.emoji} *${quest.name}*${isCompleted ? ' ✅' : ''}
   [${progressBar}] ${status}
   Progress: ${current}/${quest.goal} ${statName}
   📝 ${quest.description}
   💰 Récompense: ${quest.reward} XP
`;
    }).join('\n');
  }
};
