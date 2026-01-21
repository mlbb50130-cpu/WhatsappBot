const AdminActionsManager = require('../../utils/adminActions');

module.exports = {
  name: 'groupinfo',
  description: 'Afficher les informations du groupe',
  category: 'ADMIN',
  usage: '!groupinfo',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const infoResult = await AdminActionsManager.getGroupInfo(sock, senderJid);
      
      if (!infoResult.success) {
        await sock.sendMessage(senderJid, {
          text: `❌ Erreur: ${infoResult.error}`
        });
        return;
      }

      const data = infoResult.data;
      const creationDate = new Date(data.creation).toLocaleDateString('fr-FR');
      const status = data.announce ? '📢 Seuls les admins peuvent écrire' : '💬 Tous peuvent écrire';
      const lockStatus = data.restrict ? '🔒 Verrouillé' : '🔓 Déverrouillé';

      let infoText = `
╔═══════════════════════════════════╗
║    📊 INFORMATIONS DU GROUPE      ║
╚═══════════════════════════════════╝

👥 Nom: ${data.subject}

📈 Statistiques:
  • Membres total: ${data.participants}
  • Administrateurs: ${data.admins}
  • Membres réguliers: ${data.participants - data.admins}

⚙️ Paramètres:
  • Message: ${status}
  • Verrouillage: ${lockStatus}

📅 Créé le: ${creationDate}

👨‍💼 Propriétaire: ${data.owner || 'Non disponible'}

${data.desc ? `📝 Description:\n${data.desc}` : '📝 Aucune description'}
`;

      await sock.sendMessage(senderJid, {
        text: infoText.trim()
      });

    } catch (error) {
      console.error('Error getting group info:', error.message);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message}`
      });
    }
  }
};
