const User = require('../models/User');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'classement',
  description: 'Voir les classements',
  category: 'CLASSEMENTS',
  usage: '!classement level',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const type = args[0]?.toLowerCase() || 'level';

    try {
      let users = [];
      let title = '';

      switch (type) {
        case 'level':
        case 'niveau':
          users = await User.find({}).sort({ level: -1, xp: -1 }).limit(10);
          title = '🎖️ TOP 10 NIVEAUX';
          break;
        case 'xp':
          users = await User.find({}).sort({ xp: -1 }).limit(10);
          title = '⭐ TOP 10 XP';
          break;
        case 'wins':
        case 'victoires':
          users = await User.find({}).sort({ 'stats.wins': -1 }).limit(10);
          title = '🏆 TOP 10 VICTOIRES';
          break;
        case 'quiz':
          users = await User.find({}).sort({ 'stats.quiz': -1 }).limit(10);
          title = '📚 TOP 10 QUIZ';
          break;
        default:
          await sock.sendMessage(senderJid, {
            text: '❌ Type invalide. Options: \`level\`, \`xp\`, \`wins\`, \`quiz\`'
          });
          return;
      }

      let leaderboard = `
╔════════════════════════════════════════╗
║           ${title}           ║
╚════════════════════════════════════════╝

`;

      users.forEach((u, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[index] || `${index + 1}.`;
        
        let info = '';
        switch (type) {
          case 'level':
          case 'niveau':
            info = `Niv ${u.level} | ${u.xp} XP`;
            break;
          case 'xp':
            info = `${u.xp} XP | Niv ${u.level}`;
            break;
          case 'wins':
          case 'victoires':
            info = `${u.stats.wins} victoires | ${u.stats.losses} défaites`;
            break;
          case 'quiz':
            info = `${u.stats.quiz} quiz complétés`;
            break;
        }

        leaderboard += `${medal} ${u.username}\n   └─ ${info}\n\n`;
      });

      leaderboard += '════════════════════════════════════════';

      await sock.sendMessage(senderJid, { text: leaderboard });
    } catch (error) {
      console.error('Error fetching leaderboard:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération du classement.'
      });
    }
  }
};
