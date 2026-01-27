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

    // Vérifier si 24h ont passé pour réinitialiser le gold
    const now = Date.now();
    const lastReset = user.lastGoldReset ? new Date(user.lastGoldReset).getTime() : 0;
    const hoursPasssed = (now - lastReset) / (1000 * 60 * 60);
    
    if (hoursPasssed >= 24) {
      user.gold = 5000;
      user.lastGoldReset = new Date();
    }

    const goldBet = 500;
    
    // Vérifier si l'utilisateur a assez d'or
    if (user.gold < goldBet) {
      await sock.sendMessage(senderJid, {
        text: `❌ Tu n'as pas assez d'or pour jouer!\n💰 Tu as: ${user.gold} gold | Coût: ${goldBet} gold\n⏰ Ton solde se réinitialisera dans ${Math.ceil(24 - (hoursPasssed))}h`
      });
      return;
    }

    const chance = RandomUtils.range(1, 6);
    const win = chance > 2; // 4/6 chance de gagner
    
    // Déduire le coût d'utilisation de la roulette
    user.gold -= goldBet;
    
    // Ajouter XP seulement
    if (win) {
      user.xp += 100;
    } else {
      user.xp += 20;
    }

    const rouletteItems = [
      { label: '🎲 Résultat', value: win ? '✅ SURVÉCU!' : '💥 TOUCHÉ!' },
      { label: '💰 Or', value: `-${goldBet} gold` },
      { label: '⭐ XP', value: win ? '+100 XP' : '+20 XP' },
      { label: '🪙 Solde', value: `${user.gold} gold` }
    ];
    
    const result = MessageFormatter.elegantBox('🎰 𝔕𝔒𝔘𝔏𝔈𝔗𝔗𝔈 🎰', rouletteItems);

    await user.save();

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(result));
  }
};
