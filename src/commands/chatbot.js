const Group = require('../models/Group');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');
const ChatbotService = require('../services/chatbotService');
const { getCharacter } = require('../data/botCharacters');

function isBotOwner(jid = '') {
  const digits = String(jid).split('@')[0].replace(/\D/g, '');
  return config.ADMIN_JIDS.some((adminJid) => {
    const adminDigits = String(adminJid).split('@')[0].replace(/\D/g, '');
    return adminJid === jid || (adminDigits && adminDigits === digits);
  });
}

function parseAction(raw = '') {
  const action = String(raw).toLowerCase();
  if (['on', 'yes', 'true', 'activer'].includes(action)) return true;
  if (['off', 'no', 'false', 'desactiver'].includes(action)) return false;
  return null;
}

module.exports = {
  name: 'chatbot',
  aliases: ['chatbotgc', 'pmchatbot', 'dmchatbot', 'aichat'],
  description: 'Activer ou desactiver le chatbot automatique',
  category: 'BOT',
  usage: '!chatbot on/off/status',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const participantJid = message.key.participant || jid;
    const actionText = String(args[0] || 'status').toLowerCase();
    const action = parseAction(actionText);

    if (actionText === 'status') {
      const settings = await ChatbotService.getSettings();
      const character = getCharacter(settings.chatbot.selectedCharacter);
      const groupDoc = isGroup ? await Group.findOne({ groupJid: jid }).catch(() => null) : null;
      const text = MessageFormatter.panel({
        title: 'Chatbot',
        fields: [
          { label: 'DM auto', value: settings.chatbot.pmEnabled ? 'on' : 'off' },
          { label: 'Groupe auto', value: isGroup ? (groupDoc?.features?.chatbot ? 'on' : 'off') : '-' },
          { label: 'Personnage', value: `${character.id}. ${character.name}` },
        ],
        footer: isGroup ? 'En groupe, je reponds seulement si je suis mentionne ou cite.' : 'DM: !chatbot on/off',
      });

      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    if (action === null) {
      const text = MessageFormatter.warning('Utilise: !chatbot on, !chatbot off ou !chatbot status.');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    if (isGroup) {
      const canUse = PermissionManager.canUseCommand(
        participantJid,
        { adminOnly: true },
        true,
        jid,
        participantJid,
        groupData?.participants
      );

      if (!canUse) {
        const text = MessageFormatter.error('Cette commande est reservee aux administrateurs du groupe.');
        return reply ? reply({ text }) : sock.sendMessage(jid, { text });
      }

      await Group.findOneAndUpdate(
        { groupJid: jid },
        {
          $set: {
            groupName: groupData?.subject || 'Groupe',
            'features.chatbot': action,
          },
          $setOnInsert: {
            groupJid: jid,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      const text = MessageFormatter.success(
        action
          ? 'Chatbot groupe active. Je repondrai quand je suis mentionne ou cite.'
          : 'Chatbot groupe desactive.'
      );
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    if (!isBotOwner(participantJid)) {
      const text = MessageFormatter.error('Seul le proprietaire du bot peut activer le chatbot en DM.');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    await ChatbotService.setPmEnabled(action);
    const text = MessageFormatter.success(action ? 'Chatbot DM active.' : 'Chatbot DM desactive.');
    return reply ? reply({ text }) : sock.sendMessage(jid, { text });
  },
};
