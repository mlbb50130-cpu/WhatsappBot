const MessageFormatter = require('../utils/messageFormatter');
const ChatbotService = require('../services/chatbotService');
const { getCharacter } = require('../data/botCharacters');

module.exports = {
  name: 'ask',
  aliases: ['ai', 'ia'],
  description: 'Poser une question au chatbot sans activer le mode auto',
  category: 'BOT',
  usage: '!ask <question>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const prompt = args.join(' ').trim();

    if (!prompt) {
      const text = MessageFormatter.warning('Utilise: !ask <question>');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    try {
      const settings = await ChatbotService.getSettings();
      const character = getCharacter(settings.chatbot.selectedCharacter);

      await sock.sendPresenceUpdate('composing', jid).catch(() => null);
      const response = await ChatbotService.generateReply(prompt, jid, character);
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      return reply ? reply({ text: response }) : sock.sendMessage(jid, { text: response });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      const missingKey = error.code === 'MISSING_GEMINI_KEY' || /GEMINI_API_KEY/i.test(error.message);
      const emptyOrBlocked = ChatbotService.isEmptyOrProviderBlockedResponseError(error);
      const text = missingKey
        ? MessageFormatter.warning('La cle Gemini nest pas visible sur Railway. Variable conseillee: GEMINI_API_KEY.')
        : emptyOrBlocked
          ? ChatbotService.EMPTY_GEMINI_REPLY
          : MessageFormatter.error('Le chatbot ne peut pas repondre pour le moment.');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }
  },
};
