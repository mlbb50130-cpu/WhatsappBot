// COMMANDE: !tip - Conseils aléatoires MLBB
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
    tip: 'Une bonne agression early peut bloquer la farm adverse et créer des avantages!'
  },
  {
    title: 'Itemization Smart 🛠️',
    tip: 'Adapte tes items à la situation. Contre AP? Achète Magic Resist. C\'est pas rocket science!'
  }
];

module.exports = {
  name: 'tip',
  aliases: ['tips', 'conseil', 'conseils'],
  category: 'gaming',
  description: 'Conseil MLBB aléatoire',
  usage: '!tip',
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const tipMessage = `
╔═══════════════════════════════════╗
║        💡 𝔆𝔒𝔑𝔖𝔈𝔌𝔏 𝔐𝔏𝔅𝔅 💡         ║
╚═══════════════════════════════════╝

*${randomTip.title}*

${randomTip.tip}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Tape !tip pour un nouveau conseil`;

    return sock.sendMessage(from, { text: tipMessage });
  }
};
