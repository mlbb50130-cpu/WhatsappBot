const MessageFormatter = require('../utils/messageFormatter');
const User = require('../models/User');

module.exports = {
  name: 'anniversaire',
  description: 'Souhaiter bon anniversaire à un joueur',
  category: 'SOCIAL',
  usage: '!anniversaire @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 30,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Vérifier si un utilisateur est mentionné
      if (!message.message.extendedTextMessage || !message.message.extendedTextMessage.contextInfo || !message.message.extendedTextMessage.contextInfo.mentionedJid) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Usage: !anniversaire @user\nMentionne le joueur dont tu célèbres l\'anniversaire!')
        });
        return;
      }

      const mentionedJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      const targetUser = await User.findOne({ jid: mentionedJid });

      if (!targetUser) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Utilisateur non trouvé!')
        });
        return;
      }

      // Ajouter XP au joueur anniversaire
      targetUser.xp += 50;
      await targetUser.save();

      const birthdayMsg = `
╔════════════════════════════════════════╗
║        🎂 BON ANNIVERSAIRE! 🎂         ║
╚════════════════════════════════════════╝

🎉 ${user.username} souhaite un bon anniversaire à ${targetUser.username}! 🎉

🎂 Gâteau spécial anniversaire
🎈 Ballons de fête
🎁 Cadeau: +50 XP! 🎁

═════════════════════════════════════════
Joyeux anniversaire @${targetUser.username}! 🥳
Que cette année soit remplie d'aventures! ✨
`;

      await sock.sendMessage(senderJid, {
        text: birthdayMsg
      });

    } catch (error) {
      console.error('Error in anniversaire command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
