const RandomUtils = require('../utils/random');

module.exports = {
  name: 'chance',
  description: 'Voir ta chance du jour',
  category: 'FUN',
  usage: '!chance',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Generate luck based on user JID and today's date
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const seed = parseInt(user.jid + dateString, 36) % 100;

    const luck = Math.max(0, Math.min(100, seed + RandomUtils.range(-20, 20)));

    const luckyItems = [
      { luck: 80, text: '✨ Chance EXTRÊME! Tu peux faire l\'impossible aujourd\'hui!' },
      { luck: 60, text: '🍀 Bonne chance! Les étoiles sont avec toi!' },
      { luck: 40, text: '😐 Chance moyenne. Un jour normal.' },
      { luck: 20, text: '😰 Pas de chance... Mais ce n\'est qu\'un jour!' },
      { luck: 0, text: '🔥 Très malchanceux! Reste prudent!' }
    ];

    const message_luck = luckyItems.reduce((prev, curr) => 
      luck >= curr.luck ? curr : prev
    );

    const lucky = `
╔════════════════════════════════════════╗
║         🍀 TA CHANCE DU JOUR 🍀       ║
╚════════════════════════════════════════╝

*NIVEAU DE CHANCE:*
[${'█'.repeat(Math.floor(luck/5))}${'░'.repeat(20-Math.floor(luck/5))}] ${luck}%

*PRÉDICTION:*
${message_luck.text}

*CONSEIL:*
`;

    if (luck > 75) {
      await sock.sendMessage(senderJid, { text: lucky + '🎁 C\'est un bon jour pour tenter un loot!' });
    } else if (luck > 50) {
      await sock.sendMessage(senderJid, { text: lucky + '⚔️ Essaie un duel!' });
    } else if (luck > 25) {
      await sock.sendMessage(senderJid, { text: lucky + '📚 Fais un quiz pour gagner de l\'XP!' });
    } else {
      await sock.sendMessage(senderJid, { text: lucky + '💤 Reste prudent et ne prends pas de risques!' });
    }
  }
};
