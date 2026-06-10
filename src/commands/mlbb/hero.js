// COMMANDE: !hero <nom> - Infos détaillées héros MLBB
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));
const MLBBAssets = require('../../utils/mlbbAssets');

module.exports = {
  name: 'hero',
  aliases: ['heroe', 'champion', 'personnage'],
  category: 'gaming',
  description: 'Infos complètes sur un héros MLBB',
  usage: '!hero <nom>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args, user, isGroup) {
    const from = message.key.remoteJid;

    if (!args[0]) {
      const heroNames = Object.keys(mlbb.heroes).slice(0, 10).join(', ');
      return sock.sendMessage(from, {
        text: `❌ *Spécifie un héros!*\n\n*Exemples:* ${heroNames}...`
      });
    }

    const heroName = args[0].toLowerCase();
    const hero = mlbb.heroes[heroName];

    if (!hero) {
      return sock.sendMessage(from, {
        text: `❌ Héros "${heroName}" non trouvé!`
      });
    }
    const roleEmoji = hero.role.includes('Assassin') ? '🔪' : hero.role.includes('Tank') ? '🛡️' : hero.role.includes('Mage') ? '🔮' : '⚔️';
    const diffEmoji = hero.difficulty === 'Easy' ? '🟢' : hero.difficulty === 'Medium' ? '🟡' : '🔴';

    const heroInfo = `
╔═══════════════════════════════════╗
║       🎮 ${hero.name.toUpperCase().padEnd(10)} 🎮       ║
╚═══════════════════════════════════╝

📊 *INFOS*
│ ${roleEmoji} Rôle: ${hero.role.join(' / ')}
│ 🛣️ Lane: ${hero.lane}
│ ${diffEmoji} Difficulté: ${hero.difficulty}
│
├─ 💪 HP: ${hero.attribute.hp}
├─ ⚔️ ATK: ${hero.attribute.atk}
├─ 🛡️ DEF: ${hero.attribute.def}
└─ ⚡ ASP: ${hero.attribute.asp}

🎯 *COMPÉTENCES*
│ 🔄 Passive: ${hero.skills.passive}
│ 1️⃣ S1: ${hero.skills.s1}
│ 2️⃣ S2: ${hero.skills.s2}
│ ⭐ Ult: ${hero.skills.ult}

✅ *COUNTERS:* ${hero.counters.join(', ')}
❌ *FAIBLE CONTRE:* ${hero.beaten_by.join(', ')}`;

    // Essayer d'envoyer l'image aléatoire du héros
    const heroImage = MLBBAssets.getRandomHeroImage(heroName);
    
    if (heroImage && fs.existsSync(heroImage)) {
      try {
        await sock.sendMessage(from, { text: heroInfo });
        await sock.sendMessage(from, {
          image: { url: heroImage },
          caption: `🖼️ ${hero.name}`
        });
      } catch (err) {
        return sock.sendMessage(from, { text: heroInfo });
      }
    } else {
      return sock.sendMessage(from, { text: heroInfo });
    }
  }
};
