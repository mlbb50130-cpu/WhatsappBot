module.exports = {
  name: 'chakra',
  description: 'Voir ton chakra et ta ressource de mana',
  category: 'PROFIL',
  usage: '!chakra',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const maxChakra = 100;
      
      // Reset chakra if 24h passed
      const now = new Date();
      const lastReset = user.lastChakraReset ? new Date(user.lastChakraReset) : now;
      const hoursDiff = (now - lastReset) / (1000 * 60 * 60);
      
      if (hoursDiff >= 24) {
        user.chakra = maxChakra;
        user.lastChakraReset = now;
        await user.save();
      }
      
      const currentChakra = user.chakra || maxChakra;
      const chakraPercent = Math.round((currentChakra / maxChakra) * 100);
      const hoursUntilReset = Math.ceil(24 - hoursDiff);

      const chakraBar = this.createChakraBar(chakraPercent, 15);

      const chakraMessage = `
╔════════════════════════════════════╗
║         🔵 TON CHAKRA 🔵           ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
🔵 *Chakra:* ${currentChakra}/${maxChakra}

*Niveau de pouvoir:*
${chakraBar}

${chakraPercent === 100 ? '⚡ Chakra au maximum!' : chakraPercent >= 75 ? '💪 Chakra élevé' : chakraPercent >= 50 ? '⚡ Chakra normal' : chakraPercent >= 25 ? '😓 Chakra faible' : '🪨 Chakra critique'}

⏰ *Réinitialisation:* ${hoursUntilReset}h

═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: chakraMessage });
    } catch (error) {
      console.error('Error in chakra command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  },

  createChakraBar(percent, length = 15) {
    const filled = Math.round((percent / 100) * length);
    const empty = length - filled;
    return `[${('🔵').repeat(filled)}${('⚪').repeat(empty)}] ${percent}%`;
  }
};
