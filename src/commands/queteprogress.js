module.exports = {
  name: 'queteprogress',
  description: 'Voir ta progression dans les quêtes',
  category: 'QUÊTES',
  usage: '!queteprogress',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Définir les quêtes avec leurs objectifs
      const quests = [
        { id: 1, emoji: '⚔️', name: 'Guerrier du jour', goal: 3, current: user.questProgress?.duels || 0, reward: '500 XP' },
        { id: 2, emoji: '💎', name: 'Looteur chanceux', goal: 2, current: user.questProgress?.loots || 0, reward: '300 XP' },
        { id: 3, emoji: '📚', name: 'Quiz master', goal: 5, current: user.questProgress?.quizCorrect || 0, reward: '400 XP' },
        { id: 4, emoji: '🌟', name: 'Socialite', goal: 50, current: user.questProgress?.messages || 0, reward: '200 XP' },
        { id: 5, emoji: '🏆', name: 'Champion', goal: 10, current: user.level, reward: '1000 XP' }
      ];

      // Vérifier les quêtes complétées
      const completedQuestIds = user.completedQuests?.map(q => q.questId) || [];

      let progressMessage = `
╔════════════════════════════════════════╗
║       📊 TA PROGRESSION 📊             ║
╚════════════════════════════════════════╝

`;

      quests.forEach((quest) => {
        const isCompleted = completedQuestIds.includes(quest.id);
        const percentage = Math.min(100, Math.floor((quest.current / quest.goal) * 100));
        const barLength = 20;
        const filledLength = Math.floor((percentage / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        const status = isCompleted ? '✅ COMPLÉTÉE' : `${percentage}%`;
        
        progressMessage += `
${quest.emoji} *${quest.name}* ${isCompleted ? '✅' : ''}
   ${progressBar} ${status}
   Progress: ${quest.current}/${quest.goal} (${quest.current >= quest.goal ? '✓ TERMINÉ!' : 'En cours'})
   💰 Récompense: ${quest.reward}
`;
      });

      progressMessage += `
═════════════════════════════════════════
💡 Complète les quêtes pour gagner du XP!
🎁 Les récompenses seront cumulables`;

      await sock.sendMessage(senderJid, { text: progressMessage });
    } catch (error) {
      console.error('Error in queteprogress command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
