// COMMANDE: !selectpack - Sélectionner un pack de commandes
const PackManager = require('../utils/PackManager');

module.exports = {
  name: 'selectpack',
  aliases: ['pack', 'choosepack', 'packselect'],
  category: 'admin',
  description: 'Sélectionner un pack de commandes pour le groupe',
  usage: '!selectpack <numéro ou nom>',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const from = message.key.remoteJid;
    const sender = message.key.participant || from;

    if (!args[0]) {
      const text = PackManager.getPackMessage();
      if (reply) {
        return await reply({ text });
      } else {
        return sock.sendMessage(from, { text });
      }
    }

    const choice = args[0].toLowerCase();
    let packId = null;

    // Gestion par numéro (1, 2, 3, 4)
    if (!isNaN(choice)) {
      const num = parseInt(choice) - 1;
      const packs = PackManager.getPacks();
      if (num >= 0 && num < packs.length) {
        packId = packs[num].id;
      }
    }
    // Gestion par nom
    else if (PackManager.PACKS[choice]) {
      packId = choice;
    }

    if (!packId) {
      const text = `❌ Pack "${choice}" non trouvé!\n\n${PackManager.getPackMessage()}`;
      if (reply) {
        return await reply({ text });
      } else {
        return sock.sendMessage(from, { text });
      }
    }

    // Appliquer le pack
    const pack = PackManager.applyPack(packId, from);

    if (!pack) {
      const text = `❌ Erreur lors de l'application du pack.`;
      if (reply) {
        return await reply({ text });
      } else {
        return sock.sendMessage(from, { text });
      }
    }

    // Marquer que la sélection est faite
    if (global.packSelections) {
      global.packSelections[from] = false;
    }

    const packModules = Object.entries(pack.modules)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => `• ${name}`)
      .join('\n');

    const text = `
✅ *Pack sélectionné!*

${pack.emoji} *${pack.name}*

🔧 *Modules activés:*
${packModules}

💡 *Utilisez:*
!setmodule on <module> - Activer un module
!setmodule off <module> - Désactiver un module
!setmodule status - Voir l'état actuel`;

    if (reply) {
      return await reply({ text });
    } else {
      return sock.sendMessage(from, { text });
    }
  }
};
