const AdminActionsManager = require('../../utils/adminActions');
const MessageParser = require('../../utils/messageParser');

module.exports = {
  name: 'promote',
  description: 'Promouvoir un utilisateur en administrateur',
  category: 'ADMIN',
  usage: '!promote @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant;

    // Check if sender is owner or super admin
    const isUserAdmin = await AdminActionsManager.isUserAdmin(sock, senderJid, participantJid);
    
    if (!isUserAdmin.isAdmin) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Seuls les administrateurs peuvent utiliser cette commande.'
      });
      return;
    }

    // Extract mention using new parser
    const mentions = MessageParser.extractMentions(message);
    
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!promote @user`\n\n📌 Exemple: `!promote @utilisateur`'
      });
      return;
    }

    const userToPromote = mentions[0];

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

        console.log(`${require('../../config').COLORS.GREEN}✨ ${userToPromote} promoted to admin in ${senderJid}${require('../../config').COLORS.RESET}`);
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
