const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'roulette',
  description: 'Roulette russe - Gagne ou perd de l\'or',
  category: 'MINI-JEUX',
  usage: '!roulette',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const chance = RandomUtils.range(1, 6);
    const win = chance > 2; // 4/6 chance de gagner

    const gold = 500;
    const rouletteItems = [
      { label: '🎲 Résultat', value: win ? '✅ SURVÉCU!' : '💥 TOUCHÉ!' },
      { label: '💰 Or', value: win ? `+${gold} gold` : `-${gold} gold` },
      { label: '⭐ XP', value: win ? '+100 XP' : '+20 XP' }
    ];
    
    const result = MessageFormatter.elegantBox('🎰 ROULETTE 🎰', rouletteItems);

    user.xp += win ? 100 : 20;
    await user.save();

    await sock.sendMessage(senderJid, { text: result });
  }
};
