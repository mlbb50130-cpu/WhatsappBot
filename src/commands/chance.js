const MessageFormatter = require('../utils/messageFormatter');
const Luck = require('../utils/luck');

module.exports = {
  name: 'chance',
  description: 'Voir ta chance du jour',
  category: 'FUN',
  usage: '!chance',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Chance du jour DETERMINISTE (stable toute la journee) qui influence
      // reellement loot / roulette / surprise.
      const luck = Luck.getDailyLuck(user);

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

      const bar = MessageFormatter.progressBar(luck, 100, 20);

      let advice = '';
      if (luck > 75) {
        advice = '🎁 C\'est un bon jour pour tenter un loot!';
      } else if (luck > 50) {
        advice = '⚔️ Essaie un duel!';
      } else if (luck > 25) {
        advice = '📚 Fais un quiz pour gagner de l\'XP!';
      } else {
        advice = '💤 Reste prudent et ne prends pas de risques!';
      }

      const winPct = Math.round(Luck.winProbability(user) * 100);
      const chanceItems = [
        { label: 'Chance', value: `${luck}%` },
        { label: 'Statut', value: message_luck.text },
        { label: '🎰 Roulette', value: `${winPct}% de victoire aujourd'hui` },
        { label: '🎁 Loot', value: luck >= 50 ? 'objets rares boostes' : 'objets rares reduits' },
        { label: '💡 Conseil', value: advice }
      ];

      const chanceMessage = `${bar}\n${MessageFormatter.elegantBox('🍀 𝔆𝔋𝔄𝔑𝔆𝔈 𝔇𝔘 𝔍𝔒𝔘𝔕 🍀', chanceItems)}`;

      if (reply) {
        await reply({ text: chanceMessage });
      } else {
        await sock.sendMessage(senderJid, { text: chanceMessage });
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
