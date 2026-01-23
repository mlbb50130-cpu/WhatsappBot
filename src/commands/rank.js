module.exports = {
  name: 'rank',
  description: 'Voir ton rang dans le classement',
  category: 'PROFIL',
  usage: '!rank',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const User = require('../models/User');
      
      let allUsers;
      let userRank;
      let topLabel = 'TOP 10 GLOBAL';

      if (isGroup && groupData) {
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
