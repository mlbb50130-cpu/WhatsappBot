const RandomUtils = require('../utils/random');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'quiz',
  description: 'Lancer un quiz otaku',
  category: 'QUIZ',
  usage: '!quiz',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  // Charger tous les quizzes depuis le fichier JSON
  getQuizzes() {
    try {
      const quizzesPath = path.join(__dirname, '../data/quizzes.json');
      const data = fs.readFileSync(quizzesPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      return [];
    }
  },

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    // Charger tous les quizzes
    const allQuizzes = this.getQuizzes();
    if (allQuizzes.length === 0) {
      await sock.sendMessage(senderJid, { text: '❌ Aucun quiz disponible.' });
      return;
    }

    // Charger l'historique des quizzes répondus
    if (!user.quizHistory) user.quizHistory = [];

    // Trouver un quiz qui n'a pas été répondu
    let quiz = null;
    let availableQuizzes = allQuizzes.filter((_, index) => !user.quizHistory.includes(index));
    
    // Si TOUS les quizzes ont été répondus, afficher un message
    if (availableQuizzes.length === 0) {
      await sock.sendMessage(senderJid, {
        text: `🎉 Congratulations! Vous avez répondu à TOUS les ${allQuizzes.length} quizzes! 🎉\n\n👑 Vous êtes un vrai maître du quiz otaku!\n\nRéinitialisation de l'historique pour recommencer...`
      });
      // Réinitialiser SEULEMENT après avoir affiché le message
      user.quizHistory = [];
      availableQuizzes = allQuizzes;
    }

    // Choisir un quiz aléatoire parmi les disponibles
    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    quiz = availableQuizzes[randomIndex];
    
    // Trouver l'index réel du quiz dans le tableau complet
    const actualIndex = allQuizzes.findIndex(q => q.question === quiz.question);
    
    let options = '';
    quiz.options.forEach((option, index) => {
      options += `  ${String.fromCharCode(65 + index)}. ${option}\n`;
    });

    const question = `
╔════════════════════════════════════════╗
║            📝 QUIZ OTAKU 📝            ║
╚════════════════════════════════════════╝

*QUESTION:*
${quiz.question}

*OPTIONS:*
${options}
*RÉPONDS:* \`!reponse A\` / \`!reponse B\` / \`!reponse C\` / \`!reponse D\`
*TEMPS LIMITE:* 30 secondes ⏱️

💡 Récompense: +${quiz.reward} XP
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: question });

    // Store quiz session avec l'index réel
    if (!global.quizSessions) global.quizSessions = new Map();
    global.quizSessions.set(participantJid, {
      quiz,
      quizIndex: actualIndex,
      timestamp: Date.now(),
      answered: false,
      userJid: participantJid
    });

    // Auto-delete session after 30 seconds
    setTimeout(() => {
      if (global.quizSessions.has(participantJid)) {
        const session = global.quizSessions.get(participantJid);
        if (!session.answered) {
          sock.sendMessage(senderJid, {
            text: `⏰ Temps écoulé! La bonne réponse était: \`${String.fromCharCode(65 + session.quiz.correct)}\``
          });
          global.quizSessions.delete(participantJid);
        }
      }
    }, 30000);
  }
};
