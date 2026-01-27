// COMMANDE: !build <héros> - Builds recommandées
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));
const MLBBAssets = require('../../utils/mlbbAssets');

module.exports = {
  name: 'build',
  aliases: ['builds', 'items', 'set'],
  category: 'gaming',
  description: 'Builds optimisées pour un héros',
  usage: '!build <héros>',
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

    if (!hero || !hero.build) {
      return sock.sendMessage(from, {
        text: `❌ Héros "${heroName}" ou builds non trouvés!`
      });
    }

    const buildInfo = `
╔═══════════════════════════════════╗
║    🛠️ 𝔅𝔘𝔌𝔏𝔇𝔖 ${𝔥𝔢𝔯𝔬.𝔫𝔞𝔪𝔢.𝔱𝔬𝔘𝔭𝔭𝔢𝔯𝔆𝔞𝔰𝔢()} 🛠️     ║
╚═══════════════════════════════════╝

🔴 *BUILD DAMAGE* (Aggressif)
${hero.build.damage.map((item, i) => `${i + 1}. ${item}`).join('\n')}

🟡 *BUILD BALANCED* (Équilibré)
${hero.build.balanced.map((item, i) => `${i + 1}. ${item}`).join('\n')}

🟢 *BUILD SUPPORT* (Tanky)
${(hero.build.support || hero.build.tank || hero.build.balanced).map((item, i) => `${i + 1}. ${item}`).join('\n')}

💡 *Tips:* Adapte les builds selon ton équipe et les ennemis!`;

    // Essayer d'envoyer l'image aléatoire du héros
    const heroImage = MLBBAssets.getRandomHeroImage(heroName);
    
    if (heroImage && fs.existsSync(heroImage)) {
      try {
        await sock.sendMessage(from, { text: buildInfo });
        await sock.sendMessage(from, {
          image: { url: heroImage },
          caption: `🛠️ Builds ${hero.name}`
        });
      } catch (err) {
        console.error('Erreur lors de l\'envoi de l\'image:', err);
        return sock.sendMessage(from, { text: buildInfo });
      }
    } else {
      return sock.sendMessage(from, { text: buildInfo });
    }
  }
};
