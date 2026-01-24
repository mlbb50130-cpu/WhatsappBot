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
      const whoamiMessage = `
╔════════════════════════════════════╗
║         🆔 TON JID 🆔              ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*

*Ton JID:*
\`\`\`
${participantJid}
\`\`\`

📋 *Copie ce JID et ajoute-le à ADMIN_JIDS dans .env pour avoir accès aux commandes admin.*

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: whoamiMessage });
    } catch (error) {
      console.error('Error in whoami command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
