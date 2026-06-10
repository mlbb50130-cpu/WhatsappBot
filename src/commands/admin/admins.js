const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

function getContextInfo(message) {
  return message.message?.extendedTextMessage?.contextInfo ||
    message.message?.imageMessage?.contextInfo ||
    message.message?.videoMessage?.contextInfo ||
    {};
}

function getQuotedText(message) {
  const quoted = getContextInfo(message).quotedMessage;
  return quoted?.conversation ||
    quoted?.extendedTextMessage?.text ||
    quoted?.imageMessage?.caption ||
    quoted?.videoMessage?.caption ||
    '';
}

module.exports = {
  name: 'admins',
  aliases: ['admin'],
  description: 'Lister ou mentionner les administrateurs du groupe',
  category: 'admin',
  usage: '!admins [message]',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const adminsResult = await AdminActionsManager.getGroupAdmins(sock, jid);

    if (!adminsResult.success) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.publicError('Admins introuvables', adminsResult.error),
      }, { quoted: message });
    }

    const admins = adminsResult.admins || [];
    if (admins.length === 0) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Aucun administrateur trouve dans ce groupe.'),
      }, { quoted: message });
    }

    const mentions = admins.map((admin) => admin.id);
    const callMessage = getQuotedText(message) || args.join(' ').trim();

    if (callMessage) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({
          title: 'Attention Admins',
          body: [
            callMessage,
            mentions.map((adminJid) => `@${adminJid.split('@')[0]}`).join(' '),
          ],
        }),
        mentions,
      }, { quoted: message });
    }

    return sock.sendMessage(jid, {
      text: MessageFormatter.panel({
        title: `Administrateurs (${admins.length})`,
        body: admins.map((admin, index) => {
          const role = admin.isSuperAdmin ? 'Owner' : 'Admin';
          return `${index + 1}. @${admin.id.split('@')[0]} - ${role}`;
        }),
      }),
      mentions,
    }, { quoted: message });
  },
};
