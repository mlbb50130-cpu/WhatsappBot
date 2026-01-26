const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'pfc',
  description: 'Pierre-Feuille-Ciseaux otaku',
  category: 'MINI-JEUX',
  usage: '!pfc pierre',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  choices: ['pierre', 'feuille', 'ciseaux'],
  rewards: {
    win: 20,
    lose: 5,
    draw: 10
  },

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const userChoice = args[0]?.toLowerCase();

    if (!userChoice || !this.choices.includes(userChoice)) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Utilisation: \`!pfc pierre\` / \`!pfc feuille\` / \`!pfc ciseaux\`')
      });
      return;
    }

    const botChoice = RandomUtils.choice(this.choices);
    const userChoiceIndex = this.choices.indexOf(userChoice);
    const botChoiceIndex = this.choices.indexOf(botChoice);

    let result = '';
    let reward = 0;

    if (userChoiceIndex === botChoiceIndex) {
      result = '🤝 ÉGALITÉ!';
      reward = this.rewards.draw;
    } else if (
      (userChoiceIndex === 0 && botChoiceIndex === 2) ||
      (userChoiceIndex === 1 && botChoiceIndex === 0) ||
      (userChoiceIndex === 2 && botChoiceIndex === 1)
    ) {
      result = '🏆 TU GAGNES!';
      reward = this.rewards.win;
      user.stats.wins += 1;
    } else {
      result = '💔 TU PERDS!';
      reward = this.rewards.lose;
      user.stats.losses += 1;
    }

    user.xp += reward;
    await user.save();

    const pfcItems = [
      { label: '🎴 Ton choix', value: userChoice.toUpperCase() },
      { label: '🤖 Mon choix', value: botChoice.toUpperCase() },
      { label: '⚔️ Résultat', value: result },
      { label: '⭐ Récompense', value: `+${reward} XP` }
    ];

    const text = MessageFormatter.elegantBox('🎮 PFC 🎮', pfcItems);

    await sock.sendMessage(senderJid, { text });
  }
};
