const AdminActionsManager = require('../../utils/adminActions');
const Access = require('../../services/botAccessService');
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
  name: 'kick',
  aliases: ['expulser', 'remove'],
  description: 'Expulser un utilisateur du groupe',
  category: 'admin',
  usage: '!kick @user [raison] ou reponds a un message avec !remove',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const target = getTargetJid(message);
    const reason = args.filter((arg) => !arg.includes('@')).join(' ').trim() || 'Aucune raison specifiee';

    if (!target) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Utilise: !kick @user [raison] ou reponds a un message avec !remove.'),
      }, { quoted: message });
    }

    if (sameJid(target, actor)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Tu ne peux pas t expulser toi-meme.'),
      }, { quoted: message });
    }

    if (sameJid(target, AdminActionsManager.getBotJid(sock))) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Je ne peux pas m expulser moi-meme.'),
      }, { quoted: message });
    }

    if (await Access.isModerator(target)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Impossible de retirer un proprietaire ou moderateur du bot.'),
      }, { quoted: message });
    }

    const metadata = await sock.groupMetadata(jid).catch(() => null);
    if (metadata?.owner && sameJid(target, metadata.owner)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Impossible de retirer le createur du groupe.'),
      }, { quoted: message });
    }

    const targetInfo = await AdminActionsManager.isUserAdmin(sock, jid, target);
    if (targetInfo.isAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Impossible de retirer un administrateur du groupe.'),
      }, { quoted: message });
    }

    const botAdmin = await AdminActionsManager.isBotAdmin(sock, jid);
    if (!botAdmin) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
      }, { quoted: message });
    }

    const result = await AdminActionsManager.kickUser(sock, jid, target, reason);
    return sock.sendMessage(jid, {
      text: result.success
        ? MessageFormatter.success(`@${target.split('@')[0]} a ete retire du groupe. Raison: ${reason}`)
        : MessageFormatter.publicError('Expulsion impossible', result.error),
      mentions: [target],
    }, { quoted: message });
  },
};
