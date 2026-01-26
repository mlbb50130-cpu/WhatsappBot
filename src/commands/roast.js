const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'roast',
  description: 'Faire un roast otaku',
  category: 'FUN',
  usage: '!roast @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  roasts: [
    'Ton profil est plus vide qu\'un manga arc SoL',
    'T\'es comme Naruto au début: inutile 💀',
    'Franchement, tu as plus de défaites que Sasuke a de défauts',
    'T\'es un NPC in real life',
    'Ta chance du jour c\'est moins que 1%',
    'Tu joues ce jeu comme Ichigo se bat: mal',
    'Tes stats sont aussi déprimantes qu\'un anime en hiatus',
    'T\'es le type qui se fait one-shot en premier',
    'Tu serais un bon faire-valoir pour quelqu\'un d\'autre',
    'Même les mobs de l\'intro te détestent',
    'T\'es l\'équivalent d\'un filler arc dans ton existence',
    'Tes victoires se comptent sur les doigts d\'une main de Naruto',
    'T\'es plus faible qu\'un Hyuga sans Byakugan'
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    let targetUser = user;
    if (mentions.length > 0) {
      const User = require('../models/User');
      targetUser = await User.findOne({ jid: mentions[0] }) || user;
    }

    const roast = RandomUtils.choice(this.roasts);
    
    const roastItems = [
      { label: 'Cible', value: targetUser.username },
      { label: 'Message', value: roast }
    ];

    const text = MessageFormatter.elegantBox('ROAST', roastItems);
    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(text));
  }
};
