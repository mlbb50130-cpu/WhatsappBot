const MessageFormatter = require('../utils/messageFormatter');
const RankSystem = require('../utils/rankSystem');

module.exports = {
  name: 'rank',
  description: 'Voir ton rang Otaku et ton classement',
  category: 'PROFIL',
  usage: '!rank [global|group]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const User = require('../models/User');
      const option = args[0]?.toLowerCase() || 'info'; // Par défaut: infos personnelles

      // Mode 1: Afficher les infos de rang Otaku de l'utilisateur
      if (option === 'info' || (!option)) {
        const rankInfo = RankSystem.getRankByLevel(user.level);
        const nextRank = RankSystem.getNextRank(user);
        const progress = RankSystem.getRankProgressPercentage(user);

        let text = `🎖️ ${rankInfo.emoji} *${rankInfo.name}*\nLvl ${user.level}`;
        if (nextRank) {
          text += ` → ${nextRank.emoji} ${nextRank.name} (${progress}%)`;
        } else {
          text += ` (MAX)`;
        }

        await sock.sendMessage(senderJid, { text });
        return;
      }

      // Mode 2: Afficher le classement (global ou groupe)
      let allUsers;
      let userRank;

      if ((option === 'group') && isGroup && groupData) {
        const groupMembers = groupData.participants.map(p => p.id);
        allUsers = await User.find({ jid: { $in: groupMembers } }).sort({ xp: -1 }).limit(10);
        userRank = allUsers.findIndex(u => u.jid === user.jid) + 1;
      } else {
        allUsers = await User.find().sort({ xp: -1 }).limit(10);
        userRank = allUsers.findIndex(u => u.jid === user.jid) + 1;
      }

      let text = `🏆 Rang: ${userRank}\n`;
      allUsers.forEach((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        text += `${medal} Lvl${u.level} ${u.xp}XP\n`;
      });

      await sock.sendMessage(senderJid, { text });
    } catch (error) {
      console.error('Error in rank command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};

/**
 * Créer une barre de progression visuelle
 * @param {number} percentage - Pourcentage (0-100)
 * @returns {string} Barre visuelle
 */
function getProgressBar(percentage) {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
