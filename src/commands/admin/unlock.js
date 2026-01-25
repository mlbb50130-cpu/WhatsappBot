const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'unlock',
  aliases: ['deverrouiller'],
  description: 'Déverrouiller le groupe (tout le monde peut envoyer des messages)',
  category: 'admin',
  usage: '!unlock',
  adminOnly: true,
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

      // Unlock the group
      const result = await AdminActionsManager.unlockGroup(sock, senderJid);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\n🔓 Les paramètres du groupe sont accessibles!\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.CYAN}🔓 ${senderJid} unlocked${require('../../config').COLORS.RESET}`);
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors du déverrouillage:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error unlocking group:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors du déverrouillage: ${error.message}`
      });
    }
  }
};
