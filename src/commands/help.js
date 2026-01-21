module.exports = {
  name: 'help',
  description: 'Aide sur une commande',
  category: 'BOT',
  usage: '!help [commande]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const handler = require('../handler');

    if (!args[0]) {
      const help = `
╔════════════════════════════════════════╗
║          📚 AIDE DU BOT 📚            ║
╚════════════════════════════════════════╝

*UTILISATION GÉNÉRALE:*
Prefix: \`!\`
Exemple: \`!profil\`

*CATÉGORIES:*
  🟦 Utilise \`!help [catégorie]\`
  ├─ PROFIL
  ├─ QUIZ
  ├─ COMBATS
  ├─ LOOT
  ├─ IMAGES
  ├─ FUN
  ├─ ADMIN
  └─ BOT

*COMMANDES POPULAIRES:*
  ├─ \`!profil\` - Ton profil
  ├─ \`!level\` - Ton niveau
  ├─ \`!duel @user\` - Défier
  ├─ \`!quiz\` - Quiz otaku
  ├─ \`!loot\` - Ouvrir un loot
  ├─ \`!waifu\` - Image waifu
  ├─ \`!chance\` - Chance du jour
  └─ \`!menu\` - Menu complet

════════════════════════════════════════
Tape \`!help [nom_commande]\` pour plus d'infos!
`;

      await sock.sendMessage(senderJid, { text: help });
      return;
    }

    const commandName = args[0].toLowerCase();
    const command = handler.getCommand(commandName);

    if (!command) {
      await sock.sendMessage(senderJid, {
        text: `❌ Commande \`${commandName}\` non trouvée.`
      });
      return;
    }

    const helpText = `
╔════════════════════════════════════════╗
║       📖 AIDE - ${command.name.toUpperCase()} 📖      ║
╚════════════════════════════════════════╝

*📝 DESCRIPTION:*
${command.description}

*🎯 UTILISATION:*
\`${command.usage}\`

*📊 CATÉGORIE:*
${command.category}

*⚙️ PARAMÈTRES:*
  ├─ Admin uniquement: ${command.adminOnly ? '✅' : '❌'}
  ├─ Groupe requis: ${command.groupOnly ? '✅' : '❌'}
  └─ Cooldown: ${command.cooldown}s

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: helpText });
  }
};
