const ModuleManager = require('../utils/ModuleManager');

module.exports = {
  name: 'allowhentai',
  aliases: ['hentaiallow', 'authhentai'],
  description: 'Autoriser/interdire les commandes hentai dans le groupe',
  category: 'admin',
  usage: '!allowhentai on/off',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    const isGroup = jid.endsWith('@g.us');

    if (!isGroup) {
      return sock.sendMessage(jid, {
        text: '❌ Cette commande ne fonctionne que en groupe'
      });
    }

    try {
      // Vérifier si admin
      const groupMetadata = await sock.groupMetadata(jid);
      const senderIsAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

      if (!senderIsAdmin) {
        return sock.sendMessage(jid, {
          text: '🚫 Seuls les administrateurs peuvent utiliser cette commande.'
        });
      }

      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '📝 **Usage:** !allowhentai on/off\n\n' +
                '!allowhentai on → Autoriser hentai/hentaivd\n' +
                '!allowhentai off → Interdire hentai/hentaivd'
        });
      }

      const action = args[0].toLowerCase();

      if (action !== 'on' && action !== 'off') {
        return sock.sendMessage(jid, {
          text: '❌ Argument invalide! Utilise: !allowhentai on/off'
        });
      }

      const isAllowed = action === 'on';
      const modules = ModuleManager.loadModules();
      
      if (!modules[jid]) {
        modules[jid] = {};
        Object.keys(ModuleManager.MODULES).forEach(key => {
          modules[jid][key] = ModuleManager.MODULES[key].enabled;
        });
      }

      modules[jid]['nsfw'] = isAllowed;
      ModuleManager.saveModules(modules);

      const message_text = isAllowed 
        ? `✅ Les commandes !hentai et !hentaivd sont maintenant **autorisées** dans ce groupe!`
        : `❌ Les commandes !hentai et !hentaivd sont maintenant **interdites** dans ce groupe!`;

      return sock.sendMessage(jid, { text: message_text });

    } catch (error) {
      console.error(`[ALLOWHENTAI] Error: ${error.message}`);
      sock.sendMessage(jid, { text: '❌ Erreur lors de la mise à jour des paramètres.' });
    }
  }
};
