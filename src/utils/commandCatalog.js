const config = require('../config');
const ModuleManager = require('./ModuleManager');
const MessageFormatter = require('./messageFormatter');

const SECTIONS = [
  { id: 'bot', title: 'Bot', module: null, order: 10 },
  { id: 'admin', title: 'Admin', module: null, order: 20 },
  { id: 'profile', title: 'Profil et XP', module: 'xp', order: 30 },
  { id: 'quests', title: 'Quetes', module: 'quete', order: 40 },
  { id: 'inventory', title: 'Inventaire', module: 'items', order: 50 },
  { id: 'games', title: 'Jeux et fun', module: 'fun', order: 60 },
  { id: 'anime', title: 'Anime et images', module: 'anime', order: 70 },
  { id: 'nsfw', title: 'NSFW', module: 'nsfw', order: 80 },
  { id: 'mlbb', title: 'MLBB', module: 'mlbb', order: 90 },
  { id: 'media', title: 'Media et tools', module: null, order: 100 },
  { id: 'other', title: 'Autres', module: null, order: 110 },
];

const SOURCE_SECTION = {
  ADMIN: 'admin',
  ANIME: 'anime',
  ASSETS: 'anime',
  BOT: 'bot',
  CLASSEMENTS: 'profile',
  COMBATS: 'games',
  DEBUG: 'bot',
  DOWNLOAD: 'media',
  FUN: 'games',
  GAMING: 'mlbb',
  GOLD: 'profile',
  HENTAI: 'nsfw',
  IMAGES: 'anime',
  INVENTAIRE: 'inventory',
  LOOT: 'inventory',
  MEDIA: 'media',
  'MINI-JEUX': 'games',
  PROFIL: 'profile',
  QUETES: 'quests',
  QUIZ: 'games',
  SEARCH: 'media',
  SOCIAL: 'games',
  TOOLS: 'media',
  UTIL: 'bot',
  UTILITY: 'games',
};

const COMMAND_SECTION_OVERRIDES = {
  activatebot: 'admin',
  boahancook: 'nsfw',
  desactivatebot: 'admin',
  hentai: 'nsfw',
  hentaivd: 'nsfw',
  neko: 'nsfw',
  nsfw: 'nsfw',
};

const COMMAND_MODULE_OVERRIDES = {
  activatebot: null,
  admins: null,
  allowhentai: null,
  boahancook: 'nsfw',
  desactivatebot: null,
  groupatlas: null,
  groupinfo: null,
  hentai: 'nsfw',
  hentaivd: 'nsfw',
  modatlas: null,
  neko: 'nsfw',
  nsfw: 'nsfw',
  selectpack: null,
  setmodule: null,
  theme: null,
};

function normalizeToken(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '');
}

function normalizeCategory(value = '') {
  return String(value || 'AUTRES')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim() || 'AUTRES';
}

function sectionById(id) {
  return SECTIONS.find((section) => section.id === id) || SECTIONS[SECTIONS.length - 1];
}

function commandName(command) {
  return normalizeToken(command?.name || '');
}

function commandAliases(command) {
  return Array.isArray(command?.aliases)
    ? command.aliases.map((alias) => normalizeToken(alias)).filter(Boolean)
    : [];
}

function sectionForCommand(command) {
  const name = commandName(command);
  const override = COMMAND_SECTION_OVERRIDES[name];
  if (override) return sectionById(override);

  const source = normalizeCategory(command?.category);
  return sectionById(SOURCE_SECTION[source] || 'other');
}

function moduleForCommand(command) {
  const name = commandName(command);
  if (Object.prototype.hasOwnProperty.call(COMMAND_MODULE_OVERRIDES, name)) {
    return COMMAND_MODULE_OVERRIDES[name];
  }

  return sectionForCommand(command).module;
}

function moduleEnabled(moduleName, groupModules = null) {
  if (!moduleName) return true;

  const defaults = ModuleManager.MODULES[moduleName];
  const defaultEnabled = defaults ? defaults.enabled !== false : true;
  if (!groupModules) return defaultEnabled;

  return groupModules[moduleName] ?? defaultEnabled;
}

