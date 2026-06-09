const ModuleManager = require('../utils/ModuleManager');
const MessageFormatter = require('../utils/messageFormatter');

function normalize(value = '') {
  return String(value || '').trim().toLowerCase();
}

function validModules() {
  return Object.keys(ModuleManager.MODULES || {});
}

function buildStatus(groupJid) {
  const status = ModuleManager.getGroupStatus(groupJid);
  const body = Object.entries(status).map(([id, module]) => {
    const state = module.enabled ? 'on' : 'off';
    return `${id}: ${state} - ${module.name}`;
  });

  return MessageFormatter.panel({
    title: 'Modules',
    body,
    footer: 'Usage: !setmodule on <module> ou !setmodule off <module>',
  });
}

function setModule(groupJid, moduleName, enabled) {
  const modules = ModuleManager.loadModules();
  if (!modules[groupJid]) {
    modules[groupJid] = {};
    Object.keys(ModuleManager.MODULES).forEach((key) => {
      modules[groupJid][key] = ModuleManager.MODULES[key].enabled;
    });
  }

  modules[groupJid][moduleName] = enabled;
  ModuleManager.saveModules(modules);
  return modules[groupJid];
}

module.exports = {
  name: 'setmodule',
  aliases: ['module', 'modules'],
  description: 'Activer, desactiver ou afficher les modules du groupe',
  category: 'ADMIN',
  usage: '!setmodule status | !setmodule on mlbb | !setmodule off anime',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const action = normalize(args[0] || 'status');
    const moduleName = normalize(args[1]);

    if (['status', 'list', 'liste'].includes(action)) {
      return sock.sendMessage(jid, { text: buildStatus(jid) }, { quoted: message });
    }

    const enabled = action === 'on' || action === 'activer'
      ? true
      : action === 'off' || action === 'desactiver'
        ? false
        : null;

    if (enabled === null) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning('Utilise: !setmodule status, !setmodule on <module> ou !setmodule off <module>.'),
      }, { quoted: message });
    }

    if (!validModules().includes(moduleName)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.warning(`Module invalide. Modules: ${validModules().join(', ')}`),
      }, { quoted: message });
    }

    setModule(jid, moduleName, enabled);

    return sock.sendMessage(jid, {
      text: MessageFormatter.success(`Module ${moduleName}: ${enabled ? 'on' : 'off'}.`),
    }, { quoted: message });
  },
};
