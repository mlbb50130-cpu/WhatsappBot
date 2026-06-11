const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');
const ChatbotService = require('../services/chatbotService');
const { listCharacters } = require('../data/botCharacters');

module.exports = {
  name: 'setchar',
  aliases: ['setcharacter', 'setperso', 'setpersonnage'],
  description: 'Changer le personnage utilise par le chatbot',
  category: 'BOT',
  usage: '!setchar <id>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const participantJid = message.key.participant || jid;

    if (!PermissionManager.isAdmin(participantJid)) {
      const text = MessageFormatter.error('Seul le proprietaire du bot peut changer le personnage global.');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    const characterId = Number(args[0]);
    const exists = listCharacters().some((character) => character.id === characterId);

    if (!Number.isInteger(characterId) || !exists) {
      const text = MessageFormatter.warning('Utilise: !setchar <id>. Liste: !characters');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    const character = await ChatbotService.setSelectedCharacter(characterId);
    const caption = MessageFormatter.success(`Personnage chatbot: ${character.name}`);

    return sock.sendMessage(jid, {
      image: { url: character.image },
      caption,
    }, { quoted: message });
  },
};