function getGroupModules(groupJid, isGroup) {
  if (!isGroup || !groupJid) return null;
  return ModuleManager.getGroupModules(groupJid);
}

function buildContext({ groupJid = '', isGroup = false, groupModules = null } = {}) {
  const resolvedGroupModules = groupModules || getGroupModules(groupJid, isGroup);
  return {
    groupJid,
    isGroup: Boolean(isGroup),
    groupModules: resolvedGroupModules,
  };
}

function commandVisible(command, context = {}) {
  if (!context.isGroup) return true;
  return moduleEnabled(moduleForCommand(command), context.groupModules);
}

function commandSort(left, right) {
  const leftSection = sectionForCommand(left);
  const rightSection = sectionForCommand(right);
  if (leftSection.order !== rightSection.order) return leftSection.order - rightSection.order;
  return String(left.name).localeCompare(String(right.name));
}

function commandLabel(command, { includeAliases = true } = {}) {
  const aliases = commandAliases(command);
  const visibleAliases = includeAliases
    ? aliases.slice(0, 4).map((alias) => `${config.PREFIX}${alias}`)
    : [];
  const more = aliases.length > visibleAliases.length ? ` +${aliases.length - visibleAliases.length}` : '';

  return visibleAliases.length > 0
    ? `${config.PREFIX}${command.name} (${visibleAliases.join(', ')}${more})`
    : `${config.PREFIX}${command.name}`;
}

function commandFlags(command, context = {}) {
  const flags = [];
  const moduleName = moduleForCommand(command);
  if (moduleName && context.isGroup) flags.push(moduleName);
  if (command.adminOnly) flags.push('admin');
  if (command.groupOnly) flags.push('groupe');
  if (command.ownerOnly) flags.push('owner');
  return flags.length ? ` [${flags.join(', ')}]` : '';
}

function commandEntry(command, context = {}) {
  const description = MessageFormatter.cleanText(command.description || command.usage || 'Commande disponible.');
  return `\`${commandLabel(command)}\`${commandFlags(command, context)} - ${description}`;
}

function commandShortEntry(command) {
  return `\`${commandLabel(command, { includeAliases: false })}\``;
}

function buildSections(commands = [], context = {}) {
  const buckets = new Map();

  commands
    .filter((command) => command && command.name && commandVisible(command, context))
    .sort(commandSort)
    .forEach((command) => {
      const section = sectionForCommand(command);
      if (!buckets.has(section.id)) {
        buckets.set(section.id, { ...section, commands: [] });
      }
      buckets.get(section.id).commands.push(command);
    });

  return SECTIONS
    .map((section) => buckets.get(section.id))
    .filter((section) => section && section.commands.length > 0);
}

function findSection(sections = [], rawTarget = '') {
  const target = normalizeToken(rawTarget);
  if (!target) return null;

  const index = Number.parseInt(target, 10);
  if (Number.isInteger(index) && index > 0) {
    return sections[index - 1] || null;
  }

  return sections.find((section) => {
    const title = normalizeToken(section.title);
    return section.id === target || title === target || title.startsWith(target);
  }) || null;
}

function moduleSummary(context = {}) {
  if (!context.isGroup) return 'Contexte DM: toutes les categories sont visibles.';

  const modules = context.groupModules || {};
  const active = [];
  const inactive = [];

  Object.entries(ModuleManager.MODULES).forEach(([id, module]) => {
    const enabled = moduleEnabled(id, modules);
    const label = module.name || id;
    (enabled ? active : inactive).push(label);
  });

  return [
    active.length ? `Actifs: ${active.join(', ')}` : 'Actifs: -',
    inactive.length ? `Inactifs: ${inactive.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

function sectionOverviewLine(section, index, context = {}, options = {}) {
  const modulePart = section.module && context.isGroup
    ? ` - module ${section.module}`
    : '';
  const command = options.command || 'menu';
  return `${index + 1}. *${section.title}* (${section.commands.length})${modulePart} - ${config.PREFIX}${command} ${index + 1}`;
}

module.exports = {
  buildContext,
  buildSections,
  commandEntry,
  commandLabel,
  commandShortEntry,
  commandVisible,
  findSection,
  moduleForCommand,
  moduleSummary,
  sectionOverviewLine,
};
