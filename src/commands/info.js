const MessageFormatter = require('../utils/messageFormatter');

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

    const infoItems = [
      { label: '📝 Nom', value: 'TetsuBot' },
      { label: '📌 Version', value: '1.0.0' },
      { label: '🎮 Type', value: 'Otaku RPG Bot' },
      { label: '💻 Language', value: 'Node.js' },
      { label: '💾 Database', value: 'MongoDB' }
    ];

    const featuresItems = [
      '🎖️ Système de niveaux',
      '🎯 Quêtes et missions',
      '⚡ Duels PvP',
      '🧠 Quiz/mini-jeux',
      '🎁 Système de loot',
      '🎨 Images anime',
      '🔐 Avertissements',
      '👥 Gestion groupe',
      '⚙️ Commandes admin'
    ];

    const statsItems = [
      { label: '👤 Utilisateurs', value: 'N/A' },
      { label: '👥 Groupes', value: 'N/A' },
      { label: '🎮 Commandes', value: '150+' },
      { label: '⏱️ Uptime', value: 'N/A' }
    ];

    const creatorItems = [
      '👨‍💻 Développé par: Shayne Dev',
      '📞 Support: !help / !menu',
      '🎮 Prefix: !'
    ];

    const info = `${MessageFormatter.elegantBox('🤖 INFO TETSUBOT 🤖', infoItems)}
${MessageFormatter.elegantSection('✨ FONCTIONNALITÉS', featuresItems)}
${MessageFormatter.elegantSection('📊 STATISTIQUES', statsItems)}
${MessageFormatter.elegantSection('👨‍💻 CRÉATEUR', creatorItems)}`;

    await sock.sendMessage(senderJid, { text: info });
  }
};
