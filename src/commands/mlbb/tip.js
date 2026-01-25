// COMMANDE: !tip - Conseils aléatoires MLBB
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

const tips = [
  {
    title: 'CS est King 👑',
    tip: 'Le CS (deniers/minions) est ta source d\'or principale. Maîtriser le last-hit = progression garantie!'
  },
  {
    title: 'Map Awareness 🗺️',
    tip: 'Regarde minimap chaque 3-5 secondes. Un ennemi que tu ne vois pas = ennemi qui kill!'
  },
  {
    title: 'Positionnement 📍',
    tip: 'Le meilleur dégâts du monde = inutile si tu es mort. Positionne-toi intelligemment!'
  },
  {
    title: 'Vision Control 👁️',
    tip: 'Place des wards stratégiquement. La vision = information = avantage!'
  },
  {
    title: 'Stick with Team 👥',
    tip: 'Les teamfights 5v5 = risqué seul. Reste avec ton équipe pour maximiser l\'impact!'
  },
  {
    title: 'Mute All Chat 🤐',
    tip: 'Le flame mental n\'aide pas. Mute les ennemis et reste focus sur le jeu!'
  },
  {
    title: 'Practice Champions 🏋️',
    tip: 'Maîtrise 2-3 champions en profondeur plutôt que 20 superficiellement!'
  },
  {
    title: 'Respect CDs 🔄',
    tip: 'Si l\'ennemi ultimate est up, sois plus prudent. Les CDs = opportunités!'
  },
  {
    title: 'Early Aggression 🔥',
    tip: 'Ganks et pressure early = contrôle du rythme. Pas late game passif!'
  },
  {
    title: 'Itemization 🛠️',
    tip: 'Adapte ta build à la situation. Pas une build one-size-fits-all!'
  },
  {
    title: 'Wave Management 🌊',
    tip: 'Comprends quand slow-push, fast-push ou freeze. C\'est fondamental!'
  },
  {
    title: 'Trading Windows 💥',
    tip: 'Trade dégâts quand ennemi peut pas répondre = free dégâts garantis!'
  },
  {
    title: 'Engage Decisively 🎯',
    tip: 'Commit ou pas. Moitié-engagement = vous perdez les teamfights!'
  },
  {
    title: 'Rotations Timing ⏰',
    tip: 'Rotate quand tu as avantage ou que lane push. Pas de random roams!'
  },
  {
    title: 'Objectives > Kills 🏆',
    tip: 'Tower > Kill > CS. Focus l\'objectif principal, pas juste fraglist!'
  },
  {
    title: 'Macro Priority 🎲',
    tip: 'Pense à long-term setup. Chaque action affecte le map pendant 10 min!'
  },
  {
    title: 'Self-Improvement 📈',
    tip: 'Replay tes games, analyse tes erreurs. Répétition = compétence!'
  },
  {
    title: 'Play Time 🕐',
    tip: 'Prends des breaks entre matches. Fatigue = mauvaises decisions!'
  },
  {
    title: 'Counter-Pick 🔄',
    tip: 'Si possible, counter-pick. Sinon, joue ce que tu maîtrises!'
  },
  {
    title: 'Mental Health 🧠',
    tip: 'Ranked = stressant. Prends soin de ton mental. Jeu = divertissement!'
  }
];

module.exports = {
  name: 'tip',
  aliases: ['astuce', 'conseil', 'advice'],
  category: 'Gaming',
  description: 'Conseil MLBB aléatoire',
  usage: '!tip',
  
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

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const tipText = `
╔════════════════════════════════════╗
║        💡 CONSEIL DU JOUR 💡        ║
╚════════════════════════════════════╝

*${randomTip.title}*

${randomTip.tip}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🎯 MÀJ QUOTIDIENNE:*
Relance !tip demain pour un nouveau conseil!

*📚 RESSOURCES:*
!mlbb - Guide complet
!meta - Meta actuelle
!lane <role> - Guides par lane
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: tipText });
  }
};
