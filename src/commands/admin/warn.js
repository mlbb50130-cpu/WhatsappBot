const AdminActionsManager = require('../../utils/adminActions');
const User = require('../../models/User');

module.exports = {
  name: 'warn',
  description: 'Avertir un utilisateur - 3 avertissements = ban automatique',
  category: 'ADMIN',
  usage: '!warn @user [raison]',
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

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!warn @user [raison]`\n\n📌 Exemple: `!warn @user Spam/Insulte`'
      });
      return;
    }

    const userToWarn = mentions[0];
    const reason = args.slice(1).join(' ') || 'Comportement inapproprié';

    if (userToWarn === participantJid) {
      await sock.sendMessage(senderJid, {
        text: '❌ Tu ne peux pas t\'avertir toi-même! 😅'
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

      // Get or create user in database
      let warnedUser = await User.findOne({ jid: userToWarn });
      
      if (!warnedUser) {
        warnedUser = new User({
          jid: userToWarn,
          username: 'Unknown',
          warnings: 0,
          isBanned: false
        });
      }

      const previousWarnings = warnedUser.warnings || 0;
      warnedUser.warnings = (warnedUser.warnings || 0) + 1;

      // Auto-ban after 3 warnings
      if (warnedUser.warnings >= 3) {
        warnedUser.isBanned = true;
        await warnedUser.save();

        // Kick the user
        const kickResult = await AdminActionsManager.kickUser(sock, senderJid, userToWarn, `Banni après ${warnedUser.warnings} avertissements`);

        // Send notification
        await sock.sendMessage(senderJid, {
          text: `⛔ **UTILISATEUR BANNI**\n\n👤 ${userToWarn}\n📝 Raison: ${reason}\n🚫 Avertissements: ${warnedUser.warnings}/3\n\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.RED}⛔ ${userToWarn} banned from ${senderJid}${require('../../config').COLORS.RESET}`);
      } else {
        await warnedUser.save();

        // Calculate remaining warnings
        const remainingWarnings = 3 - warnedUser.warnings;

        await sock.sendMessage(senderJid, {
          text: `⚠️ **AVERTISSEMENT ENREGISTRÉ**\n\n👤 ${userToWarn}\n📝 Raison: ${reason}\n📊 Avertissements: ${warnedUser.warnings}/3\n⏰ Avertissements restants avant ban: ${remainingWarnings}\n\n👮 Modérateur: ${message.pushName || 'Admin'}`
        });

        console.log(`${require('../../config').COLORS.YELLOW}⚠️ Warning ${warnedUser.warnings}/3 for ${userToWarn} in ${senderJid}${require('../../config').COLORS.RESET}`);
      }
    } catch (error) {
      console.error('Error warning user:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors de l'avertissement: ${error.message}`
      });
    }
  }
};
