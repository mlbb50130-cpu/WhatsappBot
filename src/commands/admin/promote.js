const AdminActionsManager = require('../../utils/adminActions');
const MessageFormatter = require('../../utils/messageFormatter');

function getContextInfo(message) {
  return message.message?.extendedTextMessage?.contextInfo ||
    message.message?.imageMessage?.contextInfo ||
    message.message?.videoMessage?.contextInfo ||
    {};
}

function getTargetJid(message) {
  const context = getContextInfo(message);
  const mentioned = Array.isArray(context.mentionedJid) ? context.mentionedJid : [];
  return mentioned[0] || context.participant || '';
}

module.exports = {
  name: 'promote',
  aliases: ['promouvoir'],
  description: 'Promouvoir un utilisateur en administrateur',
  category: 'admin',
  usage: '!promote @user ou reponds a un message avec !promote',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const target = getTargetJid(message);

    if (!target) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Utilise: !promote @user ou reponds a un message avec !promote.'),
      }, { quoted: message });
    }

    if (target === actor) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Tu ne peux pas te promouvoir toi-meme.'),
      }, { quoted: message });
    }

    if (target === AdminActionsManager.getBotJid(sock)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Je ne peux pas me promouvoir moi-meme.'),
      }, { quoted: message });
    }

    const botAdmin = await AdminActionsManager.isBotAdmin(sock, jid);
    if (!botAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
      }, { quoted: message });
    }

    const targetInfo = await AdminActionsManager.isUserAdmin(sock, jid, target);
    if (targetInfo.isAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Cet utilisateur est deja administrateur.'),
      }, { quoted: message });
    }

    const result = await AdminActionsManager.promoteUser(sock, jid, target);
    return sock.sendMessage(jid, {
      text: result.success
        ? MessageFormatter.success(`@${target.split('@')[0]} est maintenant administrateur.`)
        : MessageFormatter.publicError('Promotion impossible', result.error),
      mentions: [target],
    }, { quoted: message });
  },
};
