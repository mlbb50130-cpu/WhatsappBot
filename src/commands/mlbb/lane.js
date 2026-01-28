// COMMANDE: !lane <lane> - Guide par lane/position
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'lane',
  aliases: ['position', 'role', 'guide'],
  category: 'gaming',
  description: 'Guide complet pour chaque lane',
  usage: '!lane <lane>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;

    if (!args[0]) {
      const lanes = Object.keys(mlbb.lanes || {}).join(', ');
      return sock.sendMessage(from, {
        text: `❌ *Spécifie une lane!*\n\n*Lanes disponibles:* ${lanes || 'top, mid, bottom, jungle'}`
      });
    }

    const laneKey = args[0].toLowerCase();
    const lane = mlbb.lanes?.[laneKey];

    if (!lane) {
      return sock.sendMessage(from, {
        text: `❌ Lane "${args[0]}" non trouvée!`
      });
    }

    const laneEmoji = {
      'top': '⛰️',
      'mid': '🏘️',
      'bottom': '🌊',
      'jungle': '🌳'
    }[laneKey] || '📍';

    const laneInfo = `
╔═══════════════════════════════════╗
║     ${laneEmoji} 𝔊𝔘𝔌𝔇𝔈 𝔏𝔄𝔑𝔈: ${laneKey.toUpperCase()} ${laneEmoji}    ║
╚═══════════════════════════════════╝

📝 *DESCRIPTION*
${lane.description || 'Lane principale'}

👥 *RÔLES PRINCIPAUX*
${lane.roles?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Multi-role'}

🎮 *HÉROS POPULAIRES*
${lane.popular_heroes?.slice(0, 5).map((h, i) => `${i + 1}. ${h}`).join('\n') || 'Tous les héros'}

💡 *STRATÉGIE*
• Priorise la farm early game
• Gère les ganks constants
• Participe aux teamfights mid-late
• Place bien ta warding

🎯 *COMMANDES UTILES:*
!hero <nom> - Info héros
!build <nom> - Builds adaptées
!counter <nom> - Counters efficaces`;

    return sock.sendMessage(from, { text: laneInfo });
  }
};
