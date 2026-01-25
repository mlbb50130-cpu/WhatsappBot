// COMMANDE: !combo <héro> - Combos de dégâts optimaux
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'combo',
  aliases: ['combos', 'rotation'],
  category: 'Gaming',
  description: 'Combos optimaux pour un héros',
  usage: '!combo <héros>',
  
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
      const heroNames = Object.keys(mlbbData.combos).join(', ');
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Spécifie un héros!\n\nHéros avec combos: ${heroNames}`
      });
    }

    const heroName = args[0].toLowerCase();
    const heroCombos = mlbbData.combos[heroName];

    if (!heroCombos) {
      cooldown.setCooldown(senderJid);
      return sock.sendMessage(from, {
        text: `❌ Pas de combos trouvés pour "${heroName}"\n\nHéros disponibles: ${Object.keys(mlbbData.combos).join(', ')}`
      });
    }

    const comboInfo = `
╔════════════════════════════════════╗
║     ⚡ COMBOS DE ${heroCombos.hero.toUpperCase()} ⚡     ║
╚════════════════════════════════════╝

${heroCombos.combos.map((combo, i) => `
${i + 1}. *${combo.name}*
   📍 Séquence: ${combo.sequence}
   💥 Dégâts: ${combo.damage}
   ⚙️ Difficulté: ${combo.difficulty}
`).join('\n')}

🎯 *CONSEILS D'EXÉCUTION:*
• Pratique les combos en match!
• L'ordre est important pour maximiser les dégâts
• Adapte selon la position de l'ennemi
• Certains combos requièrent de la mécanique

💡 *POUR MAÎTRISER ${heroCombos.hero.toUpperCase()}:*
• Apprends les combos de base en premier
• Augmente progressivement la difficulté
• Joue en Draft ou en Ranked pour la pratique
• Regarde des VODs de pro players

*🎮 PLUS D'INFOS:*
!hero ${heroName} - Profile complet
!counter ${heroName} - Counters efficaces
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: comboInfo });
  }
};
