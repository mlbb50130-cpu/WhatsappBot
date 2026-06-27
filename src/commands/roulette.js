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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    const goldBet = 500;

    // Vérifier si l'utilisateur a assez d'or
    if ((user.gold || 0) < goldBet) {
      await sock.sendMessage(senderJid, {
        text: `❌ Tu n'as pas assez d'or pour jouer!\n💰 Tu as: ${user.gold || 0} gold | Coût: ${goldBet} gold\n💼 Utilise \`!work\` pour gagner du gold.`
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

    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(result));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(result));
      }
  }
};
