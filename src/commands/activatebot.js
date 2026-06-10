const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');

module.exports = {
  name: 'activatebot',
  description: 'Activer le bot dans ce groupe (Owner seulement)',
  category: 'BOT',
  usage: '!activatebot',
  groupOnly: true,
  cooldown: 0,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    
    // Vérifier si c'est le propriétaire du bot
    const senderNumber = (message.key.participant || message.key.remoteJid).split('@')[0];
    const isBotOwner = config.ADMIN_JIDS && config.ADMIN_JIDS.includes(senderNumber);

    if (!isBotOwner) {
      if (reply) {
        await reply({ text: '🚫 *Accès refusé!*\n\n⛔ Seul le propriétaire du bot peut activer le bot dans les groupes.\n\nVous n\'avez pas les permissions nécessaires.' });
      } else {
        await sock.sendMessage(senderJid, { text: '🚫 *Accès refusé!*\n\n⛔ Seul le propriétaire du bot peut activer le bot dans les groupes.\n\nVous n\'avez pas les permissions nécessaires.' });
      }
      return;
    }

    try {
      const Group = require('../models/Group');
      
      let group = await Group.findOne({ groupJid: senderJid });

      if (!group) {
        // Créer le groupe s'il n'existe pas
        group = new Group({
          groupJid: senderJid,
          groupName: groupData?.subject || 'Groupe',
          isActive: true,
          activatedBy: senderNumber,
          activatedAt: new Date()
        });
      } else {
        // Activer le groupe existant
        group.isActive = true;
        group.activatedBy = senderNumber;
        group.activatedAt = new Date();
      }

      await group.save();

      const activateItems = [
        { label: '🎆 Groupe', value: groupData?.subject || senderJid },
        { label: '✅ Statut', value: 'Bot activé' },
        { label: '👤 Activé par', value: senderNumber }
      ];

      const activateMsg = MessageFormatter.elegantBox('🤖 𝔅𝔒𝔗 𝔄𝔠𝔱𝔦𝔳é 🤖', activateItems);

      if (reply) {
        await reply({ text: activateMsg });
      } else {
        await sock.sendMessage(senderJid, { text: activateMsg });
      }


    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors de l\'activation du bot!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors de l\'activation du bot!' });
      }
    }
  }
};
