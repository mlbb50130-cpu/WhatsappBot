const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'build',
  aliases: ['b'],
  category: 'gaming',
  description: 'Builds d\'un héros MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      
      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '❌ Utilise: !build <nom_hero>\nEx: !build brody'
        });
      }

      const heroName = args[0].toLowerCase();
      const hero = mlbbData.heroes[heroName];

      if (!hero) {
        return sock.sendMessage(jid, {
          text: `❌ Héros "${heroName}" non trouvé.`
        });
      }

      const builds = hero.build;
      let text = `🛠️ *BUILDS ${hero.name.toUpperCase()}*\n`;

      for (const [buildType, items] of Object.entries(builds)) {
        text += `\n📦 *${buildType.charAt(0).toUpperCase() + buildType.slice(1)}*\n`;
        items.forEach((item, idx) => {
          text += `${idx + 1}. ${item}\n`;
        });
      }

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur build:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
