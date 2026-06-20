const User = require('../models/User');

const MessageFormatter = require('../utils/messageFormatter');

function statValue(user, path, fallback = 0) {
  return path.split('.').reduce((value, key) => value?.[key], user) ?? fallback;
}

function userName(user) {
  return MessageFormatter.cleanText(user.username || user.jid?.split('@')[0] || 'Joueur');
}

module.exports = {
  name: 'classement',
  aliases: ['leaderboard', 'top'],
  description: 'Voir les classements',
  category: 'CLASSEMENTS',
  usage: '!classement level|xp|wins|quiz',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const type = args[0]?.toLowerCase() || 'level';

    try {
      let users = [];
      let title = '';

      switch (type) {
        case 'level':
        case 'niveau':
          users = await User.find({}).sort({ level: -1, xp: -1 }).limit(10);
          title = 'Top 10 niveaux';
          break;
        case 'xp':
          users = await User.find({}).sort({ xp: -1 }).limit(10);
          title = 'Top 10 XP';
          break;
        case 'wins':
        case 'victoires':
          users = await User.find({}).sort({ 'stats.wins': -1 }).limit(10);
          title = 'Top 10 victoires';
          break;
        case 'quiz':
          users = await User.find({}).sort({ 'stats.quiz': -1 }).limit(10);
          title = 'Top 10 quiz';
          break;
        default:
          {
            const text = MessageFormatter.warning('Type invalide. Options: `level`, `xp`, `wins`, `quiz`.');
            if (reply) {
              await reply({ text });
            } else {
              await sock.sendMessage(senderJid, { text });
            }
          }
          return;
      }

      const lines = users.length === 0 ? ['Aucun joueur trouve.'] : users.map((u, index) => {
        const rank = `${index + 1}.`;
        
        let info = '';
        switch (type) {
          case 'level':
          case 'niveau':
            info = `Niv ${u.level || 1} | ${u.xp || 0} XP`;
            break;
          case 'xp':
            info = `${u.xp || 0} XP | Niv ${u.level || 1}`;
            break;
          case 'wins':
          case 'victoires':
            info = `${statValue(u, 'stats.wins')} victoires | ${statValue(u, 'stats.losses')} defaites`;
            break;
          case 'quiz':
            info = `${statValue(u, 'stats.quiz')} quiz completes`;
            break;
        }

        return `${rank} *${userName(u)}* - ${info}`;
      });

      const leaderboard = MessageFormatter.panel({
        title,
        body: lines,
        footer: 'Options: !classement level, xp, wins, quiz.',
      });

      if (reply) {
        await reply({ text: leaderboard });
      } else {
        await sock.sendMessage(senderJid, { text: leaderboard });
      }
    } catch (error) {
      const text = MessageFormatter.publicError('Recuperation du classement impossible', error);
      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(senderJid, { text });
      }
    }
  }
};
