const RandomUtils = require('../utils/random');

module.exports = {
  name: 'reponse',
  description: 'Répondre à un quiz',
  category: 'QUIZ',
  usage: '!reponse A',
  adminOnly: false,
  groupOnly: true,
  cooldown: 1,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    if (!args[0]) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: \`!reponse A\` (A, B, C ou D)'
      });
      return;
    }

    // Get quiz session
    if (!global.quizSessions) global.quizSessions = new Map();
    const session = global.quizSessions.get(participantJid);

    if (!session) {
      await sock.sendMessage(senderJid, {
        text: '❌ Aucun quiz en cours. Utilise \`!quiz\` pour commencer!'
      });
      return;
    }

    if (session.answered) {
      await sock.sendMessage(senderJid, {
        text: '❌ Vous avez déjà répondu à ce quiz.'
      });
      return;
    }

    const answer = args[0].toUpperCase();
    const answerIndex = answer.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc

    if (answerIndex < 0 || answerIndex > 3) {
      await sock.sendMessage(senderJid, {
        text: '❌ Réponse invalide. Utilisez A, B, C ou D.'
      });
      return;
    }

    session.answered = true;

    if (answerIndex === session.quiz.correct) {
      // Correct answer
      user.xp += session.quiz.reward;
      user.stats.quiz += 1;
      await user.save();

      await sock.sendMessage(senderJid, {
        text: `✅ CORRECT! 
        
Tu as gagné +${session.quiz.reward} XP!
Bonne réponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}`
      });
    } else {
      // Wrong answer
      await sock.sendMessage(senderJid, {
        text: `❌ Mauvaise réponse!

Ta réponse: ${answer}. ${session.quiz.options[answerIndex]}
Bonne réponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}`
      });
    }

    global.quizSessions.delete(participantJid);
  }
};
