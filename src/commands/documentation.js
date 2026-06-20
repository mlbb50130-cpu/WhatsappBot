const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');

const COMMANDS_PER_PAGE = 10;

function normalizeCategory(category = '') {
  return String(category || 'AUTRES')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim() || 'AUTRES';
}

function commandLabel(command) {
  const aliases = Array.isArray(command.aliases)
    ? command.aliases.map((alias) => String(alias || '').trim()).filter(Boolean)
    : [];
  const visibleAliases = aliases.slice(0, 4).map((alias) => `${config.PREFIX}${alias}`);
  const more = aliases.length > visibleAliases.length ? ` +${aliases.length - visibleAliases.length}` : '';

  return visibleAliases.length > 0
    ? `${config.PREFIX}${command.name} (${visibleAliases.join(', ')}${more})`
    : `${config.PREFIX}${command.name}`;
}

function commandFlags(command) {
  const flags = [];
  if (command.adminOnly) flags.push('admin');
  if (command.groupOnly) flags.push('groupe');
  if (command.ownerOnly) flags.push('owner');
  return flags.length ? ` [${flags.join(', ')}]` : '';
}

function commandEntry(command) {
  const description = MessageFormatter.cleanText(command.description || command.usage || 'Commande disponible.');
  return `\`${commandLabel(command)}\`${commandFlags(command)} - ${description}`;
}

function getUniqueCommands() {
  const handler = require('../handler');
  return handler.getAllCommands()
    .filter((command) => command && command.name)
    .sort((left, right) => {
      const categoryCompare = normalizeCategory(left.category).localeCompare(normalizeCategory(right.category));
      if (categoryCompare !== 0) return categoryCompare;
      return String(left.name).localeCompare(String(right.name));
    });
}

function getPageCommands(commands, pageNum) {
  const start = (pageNum - 1) * COMMANDS_PER_PAGE;
  return commands.slice(start, start + COMMANDS_PER_PAGE);
}

function buildCategorySummary(commands) {
  const counts = new Map();
  commands.forEach((command) => {
    const category = normalizeCategory(command.category);
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, count]) => `${category}: ${count}`);
}

function buildDocumentationPage(pageNum) {
  const commands = getUniqueCommands();
  const totalPages = Math.max(1, Math.ceil(commands.length / COMMANDS_PER_PAGE));
  const safePage = Math.min(Math.max(pageNum, 1), totalPages);
  const pageCommands = getPageCommands(commands, safePage);

  const body = pageCommands.map(commandEntry);
  if (safePage === 1) {
    body.unshift(...buildCategorySummary(commands).slice(0, 6));
  }

  return MessageFormatter.panel({
    title: 'Documentation commandes',
    subtitle: `Page ${safePage}/${totalPages} - ${commands.length} commandes`,
    body,
    footer: `Page suivante: ${config.PREFIX}documentation ${safePage < totalPages ? safePage + 1 : 1}. Detail: ${config.PREFIX}help <commande>.`,
  });
}

module.exports = {
  name: 'documentation',
  aliases: ['docs', 'commandes', 'commands'],
  description: 'Liste toutes les commandes chargees par le bot',
  category: 'BOT',
  usage: '!documentation [page]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      const pageNum = parseInt(args[0], 10) || 1;
      const responseText = buildDocumentationPage(pageNum);

      if (reply) {
        await reply({ text: responseText });
      } else {
        await sock.sendMessage(senderJid, { text: responseText });
      }
    } catch (error) {
      const text = MessageFormatter.error('Impossible d afficher la documentation pour le moment.');

      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(senderJid, { text });
      }
    }
  },

  buildDocumentationPage,
  getUniqueCommands,
};
