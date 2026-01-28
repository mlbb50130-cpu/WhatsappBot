const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'promote',
  aliases: ['promouvoir'],
  description: 'Promouvoir un utilisateur en administrateur',
  category: 'admin',
  usage: '!promote @user',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // La vérification admin est déjà faite par le handler
    // Pas besoin de revérifier

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!promote @user`\n\n📌 Exemple: `!promote @utilisateur`'
      });
      return;
    }

    const userToPromote = mentions[0];
    const participantJid = message.key.participant;

    if (userToPromote === participantJid) {
      await sock.sendMessage(senderJid, {
        text: '❌ Tu es déjà administrateur! 👑'
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

      // Check if user is already admin
      const targetUserInfo = await AdminActionsManager.isUserAdmin(sock, senderJid, userToPromote);
      if (targetUserInfo.isAdmin) {
        await sock.sendMessage(senderJid, {
          text: '❌ Cet utilisateur est déjà administrateur!'
        });
        return;
      }

      // Promote the user
      const result = await AdminActionsManager.promoteUser(sock, senderJid, userToPromote);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `✅ **PROMOTION EFFECTUÉE**\n\n👤 ${userToPromote}\n👑 Est maintenant administrateur!\n\n👮 Promu par: ${message.pushName || 'Admin'}`
        });

      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors de la promotion:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors de la promotion: ${error.message}`
      });
    }
  }
};
