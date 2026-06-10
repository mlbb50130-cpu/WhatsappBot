const PermissionManager = require('../../utils/permissions');

module.exports = {
  name: 'clear',
  aliases: ['nettoyer'],
  description: 'Effacer les messages du groupe',
  category: 'admin',
  usage: '!clear',
  adminOnly: true,
  groupOnly: true,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant;

    // Check permissions
    if (!PermissionManager.hasPermission(
      participantJid,
      'owner',
      isGroup,
      senderJid,
      participantJid,
      groupData?.participants
    )) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Seul le propriétaire du groupe peut utiliser cette commande.'
      });
      return;
    }

    try {
      // Note: Baileys doesn't have a direct way to clear group messages
      // This would need to be done through a different approach
      
      await sock.sendMessage(senderJid, {
        text: '🧹 Les messages ne peuvent pas être supprimés en masse via ce bot.\nVeuillez utiliser les paramètres du groupe WhatsApp.'
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du nettoyage.'
      });
    }
  }
};
