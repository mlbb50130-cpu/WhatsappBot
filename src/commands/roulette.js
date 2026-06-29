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

  dailyLimit: 25,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    const goldBet = 500;

    // Limite quotidienne d'utilisation (25/jour)
    const today = new Date();
    if (!user.rouletteUsageToday) user.rouletteUsageToday = { lastReset: today, count: 0 };
    const lastReset = new Date(user.rouletteUsageToday.lastReset || 0);
    if (lastReset.toDateString() !== today.toDateString()) {
      user.rouletteUsageToday.lastReset = today;
      user.rouletteUsageToday.count = 0;
    }
    if (user.rouletteUsageToday.count >= this.dailyLimit) {
      await user.save();
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning(`Limite atteinte: ${this.dailyLimit} roulettes par jour. Reviens demain!`)
      });
      return;
    }

    // Vérifier si l'utilisateur a assez d'or
    if ((user.gold || 0) < goldBet) {
      await sock.sendMessage(senderJid, {
        text: `❌ Tu n'as pas assez d'or pour jouer!\n💰 Tu as: ${user.gold || 0} gold | Coût: ${goldBet} gold\n💼 Utilise \`!work\` pour gagner du gold.`
      });
      return;
    }

    // Consommer une utilisation
    user.rouletteUsageToday.count += 1;

    // Probabilite de victoire influencee par le buff de chance (!chance)
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
      { label: '🪙 Solde', value: `${user.gold} gold` },
      { label: '🎟️ Restant', value: `${this.dailyLimit - user.rouletteUsageToday.count}/${this.dailyLimit} aujourd'hui` }
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
