const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'blagueotaku',
  description: 'Affiche une blague otaku',
  category: 'FUN',
  usage: '!blagueotaku',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  jokes: [
    '💬 - Pourquoi les otakus ne sortent jamais?\n🎌 - Parce que dans anime ils trouvent tout ce dont ils ont besoin!',
    '💬 - Quelle est la différence entre un otaku et un ami?\n🎌 - Un otaku a des waifus comme amis!',
    '💬 - Comment reconnaître un vrai otaku?\n🎌 - Il ne sort jamais mais il visite 10 mondes différents par jour!',
    '💬 - Pourquoi les otakus adorent les lundi?\n🎌 - Parce que c\'est le jour où commencent les nouveaux anime!',
    '💬 - Quel est le sport favori des otakus?\n🎌 - Le binge-watching (regarder en binge)',
    '💬 - Si tu dois choisir entre l\'amour réel ou ton waifu?\n🎌 - L\'otaku hésite à peine 5 secondes!',
    '💬 - Combien de fois un otaku a-t-il regardé Evangelion?\n🎌 - 3 fois minimum mais jamais compris la fin!',
    '💬 - Quel est le pire cauchemar d\'un otaku?\n🎌 - Une panne Internet!',
    '💬 - Pourquoi les otakus font-ils de bons amis?\n🎌 - Parce qu\'ils comprennent la souffrance des arcs en hiatus!',
    '💬 - Quelle est la règle n°1 de l\'otaku?\n🎌 - Ne JAMAIS spoiler un anime! Jamais!'
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const joke = RandomUtils.choice(this.jokes);

    const jakeContent = `${joke}\n\n+5 XP pour avoir rigé!`;
    const text = MessageFormatter.box('😂 BLAGUE OTAKU 😂', jakeContent);

    user.xp += 5;
    await user.save();

    await sock.sendMessage(senderJid, { text });
  }
};
