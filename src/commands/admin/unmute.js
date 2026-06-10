const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'unmute',
  aliases: ['desimulet'],
  description: 'Rendre le groupe ouvert - tous les membres peuvent ecrire',
  category: 'admin',
  usage: '!unmute',
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

      const result = await AdminActionsManager.unmuteGroup(sock, senderJid);
      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\nTous les membres peuvent ecrire.\nModerateur: ${message.pushName || 'Admin'}`,
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Reactivation impossible', result.error),
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Reactivation impossible', error),
      });
    }
  },
};
