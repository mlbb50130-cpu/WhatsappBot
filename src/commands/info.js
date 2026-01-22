module.exports = {
  name: 'info',
  description: 'Information du bot',
  category: 'BOT',
  usage: '!info',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const info = `
╔════════════════════════════════════════╗
║        🤖 INFO TETSUBOT 🤖           ║
╚════════════════════════════════════════╝

*BOT INFORMATION*
  ├─ Nom: TetsuBot
  ├─ Version: 1.0.0
  ├─ Type: Otaku RPG WhatsApp Bot
  ├─ Language: Node.js + JavaScript
  ├─ Database: MongoDB + Mongoose
  └─ Client: Baileys (Multi-Device)

*FONCTIONNALITÉS*
  ├─ 🎖️ Système de niveaux et XP
  ├─ 🎯 Quêtes et missions
  ├─ ⚔️ Système de duel PvP
  ├─ 📚 Quiz et mini-jeux
  ├─ 🎁 Système de loot
  ├─ 🎨 Images anime/manga
  ├─ 🔐 Système d'avertissements
  ├─ 👥 Gestion de groupe
  └─ ⚙️ Commandes admin

*STATISTIQUES*
  ├─ Utilisateurs actifs: ${user ? 'N/A' : '0'}
  ├─ Groupes: N/A
  ├─ Commandes: 30+
  └─ Uptime: N/A

*CRÉATEUR*
  └─ Développé par Shayne Dev

*SUPPORT*
  ├─ Prefix: \`!\`
  ├─ Utilise \`!help\` pour l'aide
  └─ Utilise \`!menu\` pour le menu

════════════════════════════════════════
Bon jeu! 🎮 Amusez-vous bien!
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: info });
  }
};
