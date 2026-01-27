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
    if (!global.tournamentSetup) global.tournamentSetup = new Map();

    // Vérifier qu'un tournoi n'est pas déjà en cours dans ce groupe
    if (global.tournaments.has(senderJid)) {
      await sock.sendMessage(senderJid, {
        text: '⚠️ Un tournoi est déjà en cours dans ce groupe!'
      });
      return;
    }

    // Demander le nom du quiz
    const setupMessage = `
╔════════════════════════════════════════╗
║  🏆 CONFIGURATION DU TOURNOI 🏆       ║
╚════════════════════════════════════════╝

*Étape 1/3: Quel type de quiz?*

Répondez avec:
• !tournoisquiz anime
• !tournoisquiz manga
• !tournoisquiz custom (ou un autre nom)

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: setupMessage });

    // Stocker l'état de setup en attente
    global.tournamentSetup.set(senderJid, {
      step: 1,
      initiatedBy: participantJid,
      timestamp: Date.now()
    });
  },

  async handleTournamentSetup(sock, message, args, senderJid, participantJid) {
    if (!global.tournamentSetup) return false;
    const setup = global.tournamentSetup.get(senderJid);
    
    if (!setup || setup.initiatedBy !== participantJid) return false;

    // Vérifier le timeout (5 minutes)
    if (Date.now() - setup.timestamp > 300000) {
      global.tournamentSetup.delete(senderJid);
      await sock.sendMessage(senderJid, {
        text: '⏰ Configuration du tournoi expirée. Relancez !tournoisquiz'
      });
      return true;
    }

    if (setup.step === 1 && args.length > 0) {
      setup.quizName = args[0].toLowerCase();
      setup.step = 2;

      const questionsMessage = `
╔════════════════════════════════════════╗
║  🏆 CONFIGURATION DU TOURNOI 🏆       ║
╚════════════════════════════════════════╝

*Étape 2/4: Nombre de questions*

Combien de questions voulez-vous?

Format: !tournoisquiz 7

Options recommandées:
• 5 questions - Court (2-3 min)
• 7 questions - Standard (3-5 min)
• 10 questions - Long (5-7 min)
• 15 questions - Très long (7-10 min)

════════════════════════════════════════
`;

      await sock.sendMessage(senderJid, { text: questionsMessage });
      return true;
    }

    if (setup.step === 2 && args.length > 0) {
      const numQuestions = parseInt(args[0]);
      if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
        await sock.sendMessage(senderJid, {
          text: '❌ Le nombre de questions doit être entre 1 et 50!'
        });
        return true;
      }
      
      setup.maxRounds = numQuestions;
      setup.step = 3;

      const rewardsMessage = `
╔════════════════════════════════════════╗
║  🏆 CONFIGURATION DU TOURNOI 🏆       ║
╚════════════════════════════════════════╝

*Étape 3/4: Récompenses XP*

Entrez les récompenses pour les 5 premières places.

Format: !tournoisquiz 100 80 60 40 20

Exemple:
• 1ère place: 100 XP
• 2ème place: 80 XP
• 3ème place: 60 XP
• 4ème place: 40 XP
• 5ème place: 20 XP

════════════════════════════════════════
`;

      await sock.sendMessage(senderJid, { text: rewardsMessage });
      return true;
    }

    if (setup.step === 3 && args.length === 5) {
      const rewards = args.map(arg => {
        const num = parseInt(arg);
        return isNaN(num) ? null : num;
      });

      if (rewards.includes(null)) {
        await sock.sendMessage(senderJid, {
          text: '❌ Les récompenses doivent être des nombres. Réessayez!'
        });
        return true;
      }

      setup.rewards = {
        first: rewards[0],
        second: rewards[1],
        third: rewards[2],
        fourth: rewards[3],
        fifth: rewards[4]
      };
      setup.step = 4;

      const confirmMessage = `
╔════════════════════════════════════════╗
║  🏆 CONFIRMATION DU TOURNOI 🏆        ║
╚════════════════════════════════════════╝

*Quiz:* ${setup.quizName}
*Questions:* ${setup.maxRounds}

*Récompenses:*
🥇 1ère place: ${setup.rewards.first} XP
🥈 2ème place: ${setup.rewards.second} XP
🥉 3ème place: ${setup.rewards.third} XP
🎯 4ème place: ${setup.rewards.fourth} XP
🎖️  5ème place: ${setup.rewards.fifth} XP

Confirmez: !tournoisquiz confirm

════════════════════════════════════════
`;

      await sock.sendMessage(senderJid, { text: confirmMessage });
      return true;
    }

    if (setup.step === 4 && args.length > 0 && args[0].toLowerCase() === 'confirm') {
      // Lancer le tournoi avec les paramètres configurés
      const allQuizzes = this.getQuizzes();
      const tournamentId = `${senderJid}_${Date.now()}`;

      const tournament = {
        id: tournamentId,
        groupJid: senderJid,
        quizName: setup.quizName,
        rewards: setup.rewards,
        participants: new Map(),
        currentRound: 0,
        maxRounds: setup.maxRounds,
        currentQuizIndex: 0,
        isActive: true,
        startTime: Date.now()
      };

      global.tournaments.set(senderJid, tournament);
      global.tournamentSetup.delete(senderJid);

      const announcement = `
