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

    try {
      const quizzes = [
        {
          question: 'Quel est le nom du protagoniste principal de Naruto?',
          options: ['A. Naruto Uzumaki', 'B. Sasuke Uchiha', 'C. Kakashi Hatake'],
          answer: 'A'
        },
        {
          question: 'Qui est le Capitan de la 10ème division dans Bleach?',
          options: ['A. Kyoraku Shunsui', 'B. Toshiro Hitsugaya', 'C. Jushiro Ukitake'],
          answer: 'B'
        },
        {
          question: 'Quel est le rêve de Luffy dans One Piece?',
          options: ['A. Trouver All Blue', 'B. Devenir le Roi des Pirates', 'C. Explorer le monde'],
          answer: 'B'
        },
        {
          question: 'En quelle année a commencé Attack on Titan?',
          options: ['A. 2011', 'B. 2013', 'C. 2015'],
          answer: 'B'
        },
        {
          question: 'Quel est le pouvoir principal de Tanjiro dans Demon Slayer?',
          options: ['A. Respiration du Vent', 'B. Respiration de l\'Eau', 'C. Respiration du Feu'],
          answer: 'B'
        }
      ];

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      let quizMessage = `
╔════════════════════════════════════╗
║       🎌 QUIZ ANIME 🎌            ║
╚════════════════════════════════════╝

❓ *${randomQuiz.question}*

${randomQuiz.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

💡 Réponds avec: \`!reponse A\` (ou B, C, etc.)

═════════════════════════════════════`;

      // Store quiz in session/memory (simplified)
      global.activeQuiz = {
        user: user.jid,
        answer: randomQuiz.answer,
        question: randomQuiz.question,
        timestamp: Date.now()
      };

      await sock.sendMessage(senderJid, { text: quizMessage });
    } catch (error) {
      console.error('Error in quizanime command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
