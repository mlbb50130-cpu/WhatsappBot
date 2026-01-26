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

        let rankDetails = `
╔════════════════════════════════════╗
║      🎖️ INFORMATIONS RANG 🎖️       ║
╚════════════════════════════════════╝

${rankInfo.emoji} *${rankInfo.name}*
${rankInfo.description}

├─ 📊 Niveau: *${user.level}*
├─ ⭐ Condition: ${rankInfo.condition}
├─ 🎖️ Catégorie: Otaku${nextRank ? `
├─ 📈 Prochain Rang: ${nextRank.emoji} *${nextRank.name}*
├─ 📊 Progression: ${progress}% ${getProgressBar(progress)}
├─ 🎯 Niveau requis: ${nextRank.minLevel}
└─ 🔄 Levels restants: ${nextRank.minLevel - user.level}` : `
└─ 🏆 Vous avez atteint le rang maximum!`}

╔════════════════════════════════════╗
║     🌟 Hiérarchie Otaku 🌟         ║
╚════════════════════════════════════╝`;

        // Ajouter tous les rangs disponibles
        for (const [rankId, rank] of Object.entries(RankSystem.RANKS)) {
          const achieved = user.level >= rank.minLevel;
          const marker = achieved ? '✅' : '🔒';
          rankDetails += `\n${marker} L${rank.minLevel}+ ${rank.emoji} *${rank.name}*`;
        }

        rankDetails += '\n═════════════════════════════════════';

        const response = await MessageFormatter.createMessageWithImage(rankDetails);
        await sock.sendMessage(senderJid, response);
        return;
      }

      // Mode 2: Afficher le classement (global ou groupe)
      let allUsers;
      let userRank;
      let topLabel = 'TOP 10 GLOBAL';

      if ((option === 'group' || isGroup) && isGroup && groupData) {
        // Si en groupe, afficher seulement le top 10 du groupe
        const groupMembers = groupData.participants.map(p => p.id);
        allUsers = await User.find({ jid: { $in: groupMembers } })
          .sort({ xp: -1 })
          .limit(10);
        userRank = allUsers.findIndex(u => u.jid === user.jid) + 1;
        topLabel = `TOP 10 DU GROUPE`;
      } else {
        // En DM, afficher le top 10 global
        allUsers = await User.find()
          .sort({ xp: -1 })
          .limit(10);
        userRank = allUsers.findIndex(u => u.jid === user.jid) + 1;
      }

      let rankMessage = `
╔════════════════════════════════════╗
║           🏆 TON RANG 🏆           ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
🥇 *Rang:* ${userRank}/${allUsers.length}
📊 *Niveau:* ${user.level}
✨ *XP Total:* ${user.xp}

═════════════════════════════════════
*${topLabel}*
═════════════════════════════════════
`;

      const mentions = [];
      allUsers.slice(0, 10).forEach((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        rankMessage += `\n${medal} @${u.jid.split('@')[0]} - Lvl ${u.level} (${u.xp} XP)`;
        mentions.push(u.jid);
      });

      rankMessage += `\n═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { 
        text: rankMessage,
        mentions: mentions
      });
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
