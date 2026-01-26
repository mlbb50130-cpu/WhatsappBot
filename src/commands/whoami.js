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
        { label: '👤 Nom', value: user.username || 'Joueur' },
        { label: '🆔 JID', value: participantJid.substring(0, 30) + '...' },
        { label: '📋 Instruction', value: 'Copie le JID pour les commandes admin' }
      ];

      const whoamiMessage = MessageFormatter.elegantBox('🆔 TON JID 🆔', whoamiItems);

      await sock.sendMessage(senderJid, { text: whoamiMessage });
    } catch (error) {
      console.error('Error in whoami command:', error.message);
      await sock.sendMessage(senderJid, { text: MessageFormatter.error('Une erreur est survenue!') });
    }
  }
};
