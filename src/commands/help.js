const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');

function stripPrefix(value = '') {
  const text = String(value || '').trim();
  if (text.startsWith(config.PREFIX)) return text.slice(config.PREFIX.length);
  return text.replace(/^!/, '');
}

module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'Aide sur une commande',
  category: 'BOT',
  usage: '!help [commande]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const handler = require('../handler');

    if (!args[0]) {
      const help = MessageFormatter.panel({
        title: 'Aide rapide',
        body: [
          '`!profil` profil',
          '`!level` niveau',
          '`!duel @user` duel',
          '`!quiz` quiz',
          '`!loot` coffre',
          '`!dl` downloader',
          '`!play` YouTube audio',
          '`!image` recherche media',
          '`!wiki` recherche info',
          '`!hd` tools',
          '`!say` TTS',
          '`!hug` reaction anime',
          '`!truth` fun',
          '`!toimg` converters',
          '`!antilink` groupe',
          '`!ask` chatbot IA',
          '`!menu` categories',
        ],
        footer: 'Detail: !help <commande>',
      });

      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(help));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(help));
      }
      return;
    }

    const commandName = stripPrefix(args[0]).toLowerCase();
    const command = handler.getCommand(commandName);

    if (!command) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error(`Commande \`${commandName}\` introuvable.`),
      });
      return;
    }

    const helpText = MessageFormatter.commandHelp(
      command.name,
      command.description,
      command.usage
    );

    if (reply) {
      await reply(MessageFormatter.createMessageWithImage(helpText));
    } else {
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(helpText));
    }
  },
};
