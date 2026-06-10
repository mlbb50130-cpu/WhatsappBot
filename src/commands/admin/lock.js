const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'lock',
  aliases: ['verrouiller'],
  description: 'Verrouiller les reglages du groupe',
  category: 'admin',
  usage: '!lock',
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

      const result = await AdminActionsManager.lockGroup(sock, senderJid);
      if (result.success) {
        await sock.sendMessage(senderJid, {
          text: `${result.message}\n\nLes parametres du groupe sont proteges.\nModerateur: ${message.pushName || 'Admin'}`,
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Verrouillage impossible', result.error),
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Verrouillage impossible', error),
      });
    }
  },
};
