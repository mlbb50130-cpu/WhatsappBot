module.exports = {
  name: 'quete',
  description: 'Voir les quêtes disponibles et ta progression',
  category: 'QUÊTES',
  usage: '!quete',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const quests = [
        { id: 1, emoji: '⚔️', name: 'Guerrier du jour', goal: 3, description: 'Gagne 3 duels', reward: '500 XP' },
        { id: 2, emoji: '💎', name: 'Looteur chanceux', goal: 2, description: 'Ouvre 2 loots', reward: '300 XP' },
        { id: 3, emoji: '📚', name: 'Quiz master', goal: 5, description: 'Réponds correctement à 5 quiz', reward: '400 XP' },
        { id: 4, emoji: '🌟', name: 'Socialite', goal: 50, description: 'Écris 50 messages', reward: '200 XP' },
        { id: 5, emoji: '🏆', name: 'Champion', goal: 10, description: 'Atteins le niveau 10', reward: '1000 XP' }
      ];

      // Récupérer la progression actuelle
      const progress = {
        duels: user.questProgress?.duels || 0,
        loots: user.questProgress?.loots || 0,
        quizCorrect: user.questProgress?.quizCorrect || 0,
        messages: user.questProgress?.messages || 0,
        level: user.level
      };

      const completedQuestIds = user.completedQuests?.map(q => q.questId) || [];

      let questMessage = `
╔════════════════════════════════════════╗
║       🗺️ TA PROGRESSION 🗺️         ║
╚════════════════════════════════════════╝

`;

      quests.forEach((quest, i) => {
        let current = 0;
        switch (quest.id) {
          case 1: current = progress.duels; break;
          case 2: current = progress.loots; break;
          case 3: current = progress.quizCorrect; break;
          case 4: current = progress.messages; break;
          case 5: current = progress.level; break;
        }

        const isCompleted = completedQuestIds.includes(quest.id);
        const percentage = Math.min(100, Math.floor((current / quest.goal) * 100));
        const barLength = 15;
        const filledLength = Math.floor((percentage / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        const status = isCompleted ? '✅ COMPLÉTÉE' : `${percentage}%`;
        
        questMessage += `${i + 1}. ${quest.emoji} *${quest.name}* ${isCompleted ? '✅' : ''}
   ${progressBar} ${status}
   Progress: ${current}/${quest.goal}
   📝 ${quest.description}
   💰 Récompense: ${quest.reward}

`;
      });

      questMessage += `═════════════════════════════════════════
💡 Complète les quêtes pour gagner du XP!`;

      await sock.sendMessage(senderJid, { text: questMessage });
    } catch (error) {
      console.error('Error in quete command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
