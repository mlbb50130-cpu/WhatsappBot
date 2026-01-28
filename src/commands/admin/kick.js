const PermissionManager = require('../../utils/permissions');
const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'kick',
  aliases: ['expulser'],
  description: 'Expulser un utilisateur du groupe',
  category: 'admin',
  usage: '!kick @user [raison]',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant;

    // La vérification admin est déjà faite par le handler
    // Pas besoin de revérifier

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!kick @user [raison]`\n\n📌 Exemple: `!kick @user Spam`'
      });
      return;
    }

    const userToKick = mentions[0];
    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    if (userToKick === participantJid) {
      await sock.sendMessage(senderJid, {
        text: '❌ Tu ne peux pas t\'expulser toi-même! 😅'
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

      // Get info about user to be kicked
      const targetUserInfo = await AdminActionsManager.isUserAdmin(sock, senderJid, userToKick);
      const targetUsername = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.pushName || userToKick;

      // Kick the user
      const result = await AdminActionsManager.kickUser(sock, senderJid, userToKick, reason);

      if (result.success) {
        // Send notification to group
        await sock.sendMessage(senderJid, {
          text: `⚠️ **UTILISATEUR EXPULSÉ**\n\n👤 ${targetUsername}\n📝 Raison: ${reason}\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        // Log to console
      } else {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur lors de l'expulsion:\n${result.error}`
        });
      }
    } catch (error) {
      console.error('Error kicking user:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors de l'expulsion: ${error.message}`
      });
    }
  }
};
