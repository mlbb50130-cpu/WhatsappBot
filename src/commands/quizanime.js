module.exports = {
  name: 'quizanime',
  description: 'Quiz spécial anime',
  category: 'QUIZ',
  usage: '!quizanime',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    try {
      const quizzes = [
        {
          question: 'Quel est le nom du protagoniste principal de Naruto?',
          options: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake'],
          correct: 0
        },
        {
          question: 'Qui est le Capitan de la 10ème division dans Bleach?',
          options: ['Kyoraku Shunsui', 'Toshiro Hitsugaya', 'Jushiro Ukitake'],
          correct: 1
        },
        {
          question: 'Quel est le rêve de Luffy dans One Piece?',
          options: ['Trouver All Blue', 'Devenir le Roi des Pirates', 'Explorer le monde'],
          correct: 1
        },
        {
          question: 'En quelle année a commencé Attack on Titan?',
          options: ['2011', '2013', '2015'],
          correct: 1
        },
        {
          question: 'Quel est le pouvoir principal de Tanjiro dans Demon Slayer?',
          options: ['Respiration du Vent', 'Respiration de l\'Eau', 'Respiration du Feu'],
          correct: 1
        }
      ];

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      let quizMessage = `
╔════════════════════════════════════╗
║       🎌 QUIZ ANIME 🎌            ║
╚════════════════════════════════════╝

❓ *${randomQuiz.question}*

${randomQuiz.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

💡 Réponds avec: \`!reponse A\` (ou B, C, etc.)

═════════════════════════════════════`;

      // Store quiz in sessions (compatible with reponse command)
      if (!global.quizSessions) global.quizSessions = new Map();
      
      global.quizSessions.set(participantJid, {
        quiz: {
          options: randomQuiz.options,
          correct: randomQuiz.correct,
          reward: 15
        },
        answered: false,
        timestamp: Date.now()
      });

      await sock.sendMessage(senderJid, { text: quizMessage });
    } catch (error) {
      console.error('Error in quizanime command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
