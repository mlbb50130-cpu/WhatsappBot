const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'lane',
  aliases: ['role'],
  category: 'gaming',
  description: 'Infos sur un rôle/lane MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      
      if (!args.length) {
        const lanes = Object.keys(mlbbData.lanes).join(', ');
        return sock.sendMessage(jid, {
          text: `❌ Utilise: !lane <nom_lane>\n\nLanes disponibles:\n${lanes}`
        });
      }

      const laneName = args[0].toLowerCase();
      const lane = mlbbData.lanes[laneName];

      if (!lane) {
        return sock.sendMessage(jid, {
          text: `❌ Lane "${laneName}" non trouvée.`
        });
      }

      let text = `🛣️ *${lane.name.toUpperCase()}*\n`;
      text += `\n📌 *Rôles:* ${lane.roles.join(', ')}\n`;
      text += `ℹ️ *Info:* ${lane.info}\n`;

      // Montrer les héros qui jouent cette lane
      const herosInLane = Object.entries(mlbbData.heroes)
        .filter(([_, h]) => h.lane === laneName || h.role.some(r => lane.roles.includes(r)))
        .map(([_, h]) => h.name);

      if (herosInLane.length > 0) {
        text += `\n🎮 *Héros populaires:* ${herosInLane.slice(0, 5).join(', ')}`;
      }

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur lane:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
