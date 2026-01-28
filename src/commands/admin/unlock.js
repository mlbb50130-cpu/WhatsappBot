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

    // La vérification admin est déjà faite par le handler
    // Pas besoin de revérifier

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
