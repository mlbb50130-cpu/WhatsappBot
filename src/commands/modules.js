const ModuleManager = require('../../utils/ModuleManager');

module.exports = {
  name: 'modules',
  aliases: ['mods'],
  category: 'info',
  description: 'Voir les modules disponibles du groupe',
  cooldown: 3,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');

      if (!isGroup) {
        return sock.sendMessage(jid, {
          text: `⚙️ *MODULES GLOBAUX*\n\n` +
                `Ces modules sont disponibles:\n\n` +
                Object.entries(ModuleManager.MODULES)
                  .map(([key, mod]) => `🔹 *${mod.name}* (\`${key}\`)\n   ${mod.description}`)
                  .join('\n\n')
        });
      }

      const status = ModuleManager.getGroupStatus(jid);
      let text = `⚙️ *ÉTAT DES MODULES - ${jid.split('@')[0]}*\n\n`;

      const enabledMods = [];
      const disabledMods = [];

      for (const [moduleName, data] of Object.entries(status)) {
        const line = `${data.name} (\`${moduleName}\`)`;
        if (data.enabled) {
          enabledMods.push(`✅ ${line}`);
        } else {
          disabledMods.push(`❌ ${line}`);
        }
      }

      text += `*ACTIVÉS:*\n${enabledMods.join('\n')}\n\n`;
      text += `*DÉSACTIVÉS:*\n${disabledMods.join('\n')}\n\n`;
      text += `*Commandes (Admin):*\n`;
      text += `!setmodule on <module> - Activer\n`;
      text += `!setmodule off <module> - Désactiver`;

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur modules:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
