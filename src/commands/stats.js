module.exports = {
  name: 'stats',
  description: 'Voir tes statistiques',
  category: 'PROFIL',
  usage: '!stats',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const winRate = user.stats.duels > 0 
      ? Math.round((user.stats.wins / user.stats.duels) * 100) 
      : 0;

    const stats = `
╔════════════════════════════════════════╗
║         📊 TES STATISTIQUES 📊        ║
╚════════════════════════════════════════╝

*💬 ACTIVITÉ*
  ├─ Messages: ${user.stats.messages}
  ├─ Quizzes complétés: ${user.stats.quiz}
  └─ Duels participés: ${user.stats.duels}

*⚔️ COMBATS*
  ├─ Victoires: ${user.stats.wins}
  ├─ Défaites: ${user.stats.losses}
  └─ Taux de victoire: ${winRate}%

*📈 PROGRESSION*
  ├─ Niveau: ${user.level}
  ├─ XP total: ${user.xp}
  ├─ Badges: ${user.badges.length}
  └─ Objets: ${user.inventory.length}/50

*⚠️ INFRACTIONS*
  └─ Avertissements: ${user.warnings}/3

════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: stats });
  }
};
