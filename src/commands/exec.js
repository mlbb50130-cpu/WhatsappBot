const util = require('util');
const MessageFormatter = require('../utils/messageFormatter');
const PermissionManager = require('../utils/permissions');

function formatResult(result) {
  if (typeof result === 'string') return result;
  return util.inspect(result, {
    depth: 2,
    maxArrayLength: 20,
    breakLength: 90,
  });
}

module.exports = {
  name: 'exec',
  aliases: ['run'],
  description: 'Executer du JavaScript sur le bot (proprietaire uniquement)',
  category: 'BOT',
  usage: '!exec <code>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const participantJid = message.key.participant || jid;

    if (!PermissionManager.isAdmin(participantJid)) {
      const text = MessageFormatter.error('Commande reservee au proprietaire du bot.');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    const code = args.join(' ').trim();
    if (!code) {
      const text = MessageFormatter.warning('Utilise: !exec <code JavaScript>');
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction('sock', 'message', 'user', 'groupData', 'require', 'process', code);
      const result = await fn(sock, message, user, groupData, require, process);
      const output = MessageFormatter.limitText(formatResult(result) || 'Code execute.', 18, 1400);
      const text = MessageFormatter.panel({
        title: 'Exec',
        body: [`\`\`\`js\n${output}\n\`\`\``],
      });

      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    } catch (error) {
      const text = MessageFormatter.publicError('Execution impossible', error);
      return reply ? reply({ text }) : sock.sendMessage(jid, { text });
    }
  },
};
