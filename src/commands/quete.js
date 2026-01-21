module.exports = {
  name: 'quete',
  description: 'Voir les quêtes disponibles',
  category: 'QUÊTES',
  usage: '!quete',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const quests = [
        { id: 1, emoji: '⚔️', name: 'Guerrier du jour', description: 'Gagne 3 duels', reward: '500 XP' },
        { id: 2, emoji: '💎', name: 'Looteur chanceux', description: 'Ouvre 5 loots', reward: '300 XP' },
        { id: 3, emoji: '📚', name: 'Quiz master', description: 'Réponds correctement à 5 quiz', reward: '400 XP' },
        { id: 4, emoji: '🌟', name: 'Socialite', description: 'Écris 50 messages', reward: '200 XP' },
        { id: 5, emoji: '🏆', name: 'Champion', description: 'Atteins le niveau 10', reward: '1000 XP' }
      ];

      let questMessage = `
╔════════════════════════════════════╗
║       🗺️ QUÊTES DISPONIBLES 🗺️    ║
╚════════════════════════════════════╝

`;

      quests.forEach((quest, i) => {
        questMessage += `
${i + 1}. ${quest.emoji} *${quest.name}*
   📝 ${quest.description}
   💰 Récompense: ${quest.reward}
`;
      });

      questMessage += `
═════════════════════════════════════
💡 Complète les quêtes pour gagner du XP bonus!`;

      await sock.sendMessage(senderJid, { text: questMessage });
    } catch (error) {
      console.error('Error in quete command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
