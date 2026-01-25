const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'hero',
  aliases: ['h'],
  category: 'gaming',
  description: 'Infos d\'un héros MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      
      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '❌ Utilise: !hero <nom_hero>\nEx: !hero ling'
        });
      }

      const heroName = args[0].toLowerCase();
      const hero = mlbbData.heroes[heroName];

      if (!hero) {
        const availableHeroes = Object.keys(mlbbData.heroes).join(', ');
        return sock.sendMessage(jid, {
          text: `❌ Héros "${heroName}" non trouvé.\n\nHéros disponibles:\n${availableHeroes}`
        });
      }

      const stats = hero.attribute;
      const text = `🎮 *${hero.name.toUpperCase()}*

📊 *Rôle:* ${hero.role.join(', ')}
🛣️ *Lane:* ${hero.lane}
⚠️ *Difficulté:* ${hero.difficulty}

*Statistiques:*
❤️ HP: ${stats.hp}
💧 Mana: ${stats.mana}
⚔️ ATK: ${stats.atk}
🛡️ DEF: ${stats.def}
⚡ SPD: ${stats.asp}

*Habilités:*
🔸 ${hero.skills.passive}
🔹 S1: ${hero.skills.s1}
🔹 S2: ${hero.skills.s2}
🔸 Ultimate: ${hero.skills.ult}`;

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur hero:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
