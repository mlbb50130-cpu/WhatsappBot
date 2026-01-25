const fs = require('fs');
const path = require('path');
const User = require('../../models/User');
const config = require('../../config');

module.exports = {
  name: 'tournoisquiz',
  aliases: ['tourquiz', 'tournoi'],
  description: 'Lancer un tournoi de quiz automatique (Admin uniquement)',
  category: 'admin',
  usage: '!tournoisquiz',
  adminOnly: true,
  groupOnly: true,
  cooldown: 30,
  customAdminCheck: 'tournoisquiz', // Custom check pour admin tournoisquiz

  // Charger tous les quizzes depuis le fichier JSON
  getQuizzes() {
    try {
      const quizzesPath = path.join(__dirname, '../../data/quizzes.json');
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

    // Vérifier si c'est un admin
    if (!config.ADMIN_JIDS.includes(participantJid)) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Seul l\'admin peut lancer ce tournoi.'
      });
      return;
    }

    // Charger les quizzes
    const allQuizzes = this.getQuizzes();
    if (allQuizzes.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Aucun quiz disponible.'
      });
      return;
    }

    // Initialiser le tournoi global
    if (!global.tournaments) global.tournaments = new Map();
    if (!global.tournamentSessions) global.tournamentSessions = new Map();

    const tournamentId = `${senderJid}_${Date.now()}`;
    
    // Vérifier qu'un tournoi n'est pas déjà en cours dans ce groupe
    if (global.tournaments.has(senderJid)) {
      await sock.sendMessage(senderJid, {
        text: '⚠️ Un tournoi est déjà en cours dans ce groupe!'
      });
      return;
    }

    // Créer le tournoi
    const tournament = {
      id: tournamentId,
      groupJid: senderJid,
      participants: new Map(), // jid -> { name, correct: 0, total: 0 }
      currentRound: 0,
      maxRounds: 7,
      currentQuizIndex: 0,
      isActive: true,
      startTime: Date.now()
    };

    global.tournaments.set(senderJid, tournament);

    // Annoncer le début du tournoi
    const announcement = `
╔════════════════════════════════════════╗
║  🏆 TOURNOI QUIZ OTAKU 🏆             ║
╚════════════════════════════════════════╝

🎮 Le tournoi va commencer!

📋 Règles:
• 7 questions seront posées
• Vous avez 15 secondes par question
• Seules les réponses !reponse A/B/C/D sont autorisées
• Les autres commandes sont BLOQUÉES pendant le tournoi

⏱️ Le tournoi commence dans 3 secondes...
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: announcement });

    // Attendre 3 secondes avant de commencer
    setTimeout(() => {
      this.startTournament(sock, senderJid, tournament, allQuizzes);
    }, 3000);
  },

  async startTournament(sock, senderJid, tournament, allQuizzes) {
    tournament.currentRound = 1;
    await this.sendNextQuiz(sock, senderJid, tournament, allQuizzes);
  },

  async sendNextQuiz(sock, senderJid, tournament, allQuizzes) {
    // Vérifier si le tournoi est toujours actif
    if (!tournament.isActive || tournament.currentRound > tournament.maxRounds) {
      if (tournament.isActive) {
        await this.endTournament(sock, senderJid, tournament);
      }
      return;
    }

    // Sélectionner un quiz aléatoire
    const randomIndex = Math.floor(Math.random() * allQuizzes.length);
    const quiz = allQuizzes[randomIndex];

    tournament.currentQuizIndex = randomIndex;

    let options = '';
    quiz.options.forEach((option, index) => {
      options += `  ${String.fromCharCode(65 + index)}. ${option}\n`;
    });

    const questionText = `
╔════════════════════════════════════════╗
║ 📝 QUESTION ${tournament.currentRound}/${tournament.maxRounds}         ║
╚════════════════════════════════════════╝

*QUESTION:*
${quiz.question}

