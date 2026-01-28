const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'lock',
  aliases: ['verrouiller'],
  description: 'Verrouiller le groupe (seuls les admins peuvent envoyer des messages)',
  category: 'admin',
  usage: '!lock',
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

      // Lock the group
      const result = await AdminActionsManager.lockGroup(sock, senderJid);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\n🔐 Les paramètres du groupe sont protégés!\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

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
