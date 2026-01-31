const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'ship',
  description: 'Shipper deux personnes',
  category: 'FUN',
  usage: '!ship @user1 @user2',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length < 2) {
      if (reply) {
        await reply({ text: MessageFormatter.error('Utilisation: \`!ship @user1 @user2\`') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Utilisation: \`!ship @user1 @user2\`') });
      }
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

    const shipItems = [
      { label: 'Compatibilité', value: `${compatibility}%` },
      { label: 'Verdict', value: response }
    ];

    const ship = MessageFormatter.elegantBox('𝔖𝔋𝔌𝔓', shipItems);
    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(ship));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(ship));
      }
  }
};
