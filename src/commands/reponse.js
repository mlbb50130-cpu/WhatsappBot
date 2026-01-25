const RandomUtils = require('../utils/random');
const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

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
    const username = message.pushName || user.username || 'Unknown';

    if (!args[0]) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Utilisation: !reponse A (A, B, C ou D)')
      });
      return;
    }

    // Vérifier si un tournoi est en cours
    if (global.tournaments && global.tournaments.has(senderJid)) {
      // Gérer la réponse du tournoi
      await this.handleTournamentAnswer(sock, message, args, user, senderJid, participantJid, username);
      return;
    }

    // Get quiz session
    if (!global.quizSessions) global.quizSessions = new Map();
    const session = global.quizSessions.get(participantJid);

    if (!session) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Aucun quiz en cours. Utilise !quiz pour commencer!')
      });
      return;
    }

    if (session.answered) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning('Vous avez déjà répondu à ce quiz.')
      });
      return;
    }

    const answer = args[0].toUpperCase();
    const answerIndex = answer.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc

    if (answerIndex < 0 || answerIndex > 3) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Réponse invalide. Utilisez A, B, C ou D.')
      });
      return;
    }

    session.answered = true;

    if (answerIndex === session.quiz.correct) {
      // Correct answer
      user.xp += session.quiz.reward;
      user.stats.quiz += 1;
      
      // Reset quests si nécessaire
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
      }
      
      // Update quest progress
      QuestSystem.updateDailyProgress(user, 'quizCorrect', 1);
      
      // Enregistrer ce quiz comme répondu
      if (!user.quizHistory) user.quizHistory = [];
      if (!user.quizHistory.includes(session.quizIndex)) {
        user.quizHistory.push(session.quizIndex);
      }
      
      await user.save();

      await sock.sendMessage(senderJid, {
        text: MessageFormatter.success(`Tu as gagné +${session.quiz.reward} XP!\nBonne réponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}`)
      });
    } else {
      // Wrong answer - ne pas ajouter à l'historique
      user.stats.quiz += 1;
      await user.save();
      
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error(`Ta réponse: ${answer}. ${session.quiz.options[answerIndex]}\nBonne réponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}`)
      });
    }

    global.quizSessions.delete(participantJid);
  },

  async handleTournamentAnswer(sock, message, args, user, senderJid, participantJid, username) {
    const tournament = global.tournaments.get(senderJid);
    
    if (!tournament || !tournament.isActive) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Aucun tournoi en cours.')
      });
      return;
    }

    if (!global.tournamentSessions) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Erreur du système: sessions manquantes.')
      });
      return;
    }

    const sessionKey = `${senderJid}_${tournament.currentRound}`;
    const session = global.tournamentSessions.get(sessionKey);

    if (!session || !session.isActive) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning('Question fermée. Attendez la prochaine question.')
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà répondu
    if (session.answerers.has(participantJid)) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning('Vous avez déjà répondu à cette question.')
      });
      return;
    }

    const answer = args[0].toUpperCase();
    const answerIndex = answer.charCodeAt(0) - 65;

    if (answerIndex < 0 || answerIndex > 3) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Réponse invalide. Utilisez A, B, C ou D.')
      });
      return;
    }

    const isCorrect = answerIndex === session.quiz.correct;

    // Enregistrer la réponse
    session.answerers.set(participantJid, {
      name: username,
      answer: answer,
      isCorrect: isCorrect
    });

    // Feedback immédiat
    if (isCorrect) {
      await sock.sendMessage(senderJid, {
        text: `✅ ${username} a répondu correctement! (${answer})`
      });
    } else {
      await sock.sendMessage(senderJid, {
        text: `❌ ${username} a répondu: ${answer} (incorrect)`
      });
    }
  }
};
