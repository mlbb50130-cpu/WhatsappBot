const MessageFormatter = require('../../utils/messageFormatter');

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
        text: MessageFormatter.error('Seul un administrateur peut utiliser cette commande.'),
      });
      return;
    }

    try {
      const groupMetadata = await sock.groupMetadata(senderJid);

      if (!groupMetadata?.participants) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Impossible de recuperer la liste des participants.'),
        });
        return;
      }

      const mentions = groupMetadata.participants.map((participant) => participant.id);
      const messageContent = args.join(' ');
      const tags = mentions.map((jid) => `@${jid.split('@')[0]}`).join(' ');

      await sock.sendMessage(senderJid, {
        text: `${messageContent ? `${messageContent}\n\n` : ''}${tags}`.trim(),
        mentions,
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Mention impossible', error),
      });
    }
  },
};
