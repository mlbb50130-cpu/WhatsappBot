const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'unmute',
  aliases: ['desimulet'],
  description: 'Rendre le groupe vivant - Tous les membres peuvent écrire',
  category: 'admin',
  usage: '!unmute',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // La vérification admin est déjà faite par le handler
    // Pas besoin de revérifier

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
