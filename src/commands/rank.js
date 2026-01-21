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
      const allUsers = await User.find().sort({ xp: -1 }).limit(10);
      const userRank = allUsers.findIndex(u => u.jid === user.jid) + 1;

      let rankMessage = `
╔════════════════════════════════════╗
║           🏆 TON RANG 🏆           ║
╚════════════════════════════════════╝

👤 *${user.pseudo || 'Joueur'}*
🥇 *Rang:* ${userRank}/${allUsers.length}
📊 *Niveau:* ${user.level}
✨ *XP Total:* ${user.xp}

═════════════════════════════════════
*TOP 10 DES MEILLEURS*
═════════════════════════════════════
`;

      allUsers.slice(0, 10).forEach((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        rankMessage += `\n${medal} ${u.pseudo || 'Joueur'} - Lvl ${u.level} (${u.xp} XP)`;
      });

      rankMessage += `\n═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: rankMessage });
    } catch (error) {
      console.error('Error in rank command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
