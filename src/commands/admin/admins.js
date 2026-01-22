const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'admins',
  description: 'Lister tous les administrateurs du groupe',
  category: 'ADMIN',
  usage: '!admins',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const adminsResult = await AdminActionsManager.getGroupAdmins(sock, senderJid);
      
      if (!adminsResult.success) {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur: ${adminsResult.error}`
        });
        return;
      }

      if (adminsResult.count === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucun administrateur trouvé dans ce groupe.'
        });
        return;
      }

      let adminsList = `╔════════════════════════════════╗\n║    👑 ADMINISTRATEURS (${adminsResult.count})    ║\n╚════════════════════════════════╝\n\n`;

      adminsResult.admins.forEach((admin, index) => {
        const badgeEmoji = admin.isSuperAdmin ? '👑' : '🔱';
        const badge = admin.isSuperAdmin ? 'Super Admin' : 'Administrateur';
        adminsList += `${index + 1}. ${badgeEmoji} ${admin.id}\n   └─ ${badge}\n\n`;
      });

      await sock.sendMessage(senderJid, {
        text: adminsList.trim()
      });

    } catch (error) {
      console.error('Error getting admins:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message}`
      });
    }
  }
};
