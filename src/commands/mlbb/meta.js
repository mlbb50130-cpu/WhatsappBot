// COMMANDE: !meta - Meta actuelle MLBB
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(5000);

module.exports = {
  name: 'meta',
  aliases: ['metagame', 'tier', 'tierlist'],
  category: 'Gaming',
  description: 'Affiche la meta actuelle de MLBB',
  usage: '!meta',
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const senderJid = message.key.participant || from;

    if (!isGroup) {
      return sock.sendMessage(from, {
        text: '❌ Cette commande fonctionne uniquement en groupe!'
      });
    }

    if (cooldown.isOnCooldown(senderJid)) {
      return sock.sendMessage(from, {
        text: `⏱️ Patiente ${cooldown.getTimeLeft(senderJid) / 1000}s`
      });
    }

    const meta = mlbbData.meta;

    const metaInfo = `
╔════════════════════════════════════╗
║        📊 META ACTUELLE MLBB 📊     ║
╚════════════════════════════════════╝

*🏆 TIER LIST*

*S TIER* (🔥 OVERPOWERED)
${meta.tier.S.join(' • ')}

*A TIER* (⭐ TRÈS BON)
${meta.tier.A.join(' • ')}

*B TIER* (✅ BON)
${meta.tier.B.join(' • ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🎯 TENDANCES PAR LANE*

*Gold Lane:* ${meta.trends['Gold Lane'].join(' • ')}
*Mid Lane:* ${meta.trends['Mid Lane'].join(' • ')}
*EXP Lane:* ${meta.trends['EXP Lane'].join(' • ')}
*Roam:* ${meta.trends['Roam'].join(' • ')}
*Carry:* ${meta.trends['Carry'].join(' • ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *NOTES IMPORTANTES:*
${meta.notes}

💡 *CONSEILS:*
• La meta change avec les patches balance
• Maîtrise des héros > suivre la meta
• Counterpick intelligemment
• Adapte ta composition selon le ban

*🔍 POUR PLUS D'INFOS:*
!hero <nom> - Infos complètes héros
!counter <nom> - Counters efficaces
!lane <role> - Guide par lane
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: metaInfo });
  }
};
