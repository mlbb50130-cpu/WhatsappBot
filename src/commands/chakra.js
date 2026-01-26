const MessageFormatter = require('../utils/messageFormatter');

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
      // Calculer maxChakra basé sur le niveau: 100 + (niveau - 1) * 10
      const maxChakra = 100 + (user.level - 1) * 10;
      
      // Mettre à jour maxChakra si changé
      if (user.maxChakra !== maxChakra) {
        user.maxChakra = maxChakra;
      }
      
      // Reset chakra if 24h passed
      const now = new Date();
      let needsUpdate = false;
      let hoursDiff = 0;
      
      // Initialize chakra and lastChakraReset if undefined
      if (user.chakra === undefined || user.chakra === null) {
        user.chakra = maxChakra;
        user.lastChakraReset = now;
        needsUpdate = true;
        hoursDiff = 0;
      } else if (!user.lastChakraReset) {
        // If lastChakraReset is not set, set it to now
        user.lastChakraReset = now;
        needsUpdate = true;
        hoursDiff = 0;
      } else {
        // Check if 24 hours have passed since last reset
        const lastReset = new Date(user.lastChakraReset);
        hoursDiff = (now - lastReset) / (1000 * 60 * 60);
        
        if (hoursDiff >= 24) {
          user.chakra = maxChakra;
          user.lastChakraReset = now;
          hoursDiff = 0; // Reset the counter after reset
          needsUpdate = true;
        }
      }
      
      // Save if changes were made
      if (needsUpdate) {
        await user.save();
      }
      
      // Ensure chakra doesn't exceed maxChakra after level up
      const currentChakra = Math.min(user.chakra || maxChakra, maxChakra);
      const hoursUntilReset = Math.max(1, Math.ceil(24 - hoursDiff));
      
      const chakraPercent = Math.round((currentChakra / maxChakra) * 100);
      const chakraBar = this.createChakraBar(chakraPercent, 15);

      const chakraMessage = `
╔════════════════════════════════════╗
║         🔵 TON CHAKRA 🔵           ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*
� *Niveau:* ${user.level}
�🔵 *Chakra:* ${currentChakra}/${maxChakra}

*Niveau de pouvoir:*
${chakraBar}

${chakraPercent === 100 ? '⚡ Chakra au maximum!' : chakraPercent >= 75 ? '💪 Chakra élevé' : chakraPercent >= 50 ? '⚡ Chakra normal' : chakraPercent >= 25 ? '😓 Chakra faible' : '🪨 Chakra critique'}

⏰ *Réinitialisation:* ${hoursUntilReset}h

═════════════════════════════════════`;

      // Only send message (no duplicate save)
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
