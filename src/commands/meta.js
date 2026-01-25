const fs = require('fs');
const path = require('path');

const mlbbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'meta',
  aliases: [],
  category: 'gaming',
  description: 'État du méta MLBB',
  cooldown: 3,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const meta = mlbbData.meta;

      let text = `📊 *META MLBB - Patch ${meta.current_patch}*\n`;

      text += `\n🔥 *S-TIER (Très fort):*\n`;
      meta.s_tier.forEach(hero => {
        text += `⭐ ${mlbbData.heroes[hero.toLowerCase()]?.name || hero}\n`;
      });

      text += `\n💪 *A-TIER (Fort):*\n`;
      meta.a_tier.forEach(hero => {
        text += `✅ ${mlbbData.heroes[hero.toLowerCase()]?.name || hero}\n`;
      });

      text += `\n👍 *B-TIER (Viable):*\n`;
      meta.b_tier.forEach(hero => {
        text += `▪️ ${mlbbData.heroes[hero.toLowerCase()]?.name || hero}\n`;
      });

      text += `\n📝 *Notes:* ${meta.notes}`;

      return sock.sendMessage(jid, { text });
    } catch (error) {
      console.error('Erreur meta:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
