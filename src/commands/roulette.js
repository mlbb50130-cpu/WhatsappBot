const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const Luck = require('../utils/luck');

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

    // Probabilite de victoire influencee par la chance du jour (!chance)
    const win = Math.random() < Luck.winProbability(user);

    // Déduire la mise
    user.gold = (user.gold || 0) - goldBet;

    // Récompenses
    let goldWin = 0;
    let xpWin = 0;
    if (win) {
      goldWin = RandomUtils.range(800, 1500);   // gain net positif (mise deduite)
      xpWin = Math.min(500, RandomUtils.range(200, 500)); // xp plafonne a 500
      user.gold += goldWin;
      user.xp += xpWin;
    } else {
      xpWin = RandomUtils.range(10, 50); // petite consolation
      user.xp += xpWin;
    }

    const rouletteItems = [
      { label: '🎲 Résultat', value: win ? '✅ SURVÉCU!' : '💥 TOUCHÉ!' },
      { label: '💰 Or', value: win ? `+${goldWin - goldBet} gold (net)` : `-${goldBet} gold` },
      { label: '⭐ XP', value: `+${xpWin} XP` },
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
