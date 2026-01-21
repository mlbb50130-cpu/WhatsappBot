const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'lock',
  description: 'Verrouiller le groupe - Seuls les admins peuvent modifier les paramètres',
  category: 'ADMIN',
  usage: '!lock',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant;

    // Check if sender is admin
    const isUserAdmin = await AdminActionsManager.isUserAdmin(sock, senderJid, participantJid);
    
    if (!isUserAdmin.isAdmin) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Seuls les administrateurs peuvent utiliser cette commande.'
      });
      return;
    }

    try {
      // Check if bot is admin
      const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, senderJid);
      
      if (!isBotAdmin) {
        await sock.sendMessage(senderJid, {
          text: '❌ Le bot n\'est pas administrateur du groupe.'
        });
        return;
      }

      // Lock the group
      const result = await AdminActionsManager.lockGroup(sock, senderJid);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\n🔐 Les paramètres du groupe sont protégés!\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.CYAN}🔐 ${senderJid} locked${require('../../config').COLORS.RESET}`);
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors du verrouillage:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error locking group:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors du verrouillage: ${error.message}`
      });
    }
  }
};
