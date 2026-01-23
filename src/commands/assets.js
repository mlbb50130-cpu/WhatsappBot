module.exports = {
  name: 'assets',
  description: 'Affiche toutes les commandes asset disponibles',
  category: 'BOT',
  usage: '!assets',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const assetCommands = [
      { name: '!bleach', emoji: '⚪', description: 'Personnages de Bleach' },
      { name: '!boahancook', emoji: '🐍', description: 'Boa Hancock' },
      { name: '!deku', emoji: '💚', description: 'Deku (My Hero Academia)' },
      { name: '!gojo', emoji: '👁️', description: 'Gojo (Jujutsu Kaisen)' },
      { name: '!gokuui', emoji: '⚡', description: 'Goku Ultra Instinct' },
      { name: '!husbando', emoji: '😍', description: 'Husbando aléatoire' },
      { name: '!jinwoo', emoji: '💜', description: 'Sung Jinwoo (Solo Leveling)' },
      { name: '!livai', emoji: '❄️', description: 'Levi (Attack on Titan)' },
      { name: '!madara', emoji: '🔴', description: 'Madara Uchiha (Naruto)' },
      { name: '!makima', emoji: '🔴', description: 'Makima (Chainsaw Man)' },
      { name: '!miku', emoji: '💙', description: 'Miku Nakano (HD)' },
      { name: '!mikunakano', emoji: '💗', description: 'Miku Nakano (Quintessential Quintuplets)' },
      { name: '!naruto', emoji: '🧡', description: 'Naruto Uzumaki' },
      { name: '!nino', emoji: '💚', description: 'NINO Nakano (Quintessential Quintuplets)' },
      { name: '!nsfw', emoji: '🔞', description: 'NSFW (18+)' },
      { name: '!rengokudemon', emoji: '🔥', description: 'Rengoku (Demon Slayer)' },
      { name: '!sukuna', emoji: '👹', description: 'Sukuna (Jujutsu Kaisen)' },
      { name: '!tengen', emoji: '⚔️', description: 'Tengen Uzui (Demon Slayer)' },
      { name: '!tsunade', emoji: '💛', description: 'Tsunade (Naruto)' },
      { name: '!waifu', emoji: '🥰', description: 'Waifu aléatoire' },
      { name: '!yami', emoji: '🖤', description: 'Yami (Black Clover)' },
      { name: '!yoruihi', emoji: '🌙', description: 'Yoriichi (Demon Slayer)' },
      { name: '!zerotwo', emoji: '💕', description: 'Zero Two (Darling in the Franxx)' }
    ];

    let message_text = '📸 *COMMANDES ASSET DISPONIBLES*\n\n';
    message_text += '_Tapez n\'importe quelle commande pour voir une image aléatoire_\n\n';

    for (const cmd of assetCommands) {
      message_text += `${cmd.emoji} ${cmd.name} - ${cmd.description}\n`;
    }

    message_text += '\n💡 Chaque image rapporte 2-5 XP!\n';
    message_text += '⏱️ Cooldown: 3-5 secondes';

    await sock.sendMessage(senderJid, { text: message_text });
  }
};
