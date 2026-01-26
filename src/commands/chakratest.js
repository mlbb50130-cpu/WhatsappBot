const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'chakratest',
  description: 'Test command to check chakra status',
  category: 'DEBUG',
  usage: '!chakratest',
  adminOnly: true,
  groupOnly: false,
  cooldown: 0,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const maxChakra = 100 + (user.level - 1) * 10;
      const now = new Date();
      const lastReset = user.lastChakraReset ? new Date(user.lastChakraReset) : now;
      const hoursDiff = (now - lastReset) / (1000 * 60 * 60);
      const timeUntilReset = 24 - hoursDiff;

      const debugInfo = `
*🔍 CHAKRA DEBUG INFO*

👤 *Utilisateur:* ${user.username}
🎯 *Niveau:* ${user.level}

*Chakra Status:*
├─ Chakra actuel: ${user.chakra}/${maxChakra}
├─ MaxChakra en BD: ${user.maxChakra}
└─ MaxChakra calculé: ${maxChakra}

*Chakra Timer:*
├─ Derniers reset: ${lastReset.toLocaleString('fr-FR')}
├─ Heures écoulées: ${hoursDiff.toFixed(2)}h
├─ Heures jusqu'au reset: ${timeUntilReset.toFixed(2)}h
└─ Doit reset? ${hoursDiff >= 24 ? '✅ OUI' : '❌ NON'}

*Calcul:*
├─ now.getTime(): ${now.getTime()}
├─ lastReset.getTime(): ${lastReset.getTime()}
└─ Différence (ms): ${now.getTime() - lastReset.getTime()}
`;

      await sock.sendMessage(senderJid, { text: debugInfo });
    } catch (error) {
      console.error('Error in chakratest:', error.message);
      await sock.sendMessage(senderJid, { text: `❌ Erreur: ${error.message}` });
    }
  }
};
