const MessageFormatter = require('../utils/messageFormatter');
const ChatbotService = require('../services/chatbotService');
const { listCharacters } = require('../data/botCharacters');

module.exports = {
  name: 'characters',
  aliases: ['charlist', 'personnagesbot', 'botcharacters'],
  description: 'Lister les personnages disponibles pour le chatbot',
  category: 'BOT',
  usage: '!characters',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const settings = await ChatbotService.getSettings();
    const selectedId = settings.chatbot.selectedCharacter;
    const lines = listCharacters().map((character) => {
      const marker = character.id === selectedId ? '*' : '-';
      return `${marker} ${character.id}. ${character.name}`;
    });

    const text = MessageFormatter.panel({
      title: 'Personnages chatbot',
      body: lines,
      footer: 'Changer: !setchar <id>',
    });

    return reply
      ? reply({ text })
      : sock.sendMessage(message.key.remoteJid, { text });
  },
};
