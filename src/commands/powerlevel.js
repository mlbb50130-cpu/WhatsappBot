const MessageFormatter = require('../utils/messageFormatter');
const Combat = require('../utils/combat');

module.exports = {
  name: 'powerlevel',
  description: 'Voir ta puissance de combat',
  category: 'PROFIL',
  usage: '!powerlevel',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      // On reflete l'etat reel du chakra (peut influencer la puissance)
      Combat.refreshChakra(user);

      const rating = user.powerLevel || 100;       // rating de combat (evolue via ELO)
      const levelBonus = (user.level || 1) * 10;
      const base = Combat.basePower(user);          // rating + niveau
      const chakraPct = Math.round(Combat.chakraRatio(user) * 100);
      const effective = Math.round(Combat.combatPower(user)); // base module par le chakra

      const powerMessage = `
╔════════════════════════════════════╗
║        ⚡ 𝔓𝔘𝔌𝔖𝔖𝔄𝔑𝔆𝔈 ⚡             ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
⚡ *Puissance de combat:* ${effective}

📊 *Details:*
  🏅 Rating de combat: ${rating}
  🎖️ Bonus de niveau: +${levelBonus}
  🔵 Modificateur chakra: ${chakraPct}% (x${(0.85 + 0.15 * Combat.chakraRatio(user)).toFixed(2)})
  = Base ${base} -> Effectif ${effective}

📈 *Stats:*
  Duels: ${user.stats?.duels || 0}
  Victoires: ${user.stats?.wins || 0}
  Defaites: ${user.stats?.losses || 0}

${effective > 1500 ? '🌟 Puissance incroyable!' : effective > 600 ? '💪 Tres puissant!' : '⏳ Continue de progresser!'}
═════════════════════════════════════`;

      await send({ text: powerMessage });
    } catch (error) {
      await send({ text: '❌ Erreur!' });
    }
  },
};
