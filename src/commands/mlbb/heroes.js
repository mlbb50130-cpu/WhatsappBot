// COMMANDE: !heroes - Liste de tous les héros MLBB
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'heroes',
  aliases: ['heroslist', 'listheroe', 'herolist', 'heros'],
  category: 'gaming',
  description: 'Liste complète de tous les héros MLBB',
  usage: '!heroes',
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args) {
    const from = message.key.remoteJid;

    const heroes = Object.entries(mlbb.heroes);
    const totalHeroes = heroes.length;

    // Grouper par rôle
    const herosByRole = {};
    heroes.forEach(([key, hero]) => {
      const role = hero.role[0]; // Rôle principal
      if (!herosByRole[role]) {
        herosByRole[role] = [];
      }
      herosByRole[role].push({ name: hero.name, key });
    });

    // Créer le message
    let menuText = `
╔═══════════════════════════════════════════╗
║        🎮 𝔏𝔌𝔖𝔗𝔈 𝔇𝔈𝔖 𝔋É𝔕𝔒𝔖 𝔐𝔏𝔅𝔅 🎮        ║
║          𝔗𝔬𝔱𝔞𝔩: ${𝔱𝔬𝔱𝔞𝔩𝔋𝔢𝔯𝔬𝔢𝔰} 𝔥é𝔯𝔬𝔰          ║
╚═══════════════════════════════════════════╝

`;

    // Afficher par rôle
    const roleEmojis = {
      'Assassin': '🔪',
      'Fighter': '⚔️',
      'Marksman': '🏹',
      'Mage': '🔮',
      'Support': '🛡️',
      'Tank': '🛡️'
    };

    Object.entries(herosByRole).sort().forEach(([role, heroes]) => {
      const emoji = roleEmojis[role] || '❓';
      menuText += `\n${emoji} *${role.toUpperCase()}* (${heroes.length})\n`;
      menuText += heroes.map(h => `   • ${h.name}`).join('\n');
      menuText += '\n';
    });

    menuText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *UTILISATION:*
!hero <nom> - Afficher les infos du héros
!build <nom> - Voir les builds optimisées
!counter <nom> - Voir les counters
!combo <nom> - Voir les combos

📝 *EXEMPLE:*
!hero ling - Infos sur Ling
!build brody - Builds pour Brody
!counter alice - Counters d'Alice`;

    return sock.sendMessage(from, { text: menuText });
  }
};
