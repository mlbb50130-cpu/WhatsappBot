const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');
const {
  buildContext,
  buildSections,
  commandEntry,
  findSection,
  moduleSummary,
  sectionOverviewLine,
} = require('../utils/commandCatalog');

const COMMANDS_PER_PAGE = 10;

function getUniqueCommands() {
  const handler = require('../handler');
  return handler.getAllCommands()
    .filter((command) => command && command.name)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)));
}

function getPageCommands(commands, pageNum) {
  const start = (pageNum - 1) * COMMANDS_PER_PAGE;
  return commands.slice(start, start + COMMANDS_PER_PAGE);
}

function buildDocumentationIndex(commands, sections, context) {
  const visibleCount = sections.reduce((count, section) => count + section.commands.length, 0);
  return MessageFormatter.panel({
    title: 'Documentation commandes',
    subtitle: `${visibleCount}/${commands.length} commandes visibles`,
    body: [
      moduleSummary(context),
      '',
      ...sections.map((section, index) => sectionOverviewLine(section, index, context, { command: 'documentation' })),
    ],
    footer: `Detail: ${config.PREFIX}documentation <numero categorie>.`,
  });
}

function buildDocumentationSection(section, sectionIndex, pageNum, context) {
  const totalPages = Math.max(1, Math.ceil(section.commands.length / COMMANDS_PER_PAGE));
  const safePage = Math.min(Math.max(pageNum, 1), totalPages);
  const body = getPageCommands(section.commands, safePage).map((command) => commandEntry(command, context));

  return MessageFormatter.panel({
    title: `Documentation - ${section.title}`,
    subtitle: `Categorie ${sectionIndex + 1} - Page ${safePage}/${totalPages}`,
    body,
    footer: `Retour: ${config.PREFIX}documentation. Suite: ${config.PREFIX}documentation ${sectionIndex + 1} ${safePage < totalPages ? safePage + 1 : 1}.`,
  });
}

function buildDocumentationPage(target = '', pageNum = 1, options = {}) {
  const commands = getUniqueCommands();
  const context = buildContext(options);
  const sections = buildSections(commands, context);
  const section = findSection(sections, target);

  if (!section) return buildDocumentationIndex(commands, sections, context);

  return buildDocumentationSection(section, sections.indexOf(section), pageNum, context);
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
      const target = args[0] || '';
      const pageNum = parseInt(args[1], 10) || 1;
      const responseText = buildDocumentationPage(target, pageNum, {
        groupJid: senderJid,
        isGroup,
      });

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
