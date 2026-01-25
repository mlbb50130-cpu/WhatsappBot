const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'everyone',
  aliases: ['all', 'tous'],
  description: 'Tagger tous les membres du groupe',
  category: 'admin',
  usage: '!everyone [message]',
  adminOnly: true,
  groupOnly: true,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    // Vérifier que c'est un admin
    const PermissionManager = require('../../utils/permissions');
    const canUse = PermissionManager.canUseCommand(
      participantJid,
      { adminOnly: true },
      true,
      senderJid,
      participantJid,
      groupData?.participants
    );

    if (!canUse) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Seul un administrateur peut utiliser cette commande.'
      });
      return;
    }

    try {
      // Récupérer les participants du groupe
      const groupMetadata = await sock.groupMetadata(senderJid);
      
      if (!groupMetadata || !groupMetadata.participants) {
        await sock.sendMessage(senderJid, {
          text: '❌ Impossible de récupérer la liste des participants.'
        });
        return;
      }

      const participants = groupMetadata.participants;
      const messageContent = args.join(' ');

      // Créer la liste des mentions
      const mentions = participants.map(p => p.id);

      // Créer le texte avec les mentions
      let text = messageContent ? `${messageContent}\n\n` : '';
      participants.forEach(participant => {
        text += `@${participant.id.split('@')[0]} `;
      });

      // Envoyer le message avec les mentions
      await sock.sendMessage(senderJid, {
        text: text.trim(),
        mentions: mentions
      });

      console.log(`[ADMIN] Everyone tag utilisé par ${participantJid} dans ${senderJid}`);

    } catch (error) {
      console.error('Error in everyone command:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message}`
      });
    }
  }
};
