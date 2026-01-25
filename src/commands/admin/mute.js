const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'mute',
  aliases: ['silence'],
  description: 'Rendre le groupe muet - Seuls les admins peuvent écrire',
  category: 'admin',
  usage: '!mute',
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

      // Mute the group
      const result = await AdminActionsManager.muteGroup(sock, senderJid);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\n👤 Seuls les admins peuvent écrire\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.CYAN}🔇 ${senderJid} muted${require('../../config').COLORS.RESET}`);
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors du silence:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error muting group:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors du silence: ${error.message}`
      });
    }
  }
};
