const MessageFormatter = require('../utils/messageFormatter');
const config = require('../config');
const {
  buildContext,
  buildSections,
  commandShortEntry,
  findSection,
  moduleSummary,
  sectionOverviewLine,
} = require('../utils/commandCatalog');

function getCommands() {
  const handler = require('../handler');
  return handler.getAllCommands();
}

function buildMainMenu(sections, context) {
  return MessageFormatter.panel({
    title: 'Menu',
    subtitle: context.isGroup ? 'Categories selon les modules du groupe' : 'Categories disponibles',
    body: [
      moduleSummary(context),
      '',
      ...sections.map((section, index) => sectionOverviewLine(section, index, context)),
    ],
    footer: `Ouvre une categorie avec ${config.PREFIX}menu <numero>.`,
  });
}

function buildCategoryMenu(section, sectionIndex) {
  return MessageFormatter.panel({
    title: `${sectionIndex + 1}. ${section.title}`,
    body: section.commands.map(commandShortEntry),
    footer: `Detail: ${config.PREFIX}help <commande>. Retour: ${config.PREFIX}menu.`,
  });
}

module.exports = {
  name: 'menu',
  description: 'Affiche les commandes par categorie et modules actifs',
  category: 'BOT',
  usage: '!menu [categorie]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const context = buildContext({ groupJid: senderJid, isGroup });
    const sections = buildSections(getCommands(), context);
    const target = args[0] || '';
    const section = findSection(sections, target);

    if (target && !section) {
      const text = MessageFormatter.warning(`Categorie introuvable. Choisis 1 a ${sections.length}.`);
      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(senderJid, { text });
      }
      return;
    }

    const text = section
      ? buildCategoryMenu(section, sections.indexOf(section))
      : buildMainMenu(sections, context);

    if (reply) {
      await reply({ text });
    } else {
      await sock.sendMessage(senderJid, { text });
    }
  },
};
