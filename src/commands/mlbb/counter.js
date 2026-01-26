// COMMANDE: !counter <héros> - Counters efficaces
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'counter',
  aliases: ['counters', 'beat', 'antiheroe'],
  category: 'gaming',
  description: 'Voir les counters d\'un héros',
  usage: '!counter <héros>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;

    if (!args[0]) {
      const heroes = Object.keys(mlbb.heroes).slice(0, 8).join(', ');
      return sock.sendMessage(from, {
        text: `❌ *Spécifie un héros!*\n\n*Exemples:* ${heroes}...`
      });
    }

    const heroName = args[0].toLowerCase();
    const hero = mlbb.heroes[heroName];

    if (!hero) {
      return sock.sendMessage(from, {
        text: `❌ Héros "${heroName}" non trouvé!`
      });
    }

    const counterInfo = `
╔═══════════════════════════════════╗
║  🛡️ COUNTERS DE ${hero.name.toUpperCase()} 🛡️  ║
╚═══════════════════════════════════╝

✅ *HÉROS QUI BEAT ${hero.name.toUpperCase()}*
${hero.beaten_by.map((h, i) => `${i + 1}. ${h}`).join('\n')}

⚠️ *QUI ${hero.name.toUpperCase()} COUNTRE*
${hero.counters.map((h, i) => `${i + 1}. ${h}`).join('\n')}

💡 *CONSEILS STRATÉGIQUES:*
• Sélectionne un counter en champ fermé
• Joue de manière défensive contre ses forces
• Utilise les CC pour le contrôler
• Manage les teamfights intelligemment

🎯 *COMMANDES UTILES:*
!hero ${heroName} - Détails complets
!build ${heroName} - Builds optimisées`;

    return sock.sendMessage(from, { text: counterInfo });
  }
};
