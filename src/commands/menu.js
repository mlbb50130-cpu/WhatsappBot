module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  category: 'BOT',
  usage: '!menu',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    
    const menu = `
╔════════════════════════════════════════╗
║     🎌 TETSUBOT - OTAKU RPG BOT 🎌    ║
╚════════════════════════════════════════╝

📚 *CATÉGORIES DE COMMANDES*

👤 *PROFIL & LEVEL*
\`!profil\` - Voir ton profil
\`!level\` - Voir ton niveau
\`!xp\` - Voir ton XP
\`!rank\` - Voir ton rang
\`!stats\` - Voir tes stats
\`!badges\` - Voir tes badges

⚔️ *DUELS & COMBATS*
\`!duel @user\` - Défier un utilisateur
\`!powerlevel\` - Voir ton power level
\`!chakra\` - Voir ton chakra

📖 *QUÊTES & RPG*
\`!quete\` - Voir les quêtes disponibles
\`!quotidien\` - Mission quotidienne
\`!hebdo\` - Mission hebdomadaire

🎯 *QUIZ & MINI-JEUX*
\`!quiz\` - Lancer un quiz otaku
\`!quizanime\` - Quiz anime
\`!pfc\` - Pierre-Feuille-Ciseaux
\`!roulette\` - Roulette russe (500 gold)

🎁 *LOOT & INVENTAIRE*
\`!loot\` - Lancer un loot
\`!inventaire\` - Voir ton inventaire
\`!collection\` - Voir ta collection

🎨 *IMAGES ANIME*
\`!waifu\` - Image waifu aléatoire
\`!husbando\` - Image husbando aléatoire
\`!neko\` - Image chat anime
\`!animegif\` - GIF anime aléatoire

🎪 *FUN*
\`!blagueotaku\` - Blague otaku
\`!roast @user\` - Faire un roast
\`!chance\` - Voir ta chance du jour
\`!ship @user1 @user2\` - Shipper deux personnes

📺 *ANIME & MANGA*
\`!anime Naruto\` - Info sur un anime
\`!manga OnePiece\` - Info sur un manga
\`!personnage Gojo\` - Info sur un personnage

🏆 *CLASSEMENTS*
\`!topanime\` - Top 10 des animes
\`!topmanga\` - Top 10 des mangas
\`!classement level\` - Classement par niveau

📌 *BOT*
\`!ping\` - Latence du bot
\`!info\` - Info du bot
\`!regles\` - Règles du groupe
\`!help [commande]\` - Aide sur une commande

═════════════════════════════════════════

*Utilise le préfixe !*
Exemple: \`!profil\`

💎 Gagne de l'XP en parlant dans le chat!
🎯 Complète des quêtes et des missions!
⚡ Affronte d'autres joueurs en duel!

═════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: menu });
  }
};
