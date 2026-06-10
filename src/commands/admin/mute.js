const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'mute',
  aliases: ['silence'],
  description: 'Rendre le groupe muet - seuls les admins peuvent ecrire',
  category: 'admin',
  usage: '!mute',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message) {
    const senderJid = message.key.remoteJid;

    try {
      const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, senderJid);

      if (!isBotAdmin) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
        });
        return;
      }

      const result = await AdminActionsManager.muteGroup(sock, senderJid);
      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\nSeuls les admins peuvent ecrire.\nModerateur: ${message.pushName || 'Admin'}`,
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Silence impossible', result.error),
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Silence impossible', error),
      });
    }
  },
};
