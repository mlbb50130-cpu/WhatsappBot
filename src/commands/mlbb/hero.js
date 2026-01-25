// COMMANDE: !hero <nom> - Infos détaillées héros
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'hero',
  aliases: ['heroe', 'champion'],
  category: 'Gaming',
  description: 'Infos complètes sur un héros MLBB',
  usage: '!hero <nom>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args, user, isGroup) {
    const from = message.key.remoteJid;
    const senderJid = message.key.participant || from;

    if (!args[0]) {
      const heroNames = Object.keys(mlbbData.heroes).join(', ');
      return sock.sendMessage(from, {
        text: `❌ Spécifie un héros!\n\n*Héros disponibles:*\n${heroNames}`
      });
    }

    const heroName = args[0].toLowerCase();
    const hero = mlbbData.heroes[heroName];

    if (!hero) {
      return sock.sendMessage(from, {
        text: `❌ Héros "${heroName}" non trouvé!\n\nHéros disponibles: ${Object.keys(mlbbData.heroes).join(', ')}`
      });
    }

    const heroInfo = `
╔════════════════════════════════════╗
║          🎮 ${hero.name.toUpperCase()} 🎮          ║
╚════════════════════════════════════╝

📊 *INFOS GÉNÉRALES*
├ Rôle: ${hero.role}
├ Spécialité: ${hero.specialty}
└ Difficulté: ${hero.difficulty}

🎯 *COMPÉTENCES*
├ Passive: ${hero.skills.passive}
├ Skill 1: ${hero.skills.skill1}
├ Skill 2: ${hero.skills.skill2}
└ Ultimate: ${hero.skills.ultimate}

💪 *FORCES*
${hero.strength.map(s => `├ ${s}`).join('\n')}

⚠️ *FAIBLESSES*
${hero.weakness.map(w => `├ ${w}`).join('\n')}

💡 *CONSEIL*
Utilise !counter ${heroName} pour voir qui le countre
Utilise !combo ${heroName} pour les combos optimaux
Utilise !build assassin pour une build adaptée
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: heroInfo });
  }
};
