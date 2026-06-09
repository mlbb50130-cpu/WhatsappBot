const Group = require('../models/Group');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');
const AdminActionsManager = require('../utils/adminActions');
const { downloadMedia, getContextInfo, getQuotedMessage, getQuotedText, resolveMedia } = require('../utils/mediaMessages');

function getText(message) {
  return message.message?.conversation || message.message?.extendedTextMessage?.text || '';
}

function commandName(message) {
  return getText(message).trim().slice(config.PREFIX.length).split(/\s+/)[0].toLowerCase();
}

function participants(groupData) {
  return Array.isArray(groupData?.participants) ? groupData.participants : [];
}

function participantJid(message) {
  return message.key.participant || message.key.remoteJid;
}

function mentionsFromMessage(message) {
  const context = getContextInfo(message);
  return Array.isArray(context.mentionedJid) ? context.mentionedJid : [];
}

function quotedKey(message) {
  const context = getContextInfo(message);
  if (!context.stanzaId) return null;
  return {
    remoteJid: message.key.remoteJid,
    fromMe: false,
    id: context.stanzaId,
    participant: context.participant,
  };
}

async function requireGroupAdmin(sock, jid, message, groupData) {
  const userJid = participantJid(message);
  const canUse = PermissionManager.canUseCommand(
    userJid,
    { adminOnly: true },
    true,
    jid,
    userJid,
    participants(groupData)
  );

  if (canUse) return true;
  await sock.sendMessage(jid, {
    text: MessageFormatter.error('Commande reservee aux administrateurs du groupe.'),
  }, { quoted: message });
  return false;
}

async function requireBotAdmin(sock, jid, message) {
  const botAdmin = await AdminActionsManager.isBotAdmin(sock, jid);
  if (botAdmin) return true;
  await sock.sendMessage(jid, {
    text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
  }, { quoted: message });
  return false;
}

