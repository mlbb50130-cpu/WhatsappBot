const AdminActionsManager = require('../../utils/adminActions');
const MessageParser = require('../../utils/messageParser');

module.exports = {
  name: 'demote',
  description: 'Rétrograder un administrateur',
  category: 'ADMIN',
  usage: '!demote @admin',
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
        text: '❌ Utilisation: `!demote @admin`\n\n📌 Exemple: `!demote @administrateur`'
      });
      return;
    }

    const userToDemote = mentions[0];

    if (userToDemote === participantJid) {
      await sock.sendMessage(senderJid, {
        text: '❌ Tu ne peux pas te rétrograder toi-même! 😅'
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

      // Check if user is admin
      const targetUserInfo = await AdminActionsManager.isUserAdmin(sock, senderJid, userToDemote);
      if (!targetUserInfo.isAdmin) {
        await sock.sendMessage(senderJid, {
          text: '❌ Cet utilisateur n\'est pas administrateur!'
        });
        return;
      }

      // Demote the user
      const result = await AdminActionsManager.demoteUser(sock, senderJid, userToDemote);

      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `✅ **RÉTROGRADATION EFFECTUÉE**\n\n👤 ${userToDemote}\n😔 N'est plus administrateur!\n\n👮 Rétrogradé par: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.YELLOW}⬇️ ${userToDemote} demoted from admin in ${senderJid}${require('../../config').COLORS.RESET}`);
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors de la rétrogradation:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error demoting user:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors de la rétrogradation: ${error.message}`
      });
    }
  }
};
