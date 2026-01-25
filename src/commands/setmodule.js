const ModuleManager = require('../../utils/ModuleManager');

module.exports = {
  name: 'setmodule',
  aliases: ['module', 'modules'],
  category: 'admin',
  description: 'Gérer les modules du groupe',
  cooldown: 3,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const isGroup = jid.endsWith('@g.us');

      if (!isGroup) {
        return sock.sendMessage(jid, {
          text: '❌ Cette commande ne fonctionne que en groupe'
        });
      }

      // Vérifier si l'utilisateur est admin du groupe
      const groupMetadata = await sock.groupMetadata(jid);
      const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

      if (!isAdmin && sender !== jid.split('@')[0]) {
        return sock.sendMessage(jid, {
          text: '❌ Seuls les admins du groupe peuvent modifier les modules'
        });
      }

      if (!args.length) {
        return showModulesList(sock, jid);
      }

      const subcommand = args[0].toLowerCase();

      if (subcommand === 'on' || subcommand === 'enable') {
        return await enableModule(sock, jid, args[1]);
      } else if (subcommand === 'off' || subcommand === 'disable') {
        return await disableModule(sock, jid, args[1]);
      } else if (subcommand === 'status') {
        return showStatus(sock, jid);
      }

      return showModulesList(sock, jid);
    } catch (error) {
      console.error('Erreur setmodule:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};

function showModulesList(sock, jid) {
  let text = `⚙️ *MODULES DISPONIBLES*\n\n`;

  for (const [key, module] of Object.entries(ModuleManager.MODULES)) {
    text += `🔹 *${module.name}*\n`;
    text += `   ${module.description}\n`;
    text += `   Commandes: ${module.commands.slice(0, 3).join(', ')}...\n`;
    text += `   !setmodule on ${key} / !setmodule off ${key}\n\n`;
  }

  text += `*Commandes:*\n`;
  text += `!setmodule on <module> - Activer un module\n`;
  text += `!setmodule off <module> - Désactiver un module\n`;
  text += `!setmodule status - Voir l'état du groupe`;

  return sock.sendMessage(jid, { text });
}

async function enableModule(sock, jid, moduleName) {
  if (!moduleName) {
    return sock.sendMessage(jid, { text: '❌ Spécifie un module' });
  }

  if (!ModuleManager.MODULES[moduleName.toLowerCase()]) {
    return sock.sendMessage(jid, { text: `❌ Module "${moduleName}" non trouvé` });
  }

  const modules = ModuleManager.loadModules();
  if (!modules[jid]) {
    modules[jid] = {};
    Object.keys(ModuleManager.MODULES).forEach(key => {
      modules[jid][key] = ModuleManager.MODULES[key].enabled;
    });
  }

  modules[jid][moduleName.toLowerCase()] = true;
  ModuleManager.saveModules(modules);

  const module = ModuleManager.MODULES[moduleName.toLowerCase()];
  return sock.sendMessage(jid, {
    text: `✅ Module *${module.name}* activé!\n\n${module.commands.join(', ')}`
  });
}

async function disableModule(sock, jid, moduleName) {
  if (!moduleName) {
    return sock.sendMessage(jid, { text: '❌ Spécifie un module' });
  }

  if (!ModuleManager.MODULES[moduleName.toLowerCase()]) {
    return sock.sendMessage(jid, { text: `❌ Module "${moduleName}" non trouvé` });
  }

  const modules = ModuleManager.loadModules();
  if (!modules[jid]) {
    modules[jid] = {};
    Object.keys(ModuleManager.MODULES).forEach(key => {
      modules[jid][key] = ModuleManager.MODULES[key].enabled;
    });
  }

  modules[jid][moduleName.toLowerCase()] = false;
  ModuleManager.saveModules(modules);

  const module = ModuleManager.MODULES[moduleName.toLowerCase()];
  return sock.sendMessage(jid, {
    text: `🔴 Module *${module.name}* désactivé!`
  });
}

function showStatus(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  let text = `📊 *État des modules du groupe*\n\n`;

  for (const [moduleName, data] of Object.entries(status)) {
    const emoji = data.enabled ? '✅' : '❌';
    text += `${emoji} *${data.name}* (${moduleName})\n`;
    text += `   ${data.commands.slice(0, 5).join(', ')}${data.commands.length > 5 ? '...' : ''}\n\n`;
  }

  text += `*Pour activer/désactiver:*\n!setmodule on <module>\n!setmodule off <module>`;
  
  return sock.sendMessage(jid, { text });
}
