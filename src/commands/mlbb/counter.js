// COMMANDE: !counter <héro> - Counters efficaces
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'counter',
  aliases: ['counters', 'beat', 'antiheroe'],
  category: 'Gaming',
  description: 'Voir les counters d\'un héros',
  usage: '!counter <héros>',
  
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
      const heroNames = Object.keys(mlbbData.counters).join(', ');
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Spécifie un héros!\n\nHéros avec counters: ${heroNames}`
      });
    }

    const heroName = args[0].toLowerCase();
    const heroCounters = mlbbData.counters[heroName];

    if (!heroCounters) {
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Pas de counters trouvés pour "${heroName}"\n\nHéros disponibles: ${Object.keys(mlbbData.counters).join(', ')}`
      });
    }

    const counterInfo = `
╔════════════════════════════════════╗
║     🛡️ COUNTERS DE ${heroCounters.hero.toUpperCase()} 🛡️    ║
╚════════════════════════════════════╝

*HÉROS EFFICACES CONTRE ${heroCounters.hero.toUpperCase()}*

${heroCounters.counters.map((counter, i) => 
  `${i + 1}. *${counter.name}* 🔥\n   └─ ${counter.reason}`
).join('\n\n')}

💡 *CONSEIL STRATÉGIQUE:*
• Banne le héros problématique en sélection
• Joue de manière défensive contre ses forces
• Utilise les CC pour l'interrompre
• Gère les teamfights intelligemment

🎯 *POUR PLUS D'INFOS:*
!hero ${heroName} - Détails complets
!build ${mlbbData.heroes[heroName]?.specialty?.toLowerCase() || 'assassin_burst'} - Build appropriée
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: counterInfo });
  }
};
