const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');

module.exports = {
  name: 'desactivatebot',
  description: 'Désactiver le bot dans le groupe (propriétaire du bot seulement)',
  category: 'ADMIN',
  usage: '!desactivatebot',
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    
    const senderJidRaw = message.key.participant || message.key.remoteJid;
    const isBotOwner = PermissionManager.isAdmin(senderJidRaw);

    if (!isBotOwner) {
      if (reply) {
        await reply({ text: '🚫 *Accès refusé!*\n\n⛔ Seul le propriétaire du bot peut désactiver le bot.\n\nVous n\'avez pas les permissions nécessaires.' });
      } else {
        await sock.sendMessage(senderJid, { text: '🚫 *Accès refusé!*\n\n⛔ Seul le propriétaire du bot peut désactiver le bot.\n\nVous n\'avez pas les permissions nécessaires.' });
      }
      return;
    }

    try {
      if (!isGroup) {
        if (reply) {
          await reply({ text: '🚫 Cette commande ne peut être utilisée que dans un groupe.' });
        } else {
          await sock.sendMessage(senderJid, { text: '🚫 Cette commande ne peut être utilisée que dans un groupe.' });
        }
        return;
      }

      // Get Group model
      const Group = require('../models/Group');
      
      // Find group
      let group = await Group.findOne({ groupJid: senderJid });
      
      if (!group) {
        if (reply) {
          await reply({ text: '❌ Le groupe n\'est pas enregistré dans la base de données.' });
        } else {
          await sock.sendMessage(senderJid, { text: '❌ Le groupe n\'est pas enregistré dans la base de données.' });
        }
        return;
      }

      if (!group.isActive) {
        if (reply) {
          await reply({ text: '⚠️ Le bot est déjà désactivé dans ce groupe.' });
        } else {
          await sock.sendMessage(senderJid, { text: '⚠️ Le bot est déjà désactivé dans ce groupe.' });
        }
        return;
      }

      // Deactivate bot
      group.isActive = false;
      group.deactivatedAt = new Date();
      group.deactivatedBy = message.key.participant;
      await group.save();

      if (reply) {
        await reply({ text: `✅ *Bot désactivé!*\n\nLe bot n'acceptera plus les commandes dans ce groupe.\n\nPour réactiver: \`!activatebot\`` });
      } else {
        await sock.sendMessage(senderJid, { text: `✅ *Bot désactivé!*\n\nLe bot n'acceptera plus les commandes dans ce groupe.\n\nPour réactiver: \`!activatebot\`` });
      }

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de la désactivation du bot.' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la désactivation du bot.' });
      }
    }
  }
};
