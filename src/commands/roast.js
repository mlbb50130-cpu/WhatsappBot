const RandomUtils = require('../utils/random');
const MessageParser = require('../utils/messageParser');

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
    'T\'es plus faible qu\'un Hyuga sans Byakugan',
    'T\'as tellement peu de chance que même les dés te fuient',
    'T\'es le type de gars qui rate les quêtes faciles',
    'Tes compétences c\'est comme un doujinshi: imaginaire',
    'Tu fais te penser à un personnage de remplissage',
    'Même Death Note refuserait d\'écrire ton nom',
    'T\'es l\'exemple parfait du mec qui ne va nulle part',
    'Tes ambitions: aussi visibles qu\'un fantôme en day',
    'T\'es le type qui meurt toujours en premier dans les boss',
    'Si t\'étais un perso anime, tu serais le comic relief sans talent',
    'Ta vie c\'est un gag de mauvais goût',
    'T\'es aussi utile qu\'un perso qui disparaît après 1 arc',
    'Franchement, even les redoublants te pitient',
    'T\'es proof que pas tout le monde peut réussir',
    'T\'as plus de flops que de vrais succès',
    'Tu me rappelles un Arc qui aurait pas dû exister',
    'Tes défauts se comptent plus qu\'une année scolaire',
    'T\'es tellement débile que même les IA te quittent',
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Extract mention using new parser
    const mentions = MessageParser.extractMentions(message);
    
    let targetUser = user;
    if (mentions.length > 0) {
      const User = require('../models/User');
      targetUser = await User.findOne({ jid: mentions[0] }) || user;
    }

    const roast = RandomUtils.choice(this.roasts);

    const text = `
╔════════════════════════════════════════╗
║           🔥 ROAST OTAKU 🔥           ║
╚════════════════════════════════════════╝

*🎤 ${roast}*

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text });
  }
};
