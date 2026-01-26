const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'info',
  description: 'Information du bot',
  category: 'BOT',
  usage: '!info',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const text = `🤖 *TetsuBot v1.0.0*
⚡ Otaku RPG Bot | Node.js + MongoDB

✨ Niveaux • Quêtes • Duels • Quiz • Loot • Badges • Rangs

📞 !help | !menu | !documentation`;

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(text));
  }
};
