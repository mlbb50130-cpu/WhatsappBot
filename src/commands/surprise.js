const MessageFormatter = require('../utils/messageFormatter');
const Luck = require('../utils/luck');

module.exports = {
  name: 'surprise',
  description: 'Obtenir une surprise aléatoire',
  category: 'FUN',
  usage: '!surprise',
  adminOnly: false,
  groupOnly: true,
  cooldown: 120, // 2 minutes

  surpriseTable: [
    { emoji: '✨', name: 'Éclat de magie', reward: 25, type: 'xp' },
    { emoji: '💎', name: 'Cristal rare', reward: 50, type: 'xp' },
    { emoji: '🌟', name: 'Étoile brillante', reward: 100, type: 'xp' },
    { emoji: '🎁', name: 'Cadeau mystérieux', reward: 200, type: 'gold' },
    { emoji: '⚡', name: 'Foudre d\'énergie', reward: 30, type: 'xp' },
    { emoji: '🔥', name: 'Flamme ardente', reward: 40, type: 'xp' },
    { emoji: '❄️', name: 'Glaçon éternel', reward: 35, type: 'xp' },
    { emoji: '🌊', name: 'Goutte marine', reward: 15, type: 'chakra' },
    { emoji: '🍀', name: 'Trèfle porte-bonheur', reward: 50, type: 'xp' },
    { emoji: '👑', name: 'Couronne d\'or', reward: 500, type: 'gold' }
  ],

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Chance de super-surprise influencee par la chance du jour (5% a 30%)
      const isSuperSurprise = Math.random() < (0.05 + Luck.luckFactor(user) * 0.25);
      const surprises = isSuperSurprise 
        ? this.surpriseTable.filter(s => s.reward >= 100)
        : this.surpriseTable;

      const surprise = surprises[Math.floor(Math.random() * surprises.length)];

      let rewardText = '';
      let saveUser = true;

      if (surprise.type === 'xp') {
        user.xp += surprise.reward;
        rewardText = `+${surprise.reward} XP`;
      } else if (surprise.type === 'gold') {
        user.gold = (user.gold || 0) + surprise.reward;
        rewardText = `+${surprise.reward} Gold`;
      } else if (surprise.type === 'chakra') {
        user.chakra = Math.min(user.chakra + surprise.reward, user.maxChakra);
        rewardText = `+${surprise.reward} Chakra`;
      }

      if (saveUser) {
        await user.save();
      }

      const surpriseMsg = `
╔════════════════════════════════════════╗
║       🎉 SURPRISE ALÉATOIRE! 🎉       ║
╚════════════════════════════════════════╝

${surprise.emoji} ${surprise.emoji} ${surprise.emoji}
${isSuperSurprise ? '✨ SUPER ' : ''}SURPRISE: ${surprise.name}
${surprise.emoji} ${surprise.emoji} ${surprise.emoji}

💰 Récompense: ${rewardText}

═════════════════════════════════════════
${isSuperSurprise ? 'WOW! Tu as trouvé une SUPER SURPRISE! 🤑' : 'Quelle chance! 🍀'}
`;

      if (reply) {
        await reply({ text: surpriseMsg });
      } else {
        await sock.sendMessage(senderJid, { text: surpriseMsg });
      }

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
