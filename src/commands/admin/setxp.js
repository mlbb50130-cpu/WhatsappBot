const PermissionManager = require('../../utils/permissions');
const User = require('../../models/User');

module.exports = {
  name: 'setxp',
  aliases: ['fixerxp'],
  description: 'Définir l\'XP d\'un utilisateur (ADMIN)',
  category: 'admin',
  usage: '!setxp @user 500',
  adminOnly: true,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length === 0 || !args[1]) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: \`!setxp @user 500\`'
      });
      return;
    }

    const userJid = mentions[0];
    const xpAmount = parseInt(args[1]);

    if (isNaN(xpAmount) || xpAmount < 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ L\'XP doit être un nombre positif.'
      });
      return;
    }

    try {
      let targetUser = await User.findOne({ jid: userJid });
      
      if (!targetUser) {
        await sock.sendMessage(senderJid, {
          text: '❌ Utilisateur non trouvé.'
        });
        return;
      }

      targetUser.xp = xpAmount;
      await targetUser.save();

      await sock.sendMessage(senderJid, {
        text: `✅ XP défini à ${xpAmount} pour ${targetUser.username}`
      });
    } catch (error) {
      console.error('Error setting XP:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la définition de l\'XP.'
      });
    }
  }
};