╔════════════════════════════════════════╗
║  🏆 TOURNOI QUIZ ${setup.quizName.toUpperCase()} 🏆  ║
╚════════════════════════════════════════╝

🎮 Le tournoi va commencer!

*Configuration:*
📊 Questions: ${setup.maxRounds}

*Récompenses:*
🥇 1ère: ${setup.rewards.first} XP
🥈 2ème: ${setup.rewards.second} XP
🥉 3ème: ${setup.rewards.third} XP
🎯 4ème: ${setup.rewards.fourth} XP
🎖️  5ème: ${setup.rewards.fifth} XP

📋 Règles:
• ${setup.maxRounds} questions seront posées
• Vous avez 30 secondes par question
• Répondez: a / b / c / d (minuscule)

⏱️ Le tournoi commence dans 3 secondes...
════════════════════════════════════════
`;

      await sock.sendMessage(senderJid, { text: announcement });

      setTimeout(() => {
        this.startTournament(sock, senderJid, tournament, allQuizzes);
      }, 3000);

      return true;
    }

    if (setup.step > 0) {
      await sock.sendMessage(senderJid, {
        text: '⚠️ Erreur: données invalides. Utilisez le format attendu.'
      });
      return true;
    }

    return false;
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

    // 🌍 Initialiser la liste globale des quiz répondus
    if (!global.answeredQuizzes) global.answeredQuizzes = new Set();

    // Sélectionner un quiz aléatoire (exclure les déjà répondus)
    const availableQuizzes = allQuizzes.filter((_, index) => !global.answeredQuizzes.has(index));
    
    if (availableQuizzes.length === 0) {
      // Tous les quiz ont été répondus
      await sock.sendMessage(senderJid, {
        text: '✅ Tous les quiz ont été répondus! Fin du tournoi.'
      });
      await this.endTournament(sock, senderJid, tournament);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    const quiz = availableQuizzes[randomIndex];
    
    // Trouver l'index réel du quiz dans le tableau complet
    const actualIndex = allQuizzes.findIndex(q => q.question === quiz.question);
    tournament.currentQuizIndex = actualIndex;

    let options = '';
    quiz.options.forEach((option, index) => {
      options += `  ${String.fromCharCode(97 + index)}. ${option}\n`;
    });

    const questionText = `
╔════════════════════════════════════════╗
║ 📝 QUESTION ${tournament.currentRound}/${tournament.maxRounds}         ║
╚════════════════════════════════════════╝

*QUESTION:*
${quiz.question}

*OPTIONS:*
${options}
*RÉPONDS:* a / b / c / d (minuscule)
*TEMPS LIMITE:* 30 secondes ⏱️

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: questionText });

    // Créer une session pour cette question
    const questionSession = {
      tournamentId: tournament.id,
      round: tournament.currentRound,
      quiz,
      quizIndex: actualIndex,
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
      let hasCorrectAnswer = false;
      questionSession.answerers.forEach((answerer, jid) => {
        const participant = tournament.participants.get(jid) || {
          name: answerer.name,
          correct: 0,
          total: 0
        };

        participant.total += 1;
        if (answerer.isCorrect) {
          participant.correct += 1;
          hasCorrectAnswer = true;
        }

        tournament.participants.set(jid, participant);
      });

      // Enregistrer le quiz comme répondu globalement s'il y a eu une bonne réponse
      if (hasCorrectAnswer) {
        if (!global.answeredQuizzes) global.answeredQuizzes = new Set();
        global.answeredQuizzes.add(questionSession.quizIndex);
      }

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
    const rewardsList = [tournament.rewards.first, tournament.rewards.second, tournament.rewards.third, tournament.rewards.fourth, tournament.rewards.fifth];

    sortedParticipants.forEach((participant) => {
      const medal = medals[participant.rank - 1] || '🎯';
      const percentage = Math.round((participant.correct / participant.total) * 100);
      const reward = rewardsList[participant.rank - 1] || 0;
      
      finalResults += `
${medal} #${participant.rank} - ${participant.name}
   • ${participant.correct}/${participant.total} bonnes réponses
   • Score: ${percentage}%
   • Récompense: +${reward} XP
`;

      // Ajouter les XP au gagnant
      if (reward > 0) {
        await this.awardXP(participant.jid, reward);
      }
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
  },

  async awardXP(userJid, xpAmount) {
    try {
      const User = require('../../models/User');
      // Obtenir l'utilisateur depuis la base de données
      let user = await User.findOne({ jid: userJid });
      
      if (!user) {
        // Si l'utilisateur n'existe pas, le créer
        user = new User({
          jid: userJid,
          username: 'Tournament Winner',
          xp: xpAmount,
          level: 1
        });
      } else {
        // Ajouter les XP
        user.xp = (user.xp || 0) + xpAmount;
        
        // Recalculer le niveau
        const XPSystem = require('../../utils/xpSystem');
        const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
        const oldLevel = user.level;
        user.level = levelInfo.level;
        
        // Mettre à jour le rang si nécessaire
        if (user.level > oldLevel) {
          const rankInfo = XPSystem.getRank(user.level);
          user.rank = rankInfo.rank;
          
          const newMaxChakra = 100 + (user.level - 1) * 10;
          user.maxChakra = newMaxChakra;
        }
      }
      
      await user.save();
    } catch (error) {
      console.error(`Error awarding XP to ${userJid}:`, error);
    }
  }
};
