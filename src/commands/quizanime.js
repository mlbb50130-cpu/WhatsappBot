const quizCommand = require('./quiz');

module.exports = {
  name: 'quizanime',
  description: 'Quiz special anime',
  category: 'QUIZ',
  usage: '!quizanime [serie]',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    return quizCommand.launchQuiz(
      sock,
      message,
      args,
      user,
      isGroup,
      groupData,
      reply,
      {
        type: 'anime',
        title: 'QUIZ ANIME',
      }
    );
  },
};
