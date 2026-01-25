const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'counter',
  aliases: ['c'],
  category: 'gaming',
  description: 'Counters d\'un héros MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      
      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '❌ Utilise: !counter <nom_hero>\nEx: !counter ling'
        });
      }

      const heroName = args[0].toLowerCase();
      const hero = mlbbData.heroes[heroName];

      if (!hero) {
        return sock.sendMessage(jid, {
          text: `❌ Héros "${heroName}" non trouvé.`
        });
      }

      let text = `⚔️ *MATCHUPS ${hero.name.toUpperCase()}*\n`;
      
      text += `\n🔴 *Counters (qui bât ${hero.name}):*\n`;
      hero.beaten_by.forEach(h => {
        text += `• ${mlbbData.heroes[h.toLowerCase()]?.name || h}\n`;
      });

      text += `\n🟢 *Battu par (${hero.name} bât):*\n`;
      hero.counters.forEach(h => {
        text += `• ${mlbbData.heroes[h.toLowerCase()]?.name || h}\n`;
      });

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur counter:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
