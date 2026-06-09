const User = require('../models/User');
const Group = require('../models/Group');
const BotSettings = require('../models/BotSettings');
const config = require('../config');
const Access = require('../services/botAccessService');
const MessageFormatter = require('../utils/messageFormatter');
const { getContextInfo } = require('../utils/mediaMessages');

function getText(message) {
  return message.message?.conversation || message.message?.extendedTextMessage?.text || '';
}

function commandName(message) {
  const trimmed = getText(message).trim();
  const withoutPrefix = trimmed.startsWith(config.PREFIX)
    ? trimmed.slice(config.PREFIX.length)
    : trimmed.replace(/^!/, '');
  return withoutPrefix.split(/\s+/)[0].toLowerCase();
}

function targetJid(message, args = []) {
  const context = getContextInfo(message);
  const mentioned = Array.isArray(context.mentionedJid) ? context.mentionedJid : [];
  const raw = mentioned[0] || context.participant || args[0] || '';
  return Access.normalizeJid(raw);
}

async function requireOwnerOrMod(sock, jid, message, userJid) {
  if (await Access.isModerator(userJid)) return true;
  await sock.sendMessage(jid, {
    text: MessageFormatter.error('Commande reservee au proprietaire ou aux moderateurs du bot.'),
  }, { quoted: message });
  return false;
}

module.exports = {
  name: 'modatlas',
  aliases: [
    'addmod',
    'setmod',
    'delmod',
    'removemod',
    'modlist',
    'mods',
    'owners',
    'owner',
    'ban',
    'banuser',
    'unban',
    'unbanuser',
    'banlist',
    'listbans',
    'bangroup',
    'bangc',
    'unbangroup',
    'unbangc',
    'setbotmode',
    'mode',
  ],
  description: 'Moderation globale Atlas compatible Kassim-bot',
  category: 'ADMIN',
  usage: '!ban @user | !addmod @user | !mode public/private/self | !bangroup',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const cmd = commandName(message);

    if (!(await requireOwnerOrMod(sock, jid, message, actor))) return;

    try {
      if (['addmod', 'setmod'].includes(cmd)) {
        if (!Access.isOwner(actor)) {
          return sock.sendMessage(jid, {
            text: MessageFormatter.error('Seul le proprietaire peut ajouter un moderateur bot.'),
          }, { quoted: message });
        }

        const target = targetJid(message, args);
        if (!target) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !addmod @user') }, { quoted: message });
        }

        await Access.addModerator(target);
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`Moderateur ajoute: @${target.split('@')[0]}`),
          mentions: [target],
        }, { quoted: message });
      }

      if (['delmod', 'removemod'].includes(cmd)) {
        if (!Access.isOwner(actor)) {
          return sock.sendMessage(jid, {
            text: MessageFormatter.error('Seul le proprietaire peut retirer un moderateur bot.'),
          }, { quoted: message });
        }

        const target = targetJid(message, args);
        if (!target) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !delmod @user') }, { quoted: message });
        }

        await Access.removeModerator(target);
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`Moderateur retire: @${target.split('@')[0]}`),
          mentions: [target],
        }, { quoted: message });
      }

      if (['mods', 'modlist', 'owner', 'owners'].includes(cmd)) {
        const settings = await BotSettings.getGlobal();
        const moderators = Array.isArray(settings.moderators) ? settings.moderators : [];
        const owners = (require('../config').ADMIN_JIDS || []).map(Access.normalizeJid).filter(Boolean);
        const mentions = [...owners, ...moderators];
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Owners / Mods',
            body: [
              owners.length ? `Owners: ${owners.map((owner) => `@${owner.split('@')[0]}`).join(', ')}` : 'Owners: -',
              moderators.length ? `Mods: ${moderators.map((mod) => `@${mod.split('@')[0]}`).join(', ')}` : 'Mods: -',
            ],
          }),
          mentions,
        }, { quoted: message });
      }

      if (['ban', 'banuser'].includes(cmd)) {
        const target = targetJid(message, args);
        if (!target) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !ban @user') }, { quoted: message });
        }
        if (await Access.isModerator(target)) {
          return sock.sendMessage(jid, { text: MessageFormatter.error('Impossible de bannir un owner/mod.') }, { quoted: message });
        }

        await User.findOneAndUpdate(
          { jid: target },
          { $set: { jid: target, username: target.split('@')[0], isBanned: true } },
          { upsert: true, setDefaultsOnInsert: true }
        );
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`Utilisateur banni du bot: @${target.split('@')[0]}`),
          mentions: [target],
        }, { quoted: message });
      }

      if (['unban', 'unbanuser'].includes(cmd)) {
        const target = targetJid(message, args);
        if (!target) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !unban @user') }, { quoted: message });
        }

        await User.updateOne({ jid: target }, { $set: { isBanned: false, spamBannedUntil: null } });
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`Utilisateur debanni: @${target.split('@')[0]}`),
          mentions: [target],
        }, { quoted: message });
      }

      if (['banlist', 'listbans'].includes(cmd)) {
        const [users, groups] = await Promise.all([
          User.find({ isBanned: true }).limit(40),
          Group.find({ isActive: false, deactivatedBy: 'bangroup' }).limit(40),
        ]);
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Banlist',
            body: [
              users.length ? `Users: ${users.map((u) => `@${u.jid.split('@')[0]}`).join(', ')}` : 'Users: -',
              groups.length ? `Groups: ${groups.map((g) => g.groupName || g.groupJid).join(', ')}` : 'Groups: -',
            ],
          }),
          mentions: users.map((u) => u.jid),
        }, { quoted: message });
      }

      if (['bangroup', 'bangc'].includes(cmd)) {
        if (!isGroup) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Commande utilisable en groupe seulement.') }, { quoted: message });
        }

        await Group.findOneAndUpdate(
          { groupJid: jid },
          {
            $set: {
              groupJid: jid,
              groupName: groupData?.subject || jid,
              isActive: false,
              deactivatedBy: 'bangroup',
              deactivatedAt: new Date(),
            },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
        return sock.sendMessage(jid, { text: MessageFormatter.success('Groupe banni/desactive pour le bot.') }, { quoted: message });
      }

      if (['unbangroup', 'unbangc'].includes(cmd)) {
        if (!isGroup) {
          return sock.sendMessage(jid, { text: MessageFormatter.warning('Commande utilisable en groupe seulement.') }, { quoted: message });
        }

        await Group.findOneAndUpdate(
          { groupJid: jid },
          {
            $set: {
              groupJid: jid,
              groupName: groupData?.subject || jid,
              isActive: true,
              activatedBy: actor,
              activatedAt: new Date(),
            },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
        return sock.sendMessage(jid, { text: MessageFormatter.success('Groupe debanni/reactive.') }, { quoted: message });
      }

      if (['setbotmode', 'mode'].includes(cmd)) {
        const mode = String(args[0] || '').toLowerCase();
        const settings = await Access.setMode(mode);
        return sock.sendMessage(jid, {
          text: MessageFormatter.success(`Mode bot: ${settings.botMode}`),
        }, { quoted: message });
      }

      return sock.sendMessage(jid, { text: MessageFormatter.warning('Commande moderation inconnue.') }, { quoted: message });
    } catch (error) {
      console.error('[MOD_ATLAS] Error:', error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Moderation impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};
