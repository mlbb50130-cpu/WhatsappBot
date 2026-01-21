const RandomUtils = require('../utils/random');
const MessageParser = require('../utils/messageParser');

module.exports = {
  name: 'ship',
  description: 'Shipper deux personnes',
  category: 'FUN',
  usage: '!ship @user1 @user2',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const mentions = MessageParser.extractMentions(message);
    
    if (mentions.length < 2) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: \`!ship @user1 @user2\`'
      });
      return;
    }

    const user1 = mentions[0];
    const user2 = mentions[1];

    // Generate compatibility
    const compatibility = RandomUtils.range(1, 100);

    let response = '';
    if (compatibility >= 80) {
      response = `💕💕 PARFAIT! ${compatibility}% de compatibilité!\nC'est la relation ultime!`;
    } else if (compatibility >= 60) {
      response = `💗 BON MATCH! ${compatibility}% de compatibilité!\nCela pourrait marcher!`;
    } else if (compatibility >= 40) {
      response = `💛 MOYEN! ${compatibility}% de compatibilité.\nC'est possible...`;
    } else if (compatibility >= 20) {
      response = `💙 DIFFICILE! ${compatibility}% de compatibilité.\nCa sera hard.`;
    } else {
      response = `💔 NON! ${compatibility}% de compatibilité.\nN'insiste pas!`;
    }

    const ship = `
╔════════════════════════════════════════╗
║         💕 SHIP OTAKU 💕             ║
╚════════════════════════════════════════╝

👤 ${user1} +
👤 ${user2}
═══════════════════════════════════════

${'❤️'.repeat(Math.floor(compatibility/10))}${'🤍'.repeat(10-Math.floor(compatibility/10))}

${response}

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: ship });
  }
};
