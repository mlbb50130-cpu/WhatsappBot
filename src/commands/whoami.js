const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'whoami',
  description: 'Afficher ton JID (utile pour les admins)',
  category: 'UTIL',
  usage: '!whoami',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    await sock.sendMessage(senderJid, { text: `👤 ${user.username || 'Joueur'}\n🆔 JID: ${participantJid}` });
  }
};
