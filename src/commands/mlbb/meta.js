// COMMANDE: !meta - Meta actuelle MLBB
const fs = require('fs');
const path = require('path');
const mlbb = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mlbb.json'), 'utf8'));

module.exports = {
  name: 'meta',
  aliases: ['metagame', 'tier', 'tierlist'],
  category: 'gaming',
  description: 'Affiche la meta actuelle de MLBB',
  usage: '!meta',
  groupOnly: true,
  cooldown: 5,
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    const meta = mlbb.meta || {};

    const metaInfo = `
╔═══════════════════════════════════╗
║     📊 𝔐𝔈𝔗𝔄 𝔄𝔆𝔗𝔘𝔈𝔏𝔏𝔈 𝔐𝔏𝔅𝔅 📊      ║
╚═══════════════════════════════════╝

*Patch:* ${meta.patch || 'Actuel'}

🔴 *S TIER* (🔥 OVERPOWERED)
${(meta.s_tier || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

🟡 *A TIER* (⭐ TRÈS BON)
${(meta.a_tier || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

🟢 *B TIER* (✅ BON)
${(meta.b_tier || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *${meta.note || 'La meta change selon les patchs et équilibrages'}*

💡 *COMMANDES UTILES:*
!hero <nom> - Info complète
!build <nom> - Builds recommandées
!counter <nom> - Counters efficaces`;

    return sock.sendMessage(from, { text: metaInfo });
  }
};
