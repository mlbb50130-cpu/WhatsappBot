const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'assets',
  description: 'Affiche toutes les commandes asset disponibles',
  category: 'BOT',
  usage: '!assets',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    const assetCommands = [
      { name: '!bleach', emoji: '⚪', description: 'Personnages de Bleach' },
      { name: '!boahancook', emoji: '🐍', description: 'Boa Hancock' },
      { name: '!deku', emoji: '⚡', description: 'Deku (My Hero Academia)' },
      { name: '!gojo', emoji: '👁️', description: 'Gojo (Jujutsu Kaisen)' },
      { name: '!gokuui', emoji: '⚡', description: 'Goku Ultra Instinct' },
      { name: '!husbando', emoji: '🎌', description: 'Husbando aléatoire' },
      { name: '!jinwoo', emoji: '⚔️', description: 'Sung Jinwoo (Solo Leveling)' },
      { name: '!livai', emoji: '❄️', description: 'Levi (Attack on Titan)' },
      { name: '!madara', emoji: '🔴', description: 'Madara Uchiha (Naruto)' },
      { name: '!makima', emoji: '🔴', description: 'Makima (Chainsaw Man)' },
      { name: '!miku', emoji: '🎤', description: 'Miku Nakano (HD)' },
      { name: '!mikunakano', emoji: '🎌', description: 'Miku Nakano (Quintessential Quintuplets)' },
      { name: '!naruto', emoji: '🧡', description: 'Naruto Uzumaki' },
      { name: '!nino', emoji: '🎌', description: 'NINO Nakano (Quintessential Quintuplets)' },
      { name: '!nsfw', emoji: '🔞', description: 'NSFW (18+)' },
      { name: '!rengokudemon', emoji: '🔥', description: 'Rengoku (Demon Slayer)' },
      { name: '!sukuna', emoji: '👹', description: 'Sukuna (Jujutsu Kaisen)' },
      { name: '!tengen', emoji: '⚔️', description: 'Tengen Uzui (Demon Slayer)' },
      { name: '!tsunade', emoji: '🏥', description: 'Tsunade (Naruto)' },
      { name: '!waifu', emoji: '🎌', description: 'Waifu aléatoire' },
      { name: '!yami', emoji: '⚫', description: 'Yami (Black Clover)' },
      { name: '!yoruichi', emoji: '🌙', description: 'Yoriuichi (Demon Slayer)' },
      { name: '!zerotwo', emoji: '🎌', description: 'Zero Two (Darling in the Franxx)' },
      { name: '!vegito', emoji: '🔵', description: 'Vegito (Dragon Ball Z)' }
    ];

    const adultCommands = [
      { name: '!hentai', emoji: '🔥', description: 'Hentai (2x/jour en groupe, 300 XP)' },
      { name: '!hentaivd', emoji: '🔞', description: 'Vidéos Hentai (2x/jour en groupe, 300 XP)' }
    ];

    let assetList = assetCommands.map(cmd => `${cmd.emoji} ${cmd.name} - ${cmd.description}`);
    let adultList = adultCommands.map(cmd => `${cmd.emoji} ${cmd.name} - ${cmd.description}`);

    const assetsMsg = `${MessageFormatter.elegantSection('🏛️ IMAGES CLASSIQUES', assetList)}\n\n${MessageFormatter.elegantSection('🔞 IMAGES ADULTES', adultList)}`;

    if (reply) {
        await reply({ text: assetsMsg });
      } else {
        await sock.sendMessage(senderJid, { text: assetsMsg });
      }
  }
};
