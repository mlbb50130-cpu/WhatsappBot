const RandomUtils = require('../utils/random');

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
    const result = `
╔════════════════════════════════════════╗
║         🎰 ROULETTE RUSSE 🎰        ║
╚════════════════════════════════════════╝

🎲 Le cylindre tourne... \`*Clic*\`

${win ? '✅ SURVÉCU!' : '💥 TOUCHÉ!'}

${win ? `Tu as gagné 🪙 ${gold} gold!\n+100 XP` : `Tu as perdu 🪙 ${gold} gold!\nMais c'était amusant!`}

════════════════════════════════════════
`;

    user.xp += win ? 100 : 20;
    await user.save();

    await sock.sendMessage(senderJid, { text: result });
  }
};
