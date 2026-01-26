// Commande: !rank - Affiche les informations du rang de l'utilisateur

const RankSystem = require('../../utils/rankSystem');
const MessageFormatter = require('../../utils/messageFormatter');
const config = require('../../config');

module.exports = {
  name: 'rank',
  aliases: ['rang', 'myrank'],
  description: 'Affiche vos informations de rang actuel et progression',
  category: 'Profile',
  cooldown: 5,

  execute: async (sock, message, args, user, isGroup, groupData) => {
    try {
      const senderJid = message.key.remoteJid;

      // Récupérer les informations du rang actuel
      const rankInfo = RankSystem.getRankByLevel(user.level);
      const nextRank = RankSystem.getNextRank(user);
      const progress = RankSystem.getRankProgressPercentage(user);

      // Construire le message avec les détails du rang
      let rankDetails = `
╔════════════════════════════════════╗
║      🎖️ INFORMATIONS RANG 🎖️       ║
╚════════════════════════════════════╝

${rankInfo.emoji} *${rankInfo.name}*
${rankInfo.description}

├─ 📊 Niveau: *${user.level}*
├─ ⭐ Condition: ${rankInfo.condition}
├─ 🎖️ Catégorie: Otaku
${nextRank ? `
├─ 📈 Prochain Rang: ${nextRank.emoji} *${nextRank.name}*
├─ 📊 Progression: ${progress}% ${getProgressBar(progress)}
├─ 🎯 Niveau requis: ${nextRank.minLevel}
├─ 🔄 Levels restants: ${nextRank.minLevel - user.level}
` : '├─ 🏆 Vous avez atteint le rang maximum!\n'}
╔════════════════════════════════════╗
║     🌟 Tous les Rangs Otaku 🌟     ║
╚════════════════════════════════════╝`;

      // Ajouter tous les rangs disponibles
      for (const [rankId, rank] of Object.entries(RankSystem.RANKS)) {
        const achieved = user.level >= rank.minLevel;
        const marker = achieved ? '✅' : '🔒';
        rankDetails += `\n${marker} L${rank.minLevel}+ ${rank.emoji} *${rank.name}*`;
      }

      rankDetails += '\n\n═════════════════════════════════════';

      // Envoyer le message
      const response = await MessageFormatter.createMessageWithImage(rankDetails);
      await sock.sendMessage(senderJid, response);

    } catch (error) {
      console.error('Erreur dans la commande rank:', error);
      await sock.sendMessage(message.key.remoteJid, {
        text: '❌ Erreur lors de la récupération de vos informations de rang.'
      });
    }
  }
};

/**
 * Créer une barre de progression visuelle
 * @param {number} percentage - Pourcentage (0-100)
 * @returns {string} Barre visuelle
 */
function getProgressBar(percentage) {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
