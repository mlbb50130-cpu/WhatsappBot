const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

function sendText(sock, jid, reply, text) {
  return reply ? reply({ text }) : sock.sendMessage(jid, { text });
}

module.exports = {
  name: 'reponse',
  description: 'Repondre a un quiz',
  category: 'QUIZ',
  usage: '!reponse A',
  adminOnly: false,
  groupOnly: true,
  cooldown: 1,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const username = message.pushName || user.username || 'Unknown';

    if (!args[0]) {
      await sendText(
        sock,
        senderJid,
        reply,
        MessageFormatter.error('Utilisation: !reponse A (A, B, C ou D)')
      );
      return;
    }

    if (global.tournaments && global.tournaments.has(senderJid)) {
      await this.handleTournamentAnswer(sock, message, args, user, senderJid, participantJid, username, reply);
      return;
    }

    if (!global.quizSessions) global.quizSessions = new Map();
    const session = global.quizSessions.get(senderJid);

    if (!session || !session.quiz) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Aucun quiz en cours. Utilise !quiz pour commencer.'));
      return;
    }

    if (session.answered.has(participantJid)) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning('Vous avez deja repondu a ce quiz.'));
      return;
    }

    const answer = String(args[0]).trim().toUpperCase();
    const answerIndex = answer.charCodeAt(0) - 65;

    if (answerIndex < 0 || answerIndex > 3) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Reponse invalide. Utilisez A, B, C ou D.'));
      return;
    }

    session.answered.set(participantJid, {
      name: username,
      answer,
      isCorrect: answerIndex === session.quiz.correct,
    });

    if (answerIndex === session.quiz.correct) {
      user.xp += session.quiz.reward;
      user.stats.quiz += 1;

      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
      }

      QuestSystem.updateDailyProgress(user, 'quizCorrect', 1);
      await user.save();

      await sendText(
        sock,
        senderJid,
        reply,
        `✅ ${username} a repondu correctement!\nBonne reponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}\n+${session.quiz.reward} XP`
      );
    } else {
      user.stats.quiz += 1;
      await user.save();

      await sendText(
        sock,
        senderJid,
        reply,
        `❌ ${username} a repondu: ${answer}.\nBonne reponse: ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}`
      );
    }

    global.quizSessions.delete(senderJid);
  },

  async handleTournamentAnswer(sock, message, args, user, senderJid, participantJid, username, reply) {
    const tournament = global.tournaments.get(senderJid);

    if (!tournament || !tournament.isActive) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Aucun tournoi en cours.'));
      return;
    }

    if (!global.tournamentSessions) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Erreur du systeme: sessions manquantes.'));
      return;
    }

    const sessionKey = `${senderJid}_${tournament.currentRound}`;
    const session = global.tournamentSessions.get(sessionKey);

    if (!session || !session.isActive) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning('Question fermee. Attendez la prochaine question.'));
      return;
    }

    if (session.answerers.has(participantJid)) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning('Vous avez deja repondu a cette question.'));
      return;
    }

    const answer = String(args[0]).trim().toUpperCase();
    const answerIndex = answer.charCodeAt(0) - 65;

    if (answerIndex < 0 || answerIndex > 3) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Reponse invalide. Utilisez A, B, C ou D.'));
      return;
    }

    const isCorrect = answerIndex === session.quiz.correct;

    session.answerers.set(participantJid, {
      name: username,
      answer,
      isCorrect,
    });

    if (isCorrect) {
      await sendText(
        sock,
        senderJid,
        reply,
        `✅ ${username} a repondu correctement! (${answer})\nQuestion fermee!`
      );
      session.isActive = false;
    } else {
      await sendText(sock, senderJid, reply, `❌ ${username} a repondu: ${answer} (incorrect)`);
    }
  },
};
