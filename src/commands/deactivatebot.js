module.exports = {
  name: 'deactivatebot',
  description: 'Désactiver le bot dans le groupe (admin only)',
  category: 'ADMIN',
  usage: '!deactivatebot',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      if (!isGroup) {
        await sock.sendMessage(senderJid, {
          text: '🚫 Cette commande ne peut être utilisée que dans un groupe.'
        });
        return;
      }

      // Get Group model
      const Group = require('../models/Group');
      
      // Find group
      let group = await Group.findOne({ groupJid: senderJid });
      
      if (!group) {
        await sock.sendMessage(senderJid, {
          text: '❌ Le groupe n\'est pas enregistré dans la base de données.'
        });
        return;
      }

      if (!group.isActive) {
        await sock.sendMessage(senderJid, {
          text: '⚠️ Le bot est déjà désactivé dans ce groupe.'
        });
        return;
      }

      // Deactivate bot
      group.isActive = false;
      group.deactivatedAt = new Date();
      group.deactivatedBy = message.key.participant;
      await group.save();

      await sock.sendMessage(senderJid, {
        text: `✅ *Bot désactivé!*\n\nLe bot n'acceptera plus les commandes dans ce groupe.\n\nPour réactiver: \`!activatebot\``
      });

    } catch (error) {
      console.error('Error in deactivatebot command:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la désactivation du bot.'
      });
    }
  }
};
