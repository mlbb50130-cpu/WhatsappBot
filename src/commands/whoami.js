const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');
const { messageSenderJids } = require('../utils/jid');

module.exports = {
  name: 'whoami',
  description: 'Afficher ton JID (utile pour les admins)',
  category: 'UTIL',
  usage: '!whoami',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    try {
      const knownJids = messageSenderJids(message, groupData?.participants || []);
      const adminStatus = knownJids.some((jid) => PermissionManager.isAdmin(jid));
      const whoamiItems = [
        { label: 'Nom', value: user.username || 'Joueur' },
        { label: 'JID', value: participantJid },
        { label: 'Numero', value: PermissionManager.jidDigits(knownJids[0] || participantJid) || '-' },
        { label: 'Alias', value: knownJids.join('\n') || '-' },
        { label: 'Owner', value: adminStatus ? 'oui' : 'non' }
      ];

      const whoamiMessage = MessageFormatter.elegantBox('𝔍𝔌𝔇', whoamiItems);
      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(whoamiMessage));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(whoamiMessage));
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
