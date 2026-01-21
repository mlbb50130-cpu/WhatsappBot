const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'unmute',
  description: 'Rendre le groupe vivant - Tous les membres peuvent écrire',
  category: 'ADMIN',
  usage: '!unmute',
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
          text: '❌ Le bot n\'est pas administrateur du groupe.\n\nPromois-moi administrateur pour que je puisse effectuer des actions!'
        });
        return;
      }

      // Unmute the group
      const result = await AdminActionsManager.unmuteGroup(sock, senderJid);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\n👥 Tous les membres peuvent écrire!\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.CYAN}🔊 ${senderJid} unmuted${require('../../config').COLORS.RESET}`);
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors de la réactivation:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error unmuting group:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors de la réactivation: ${error.message}`
      });
    }
  }
};