*OPTIONS:*
${options}
*RÉPONDS:* \`!reponse A\` / \`!reponse B\` / \`!reponse C\` / \`!reponse D\`
*TEMPS LIMITE:* 30 secondes ⏱️

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: questionText });

    // Créer une session pour cette question
    const questionSession = {
      tournamentId: tournament.id,
      round: tournament.currentRound,
      quiz,
      quizIndex: randomIndex,
      timestamp: Date.now(),
      answerers: new Map(), // jid -> { name, answer, isCorrect }
      isActive: true
    };

    if (!global.tournamentSessions) global.tournamentSessions = new Map();
    const sessionKey = `${senderJid}_${tournament.currentRound}`;
    global.tournamentSessions.set(sessionKey, questionSession);

    // Attendre 30 secondes avant la prochaine question
    setTimeout(() => {
      // Marquer la session comme inactive
      questionSession.isActive = false;

      // Traiter les réponses
      questionSession.answerers.forEach((answerer, jid) => {
        const participant = tournament.participants.get(jid) || {
          name: answerer.name,
          correct: 0,
          total: 0
        };

        participant.total += 1;
        if (answerer.isCorrect) {
          participant.correct += 1;
        }

        tournament.participants.set(jid, participant);
      });

      // Afficher les résultats de cette question
      this.showRoundResults(sock, senderJid, questionSession, tournament);

      // Préparer la prochaine question
      tournament.currentRound += 1;

      // Attendre 5 secondes avant la prochaine question
      setTimeout(() => {
        this.sendNextQuiz(sock, senderJid, tournament, allQuizzes);
      }, 5000);

    }, 30000);
  },

  async showRoundResults(sock, senderJid, session, tournament) {
    let resultsText = `
╔════════════════════════════════════════╗
║  ✅ RÉSULTATS QUESTION ${session.round}/${tournament.maxRounds}          ║
╚════════════════════════════════════════╝

*Bonne réponse:* ${String.fromCharCode(65 + session.quiz.correct)}. ${session.quiz.options[session.quiz.correct]}

*Qui a répondu correctement:*
`;

    let correctCount = 0;
    session.answerers.forEach((answerer, jid) => {
      if (answerer.isCorrect) {
        resultsText += `✅ ${answerer.name}\n`;
        correctCount += 1;
      }
    });

    if (correctCount === 0) {
      resultsText += `❌ Personne n'a répondu correctement\n`;
    }

    resultsText += `
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: resultsText });
  },

  async endTournament(sock, senderJid, tournament) {
    tournament.isActive = false;

    // Trier les participants par nombre de bonnes réponses
    const sortedParticipants = Array.from(tournament.participants.entries())
      .sort((a, b) => b[1].correct - a[1].correct)
      .map((entry, index) => ({
        rank: index + 1,
        jid: entry[0],
        name: entry[1].name,
        correct: entry[1].correct,
        total: entry[1].total
      }));

    let finalResults = `
╔════════════════════════════════════════╗
║  🏆 RÉSULTATS FINAUX DU TOURNOI 🏆    ║
╚════════════════════════════════════════╝

*CLASSEMENT:*
`;

    const medals = ['🥇', '🥈', '🥉'];
    sortedParticipants.forEach((participant) => {
      const medal = medals[participant.rank - 1] || '🎯';
      const percentage = Math.round((participant.correct / participant.total) * 100);
      finalResults += `
${medal} #${participant.rank} - ${participant.name}
   • ${participant.correct}/${participant.total} bonnes réponses
   • Score: ${percentage}%
`;
    });

    finalResults += `
════════════════════════════════════════

Durée du tournoi: ${Math.round((Date.now() - tournament.startTime) / 1000)}s
Total de participants: ${sortedParticipants.length}

╔════════════════════════════════════════╗
║  Merci d'avoir participé! 🎉          ║
╚════════════════════════════════════════╝
`;

    await sock.sendMessage(senderJid, { text: finalResults });

    // Nettoyer
    global.tournaments.delete(senderJid);

    // Nettoyer les sessions
    if (global.tournamentSessions) {
      const keysToDelete = Array.from(global.tournamentSessions.keys())
        .filter(key => key.startsWith(senderJid));
      keysToDelete.forEach(key => global.tournamentSessions.delete(key));
    }
  }
};
