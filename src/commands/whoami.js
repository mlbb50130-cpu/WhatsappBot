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

    try {
      const whoamiItems = [
        { label: 'Nom', value: user.username || 'Joueur' },
        { label: 'JID', value: participantJid }
      ];

      const whoamiMessage = MessageFormatter.elegantBox('𝔍𝔌𝔇', whoamiItems);
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(whoamiMessage));
    } catch (error) {
      console.error('Error in whoami command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
