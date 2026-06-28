const MessageFormatter = require('../utils/messageFormatter');
const Combat = require('../utils/combat');

module.exports = {
  name: 'chakra',
  description: 'Voir ton chakra (ressource de combat)',
  category: 'PROFIL',
  usage: '!chakra',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      const changed = Combat.refreshChakra(user);
      if (changed) await user.save();

      const maxChakra = Combat.getMaxChakra(user);
      const current = user.chakra;
      const percent = Math.round((current / maxChakra) * 100);
      const bar = this.createChakraBar(percent, 15);
      const hours = Combat.hoursUntilReset(user);

      const status = percent === 100 ? '⚡ Chakra au maximum!'
        : percent >= 75 ? '💪 Chakra eleve'
        : percent >= 50 ? '⚡ Chakra normal'
        : percent >= 25 ? '😓 Chakra faible'
        : '🪨 Chakra critique';

      const chakraMessage = `
╔════════════════════════════════════╗
║         🔵 𝔗𝔒𝔑 𝔆𝔋𝔄𝔎𝔕𝔄 🔵           ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
🎖️ *Niveau:* ${user.level}
🔵 *Chakra:* ${current}/${maxChakra}

${bar}
${status}

⚔️ Chaque duel coute 20 chakra. Un chakra plein augmente ta puissance de combat.
⏰ *Reinitialisation:* ${hours}h
═════════════════════════════════════`;

      await send({ text: chakraMessage });
    } catch (error) {
      await send({ text: '❌ Erreur!' });
    }
  },

  createChakraBar(percent, length = 15) {
    const filled = Math.round((percent / 100) * length);
    const empty = Math.max(0, length - filled);
    return `[${('🔵').repeat(filled)}${('⚪').repeat(empty)}] ${percent}%`;
  },
};
