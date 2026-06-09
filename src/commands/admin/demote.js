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

function sameJid(a = '', b = '') {
  const digitsA = String(a).split('@')[0].replace(/\D/g, '');
  const digitsB = String(b).split('@')[0].replace(/\D/g, '');
  return a === b || (digitsA && digitsA === digitsB);
}

module.exports = {
  name: 'demote',
  aliases: ['retrograder'],
  description: 'Retrograder un administrateur',
  category: 'admin',
  usage: '!demote @admin ou reponds a un message avec !demote',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const target = getTargetJid(message);

    if (!target) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Utilise: !demote @admin ou reponds a un message avec !demote.'),
      }, { quoted: message });
    }

    if (sameJid(target, actor)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Tu ne peux pas te retrograder toi-meme.'),
      }, { quoted: message });
    }

    if (sameJid(target, AdminActionsManager.getBotJid(sock))) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Je ne peux pas me retrograder moi-meme.'),
      }, { quoted: message });
    }

    const metadata = await sock.groupMetadata(jid).catch(() => null);
    if (metadata?.owner && sameJid(target, metadata.owner)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Impossible de retrograder le createur du groupe.'),
      }, { quoted: message });
    }

    const botAdmin = await AdminActionsManager.isBotAdmin(sock, jid);
    if (!botAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
      }, { quoted: message });
    }

    const targetInfo = await AdminActionsManager.isUserAdmin(sock, jid, target);
    if (!targetInfo.isAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Cet utilisateur nest pas administrateur.'),
      }, { quoted: message });
    }

    const result = await AdminActionsManager.demoteUser(sock, jid, target);
    return sock.sendMessage(jid, {
      text: result.success
        ? MessageFormatter.success(`@${target.split('@')[0]} nest plus administrateur.`)
        : MessageFormatter.error(`Retrogradation impossible: ${result.error}`),
      mentions: [target],
    }, { quoted: message });
  },
};
