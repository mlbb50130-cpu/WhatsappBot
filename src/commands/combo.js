const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'combo',
  aliases: [],
  category: 'gaming',
  description: 'Combos d\'un héros MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      
      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '❌ Utilise: !combo <nom_hero>\nEx: !combo ling'
        });
      }

      const heroName = args[0].toLowerCase();
      const comboKey = `${heroName}_combo`;
      const combo = mlbbData.combos[comboKey];

      if (!combo) {
        return sock.sendMessage(jid, {
          text: `❌ Pas de combo pour "${heroName}" enregistré.`
        });
      }

      let text = `🔥 *COMBO ${combo.hero.toUpperCase()}*\n\n`;
      text += `*Séquence:* ${combo.combo.join(' → ')}\n\n`;
      text += `💥 *Dégâts:* ${combo.damage}\n`;
      text += `📝 *Explication:* ${combo.explanation}`;

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur combo:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
