const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'quiz',
  description: 'Lancer un quiz otaku',
  category: 'QUIZ',
  usage: '!quiz [sujet]',
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
      return [];
    }
  },

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    if (global.quizSessions && global.quizSessions.has(senderJid)) {
      return;
    }

    const today = new Date();
    if (!user.quizUsageToday) {
      user.quizUsageToday = { lastReset: today, count: 0 };
    }

    const lastReset = new Date(user.quizUsageToday.lastReset || 0);
    const isSameDay = lastReset.toDateString() === today.toDateString();
    if (!isSameDay) {
      user.quizUsageToday.lastReset = today;
      user.quizUsageToday.count = 0;
    }

    if (user.quizUsageToday.count >= 10) {
      if (reply) {
        await reply({ text: MessageFormatter.warning('Limite atteinte: 10 quiz par jour.') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.warning('Limite atteinte: 10 quiz par jour.') });
      }
      return;
    }

    // Charger tous les quizzes (fallback si IA indisponible)
    const allQuizzes = this.getQuizzes();
    if (allQuizzes.length === 0) {
      if (reply) {
        await reply({ text: MessageFormatter.error('Aucun quiz disponible.') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Aucun quiz disponible.') });
      }
      return;
    }

    // Initialiser la liste globale des quiz répondus (jamais répétés)
    if (!global.answeredQuizzes) global.answeredQuizzes = new Set();

    // Charger l'historique des quizzes répondus (utilisateur)
    if (!user.quizHistory) user.quizHistory = [];

    // Trouver un quiz qui n'a pas été répondu
    let availableQuizzes = allQuizzes.filter((_, index) =>
      !user.quizHistory.includes(index) && !global.answeredQuizzes.has(index)
    );
    
    // Si TOUS les quizzes ont été répondus, afficher un message
    if (availableQuizzes.length === 0) {
      const congratsItems = [
        { label: '🎉 Statut', value: `TOUS les ${allQuizzes.length} quizzes répondus!` },
        { label: '👑 Titre', value: 'Maître du Quiz Otaku' },
        { label: '🔄 Action', value: 'Historique réinitialisé' }
      ];
      const congratsMsg = MessageFormatter.elegantBox('🎉 FÉLICITATIONS! 🎉', congratsItems);
      if (reply) {
        await reply({ text: congratsMsg });
      } else {
        await sock.sendMessage(senderJid, { text: congratsMsg });
      }
      // Réinitialiser SEULEMENT après avoir affiché le message
      user.quizHistory = [];
      global.answeredQuizzes.clear();
      availableQuizzes = allQuizzes;
    }

    // Choisir un quiz aléatoire
    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    const quiz = availableQuizzes[randomIndex];

    // Trouver l'index réel du quiz dans le tableau complet
    const actualIndex = allQuizzes.findIndex(q => q.question === quiz.question);
    
    let options = '';
    quiz.options.forEach((option, index) => {
      options += `  ${String.fromCharCode(65 + index)}. ${option}\n`;
    });

    const timeLimitMs = 30000;
    const timeLabel = '30s';

    const questionItems = [
      { label: 'Question', value: quiz.question },
      { label: 'Options', value: options.trim() },
      { label: 'Temps', value: timeLabel },
      { label: 'Récompense', value: `+${quiz.reward} XP` }
    ];

    const quizTitle = '𝔔𝔘𝔌𝔝 𝔒𝔗𝔄𝔎𝔘';
    const quizMessage = MessageFormatter.elegantBox(quizTitle, questionItems);
    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(quizMessage));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(quizMessage));
      }

    user.quizUsageToday.count += 1;
    await user.save();

    // Store quiz session par GROUPE (pas par utilisateur) pour que tous puissent répondre
    if (!global.quizSessions) global.quizSessions = new Map();
    global.quizSessions.set(senderJid, {
      quiz,
      quizIndex: actualIndex,
      timestamp: Date.now(),
      answered: new Map(), // Enregistrer qui a répondu avec {participantJid: {name, answer, isCorrect}}
      launchedBy: participantJid,
      launchedByName: user.username || 'Unknown'
    });

    // Auto-delete session after 30 seconds
    setTimeout(() => {
      if (global.quizSessions.has(senderJid)) {
        const session = global.quizSessions.get(senderJid);
        if (session.answered.size === 0) {
          sock.sendMessage(senderJid, {
            text: MessageFormatter.warning(`Temps écoulé! La bonne réponse était: \`${String.fromCharCode(97 + session.quiz.correct)}\``)
          });
        }
        global.quizSessions.delete(senderJid);
      }
    }, timeLimitMs);
  }
};
