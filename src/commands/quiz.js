const RandomUtils = require('../utils/random');

module.exports = {
  name: 'quiz',
  description: 'Lancer un quiz otaku',
  category: 'QUIZ',
  usage: '!quiz',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  quizzes: [
    {
      question: '🤔 Quel est le pouvoir spécial de Naruto?',
      options: ['Sharingan', 'Rinnegan', 'Kurama', 'Mangekyou'],
      correct: 2,
      reward: 25
    },
    {
      question: '🤔 Quel est le capitaine de la 4ème division de la Soul Society?',
      options: ['Kenpachi', 'Retsu Unohana', 'Jushiro Ukitake', 'Shunsui Kyoraku'],
      correct: 1,
      reward: 20
    },
    {
      question: '🤔 Comment s\'appelle le pouvoir de Tanjiro?',
      options: ['Breathing Styles', 'Demon Slayer Mark', 'Nichirin Sword', 'Hinokami Kagura'],
      correct: 0,
      reward: 30
    },
    {
      question: '🤔 Quel est le nom du mentor de Luffy?',
      options: ['Garp', 'Shanks', 'Rayleigh', 'Zoro'],
      correct: 2,
      reward: 25
    },
    {
      question: '🤔 Quel est le type de magie d\'Erza Scarlet?',
      options: ['Archive Magic', 'Requip Magic', 'Celestial Spirit Magic', 'Earth Magic'],
      correct: 1,
      reward: 20
    },
    {
      question: '🤔 Comment s\'appelle le village ninja d\'Aizawa?',
      options: ['Konohagakure', 'Kirigakure', 'Sunagakure', 'Iwagakure'],
      correct: 0,
      reward: 15
    }
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    const quiz = RandomUtils.choice(this.quizzes);
    
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

    // Store quiz session
    if (!global.quizSessions) global.quizSessions = new Map();
    global.quizSessions.set(participantJid, {
      quiz,
      timestamp: Date.now(),
      answered: false
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
