const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');

module.exports = {
  name: 'info',
  description: 'Information du bot',
  category: 'BOT',
  usage: '!info',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    const infoItems = [
      { icon: '🤖', label: 'Nom', value: config.BOT_NAME },
      { icon: '📦', label: 'Version', value: config.BOT_VERSION },
      { icon: '🎮', label: 'Type', value: 'Otaku RPG Bot' },
      { icon: '🧩', label: 'Langage', value: 'Node.js' },
      { icon: '💾', label: 'Base de donnees', value: 'MongoDB' },
    ];

    const info = MessageFormatter.elegantBox('Informations', infoItems);

    if (reply) {
      await reply(MessageFormatter.createMessageWithImage(info));
    } else {
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(info));
    }
  },
};
