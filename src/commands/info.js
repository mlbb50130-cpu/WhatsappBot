const MessageFormatter = require('../utils/messageFormatter');

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
      { label: 'Nom', value: 'TetsuBot' },
      { label: 'Version', value: '1.0.0' },
      { label: 'Type', value: 'Otaku RPG Bot' },
      { label: 'Language', value: 'Node.js' },
      { label: 'Database', value: 'MongoDB' }
    ];

    const info = `${MessageFormatter.elegantBox('𝔌𝔑𝔉𝔒 𝔗𝔈𝔗𝔖𝔘𝔅𝔒𝔗', infoItems)}`;

    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(info));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(info));
      }
  }
};
