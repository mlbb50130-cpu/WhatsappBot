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
        text: '❌ Utilisation:\n\`!setxp @user 500\` - Définir à 500 XP\n\`!setxp @user +50\` - Ajouter 50 XP\n\`!setxp @user -30\` - Retirer 30 XP'
      });
      return;
    }

    const userJid = mentions[0];
    const xpInput = args[1];
    
    // Vérifier si c'est une opération d'ajout/retrait ou une définition
    const isAddition = xpInput.startsWith('+');
    const isSubtraction = xpInput.startsWith('-') && xpInput.length > 1;
    
    let xpAmount = parseInt(isAddition ? xpInput.slice(1) : xpInput);

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

      const oldXp = targetUser.xp;
      
      if (isAddition) {
        // Ajouter l'XP
        targetUser.xp += xpAmount;
        await targetUser.save();
        
        await sock.sendMessage(senderJid, {
          text: `✅ +${xpAmount} XP ajouté à ${targetUser.username}\n${oldXp} XP → ${targetUser.xp} XP`
        });
      } else if (isSubtraction) {
        // Retirer l'XP
        targetUser.xp = Math.max(0, targetUser.xp - xpAmount);
        await targetUser.save();
        
        await sock.sendMessage(senderJid, {
          text: `✅ -${xpAmount} XP retiré à ${targetUser.username}\n${oldXp} XP → ${targetUser.xp} XP`
        });
      } else {
        // Définir l'XP
        targetUser.xp = xpAmount;
        await targetUser.save();

        await sock.sendMessage(senderJid, {
          text: `✅ XP défini à ${xpAmount} pour ${targetUser.username}\n${oldXp} XP → ${targetUser.xp} XP`
        });
      }
    } catch (error) {
      console.error('Error setting XP:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la modification de l\'XP.'
      });
    }
  }
};