async function updateGroupFeature(jid, groupData, feature, enabled) {
  return Group.findOneAndUpdate(
    { groupJid: jid },
    {
      $set: {
        groupJid: jid,
        groupName: groupData?.subject || jid,
        [`features.${feature}`]: enabled,
      },
    },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
}

function onOff(value) {
  const action = String(value || '').toLowerCase();
  if (['on', 'oui', 'true', 'activer'].includes(action)) return true;
  if (['off', 'non', 'false', 'desactiver'].includes(action)) return false;
  return null;
}

module.exports = {
  name: 'groupatlas',
  aliases: [
    'setgcname',
    'delete',
    'del',
    'antilink',
    'welcome',
    'gclink',
    'grouplink',
    'group',
    'gc',
    'hidetag',
    'htag',
    'tagall',
    'revoke',
    'setgcdesc',
    'setppgc',
    'antidel',
    'antidelete',
  ],
  description: 'Gestion groupe Atlas compatible Kassim-bot',
  category: 'ADMIN',
  usage: '!antilink on | !tagall message | !setgcname nom | !gclink',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const jid = message.key.remoteJid;
    const command = commandName(message);
    const text = args.join(' ').trim();

    if (!isGroup) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Commande utilisable en groupe seulement.'),
      }, { quoted: message });
    }

    try {
      if (!(await requireGroupAdmin(sock, jid, message, groupData))) return;

      if (['antilink', 'welcome', 'antidel', 'antidelete'].includes(command)) {
        const enabled = onOff(args[0]);
        if (enabled === null) {
          return sock.sendMessage(jid, {
            text: MessageFormatter.warning(`Utilise: !${command} on/off`),
          }, { quoted: message });
        }

        if (command === 'antilink') {
          await updateGroupFeature(jid, groupData, 'antiLink', enabled);
          await Group.updateOne({ groupJid: jid }, { $set: { 'permissions.blockInviteLinks': enabled } });
        } else if (command === 'welcome') {
          await updateGroupFeature(jid, groupData, 'autoWelcome', enabled);
          await Group.updateOne({ groupJid: jid }, { $set: { 'features.autoGoodbye': enabled } });
        } else {
          await updateGroupFeature(jid, groupData, 'antiDelete', enabled);
          await Group.updateOne({ groupJid: jid }, { $set: { 'logs.logDeletes': enabled } });
        }

        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`${command} ${enabled ? 'active' : 'desactive'}.`),
        }, { quoted: message });
      }

      if (command === 'setgcname') {
        if (!text) return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !setgcname <nom>') }, { quoted: message });
        if (!(await requireBotAdmin(sock, jid, message))) return;
        const result = await AdminActionsManager.changeGroupSubject(sock, jid, text);
        if (!result.success) throw new Error(result.error);
        return sock.sendMessage(jid, { text: MessageFormatter.success(result.message) }, { quoted: message });
      }

      if (command === 'setgcdesc') {
        const desc = getQuotedText(message) || text;
        if (!desc) return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !setgcdesc <description>') }, { quoted: message });
        if (!(await requireBotAdmin(sock, jid, message))) return;
        const result = await AdminActionsManager.changeGroupDescription(sock, jid, desc);
        if (!result.success) throw new Error(result.error);
        return sock.sendMessage(jid, { text: MessageFormatter.success(result.message) }, { quoted: message });
      }

      if (command === 'setppgc') {
        if (!(await requireBotAdmin(sock, jid, message))) return;
        const mediaInfo = resolveMedia(message);
        if (!mediaInfo || mediaInfo.mediaType !== 'image') {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Reponds a une image avec !setppgc.') }, { quoted: message });
        }

        const buffer = await downloadMedia(mediaInfo.media, mediaInfo.mediaType);
        await sock.updateProfilePicture(jid, buffer);
        return sock.sendMessage(jid, { text: MessageFormatter.success('Photo du groupe mise a jour.') }, { quoted: message });
      }

      if (['gclink', 'grouplink'].includes(command)) {
        if (!(await requireBotAdmin(sock, jid, message))) return;
        const code = await sock.groupInviteCode(jid);
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Group Link',
            fields: [{ label: 'Lien', value: `https://chat.whatsapp.com/${code}` }],
          }),
        }, { quoted: message });
      }

      if (command === 'revoke') {
        if (!(await requireBotAdmin(sock, jid, message))) return;
        await sock.groupRevokeInvite(jid);
        return sock.sendMessage(jid, { text: MessageFormatter.success('Lien du groupe regenere.') }, { quoted: message });
      }

      if (['group', 'gc'].includes(command)) {
        if (!(await requireBotAdmin(sock, jid, message))) return;
        const mode = String(args[0] || '').toLowerCase();
        if (!['open', 'close'].includes(mode)) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !group open ou !group close') }, { quoted: message });
        }

        await sock.groupSettingUpdate(jid, mode === 'close' ? 'announcement' : 'not_announcement');
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(mode === 'close' ? 'Groupe ferme: seuls les admins peuvent parler.' : 'Groupe ouvert.'),
        }, { quoted: message });
      }

      if (['tagall', 'hidetag', 'htag'].includes(command)) {
        const members = participants(groupData);
        const mentionJids = members.map((p) => p.id);
        const body = text || getQuotedText(message) || 'Attention everybody';
        const visible = command === 'tagall'
          ? `${body}\n\n${mentionJids.map((id) => `@${id.split('@')[0]}`).join('\n')}`
          : body;

        return sock.sendMessage(jid, {
          text: visible,
          mentions: mentionJids,
        }, { quoted: message });
      }

      if (['delete', 'del'].includes(command)) {
        const key = quotedKey(message);
        if (!key || !getQuotedMessage(message)) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Reponds au message a supprimer avec !delete.') }, { quoted: message });
        }
        if (!(await requireBotAdmin(sock, jid, message))) return;
        if (!global.botDeletedMsgIds) global.botDeletedMsgIds = new Set();
        global.botDeletedMsgIds.add(key.id);
        setTimeout(() => global.botDeletedMsgIds?.delete(key.id), 5 * 60 * 1000);
        return sock.sendMessage(jid, { delete: key });
      }

      return sock.sendMessage(jid, { text: MessageFormatter.warning('Commande groupe inconnue.') }, { quoted: message });
    } catch (error) {
      console.error('[GROUP_ATLAS] Error:', error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Commande groupe impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};
