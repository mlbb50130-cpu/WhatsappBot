const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

function formatDate(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR');
}

module.exports = {
  name: 'groupinfo',
  aliases: ['gcinfo', 'infogroupes', 'groupeinfo'],
  description: 'Afficher les informations du groupe',
  category: 'admin',
  usage: '!groupinfo',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message) {
    const jid = message.key.remoteJid;
    const infoResult = await AdminActionsManager.getGroupInfo(sock, jid);

    if (!infoResult.success) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.publicError('Group info impossible', infoResult.error),
      }, { quoted: message });
    }

    const data = infoResult.data;
    const owner = data.owner || '';
    return sock.sendMessage(jid, {
      text: MessageFormatter.panel({
        title: 'Group Info',
        fields: [
          { label: 'Nom', value: data.subject || jid },
          { label: 'Membres', value: String(data.participants || 0) },
          { label: 'Admins', value: String(data.admins || 0) },
          { label: 'Owner', value: owner ? `@${owner.split('@')[0]}` : '-' },
          { label: 'Cree le', value: formatDate(data.creation) },
          { label: 'Messages', value: data.announce ? 'admins seulement' : 'tous les membres' },
          { label: 'Reglages', value: data.restrict ? 'admins seulement' : 'ouverts' },
          { label: 'Description', value: data.desc || '-' },
        ],
      }),
      mentions: owner ? [owner] : [],
    }, { quoted: message });
  },
};
