// COMMANDE: !lane <role> - Guide par lane/position
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'lane',
  aliases: ['position', 'role', 'guide'],
  category: 'Gaming',
  description: 'Guide complet pour chaque lane',
  usage: '!lane <role>',
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const senderJid = message.key.participant || from;

    if (!isGroup) {
      return sock.sendMessage(from, {
        text: '❌ Cette commande fonctionne uniquement en groupe!'
      });
    }

    if (cooldown.isOnCooldown(senderJid)) {
      return sock.sendMessage(from, {
        text: `⏱️ Patiente ${cooldown.getTimeLeft(senderJid) / 1000}s`
      });
    }

    if (!args[0]) {
      const laneNames = Object.keys(mlbbData.lanes).join(', ');
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Spécifie une lane!\n\n*Lanes disponibles:* ${laneNames}`
      });
    }

    const laneKey = args[0].toLowerCase();
    const lane = mlbbData.lanes[laneKey];

    if (!lane) {
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Lane "${args[0]}" non trouvée!\n\nLanes: ${Object.keys(mlbbData.lanes).join(', ')}`
      });
    }

    const laneInfo = `
╔════════════════════════════════════╗
║   🎮 GUIDE - ${lane.name.toUpperCase()} 🎮   ║
╚════════════════════════════════════╝

*👥 RÔLE PRINCIPAL:*
${lane.role}

*🏆 CHAMPIONS RECOMMANDÉS:*
${lane.champions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

*🎯 OBJECTIFS PRINCIPAUX:*
${lane.objectives.split(', ').map(obj => `├ ${obj}`).join('\n')}

*💡 CONSEILS STRATÉGIQUES:*
${lane.tips.map(tip => `├ ${tip}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*📊 GUIDE AVANCÉ:*

EARLY GAME (0-7 min):
• Contrôle des minions/monstres
• Negate l'ennemi sans prendre trop de dégâts
• Gardez vision importante
• Collabore avec l'équipe

MID GAME (7-15 min):
• Farm efficace en sécurité
• Participe aux team fights critiques
• Rotation intelligente
• Objectif placement & warding

LATE GAME (15+ min):
• Positionnement crucial
• Capitalise sur ton avantage
• Protection des carries
• Finition du match

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🔍 RESSOURCES:*
!meta - Meta actuelle par lane
!hero <nom> - Infos héros recommandés
!build ${lane.name.toLowerCase()} - Build optimale
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: laneInfo });
  }
};
