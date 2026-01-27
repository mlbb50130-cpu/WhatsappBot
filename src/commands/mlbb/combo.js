// COMMANDE: !combo <héros> - Combos optimaux
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'combo',
  aliases: ['combos', 'rotation', 'cc'],
  category: 'gaming',
  description: 'Combos optimaux pour un héros',
  usage: '!combo <héros>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;

    if (!args[0]) {
      const heroes = Object.keys(mlbb.combos || {}).slice(0, 5).join(', ');
      return sock.sendMessage(from, {
        text: `❌ *Spécifie un héros!*\n\n*Exemples avec combos:* ${heroes}...`
      });
    }

    const heroName = args[0].toLowerCase();
    const combos = mlbb.combos?.[heroName];

    if (!combos) {
      return sock.sendMessage(from, {
        text: `❌ Pas de combos trouvés pour "${heroName}"`
      });
    }

    const comboInfo = `
╔═══════════════════════════════════╗
║    ⚡ 𝔆𝔒𝔐𝔅𝔒𝔖 ${𝔥𝔢𝔯𝔬𝔑𝔞𝔪𝔢.𝔱𝔬𝔘𝔭𝔭𝔢𝔯𝔆𝔞𝔰𝔢()} ⚡     ║
╚═══════════════════════════════════╝

${combos.map((combo, i) => `${i + 1}. *${combo.name}*\n   Dégâts: ${combo.damage}\n   Séquence: ${combo.sequence}\n   💡 ${combo.explanation}`).join('\n\n')}

🎯 *TIPS COMBOS:*
• Utilise les combos après l'initiateur
• Manage tes cooldowns pour le burst
• Combine avec les items pour plus de dégâts`;

    return sock.sendMessage(from, { text: comboInfo });
  }
};
