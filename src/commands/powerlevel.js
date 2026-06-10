const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'powerlevel',
  description: 'Voir ton power level',
  category: 'PROFIL',
  usage: '!powerlevel [@user]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Calculate power level based on stats
      const basePower = user.level * 100;
      const xpBonus = Math.floor(user.xp / 10);
      const duelBonus = (user.stats?.wins || 0) * 50;
      const powerLevelBonus = user.powerLevel || 100;
      const totalPower = basePower + xpBonus + duelBonus + powerLevelBonus;

      const powerMessage = `
╔════════════════════════════════════╗
║        ⚡ 𝔓𝔒𝔚𝔈𝔕 𝔏𝔈𝔙𝔈𝔏 ⚡           ║
╚════════════════════════════════════╝

👤 *Utilisateur:* ${user.username || 'Joueur'}
⚡ *Power Level:* ${totalPower}

📊 *Détails:*
  Base (Level): +${basePower}
  XP: +${xpBonus}
  Duels gagnés: +${duelBonus}
  Combat Power: +${powerLevelBonus}

📈 *Stats:*
  Duels: ${user.stats?.duels || 0}
  Victoires: ${user.stats?.wins || 0}
  Défaites: ${user.stats?.losses || 0}

${totalPower > 5000 ? '🌟 Puissance incroyable!' : totalPower > 2000 ? '💪 Très puissant!' : '⏳ Continue de progresser!'}

═════════════════════════════════════`;

      if (reply) {
        await reply({ text: powerMessage });
      } else {
        await sock.sendMessage(senderJid, { text: powerMessage });
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
