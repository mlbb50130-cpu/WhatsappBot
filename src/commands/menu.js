const ModuleManager = require('../../utils/ModuleManager');

module.exports = {
  name: 'menu',
  aliases: ['m'],
  category: 'info',
  description: 'Menu principal avec tous les modules',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');

      if (!isGroup) {
        return showGlobalMenu(sock, jid);
      }

      const subcommand = args[0]?.toLowerCase();

      if (subcommand === 'mlbb') {
        return showMLBBMenu(sock, jid);
      } else if (subcommand === 'anime') {
        return showAnimeMenu(sock, jid);
      } else if (subcommand === 'fun') {
        return showFunMenu(sock, jid);
      } else if (subcommand === 'nsfw') {
        return showNSFWMenu(sock, jid);
      } else if (subcommand === 'xp') {
        return showXPMenu(sock, jid);
      } else if (subcommand === 'items') {
        return showItemsMenu(sock, jid);
      } else if (subcommand === 'quete') {
        return showQueteMenu(sock, jid);
      }

      return showMainMenu(sock, jid);
    } catch (error) {
      console.error('Erreur menu:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};

function showGlobalMenu(sock, jid) {
  let text = `╔════════════════════════════════════════╗
║     🎮 TETSUBOT - MENU PRINCIPAL      ║
╚════════════════════════════════════════╝

*Version:* 2.0.0
*Statut:* En ligne ✅

📊 *STATISTIQUES:*
• Héros MLBB: 45+
• Personnages Anime: 100+
• Quêtes: 50+
• Niveaux max: 300+

*Utilise cette commande en groupe pour plus d'options!*`;

  return sock.sendMessage(jid, { text });
}

function showMainMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  
  let text = `╔════════════════════════════════════════╗
║    📋 MODULES DU GROUPE - MENU         ║
╚════════════════════════════════════════╝

`;

  const mlbbStatus = status.mlbb.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `🎮 *MLBB* [${mlbbStatus}]\n`;
  text += `   Mobile Legends: Bang Bang\n`;
  text += `   !menu mlbb - Voir le menu complet\n\n`;

  const animeStatus = status.anime.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `📺 *ANIME* [${animeStatus}]\n`;
  text += `   Personnages, Waifus, Manga\n`;
  text += `   !menu anime - Voir le menu complet\n\n`;

  const funStatus = status.fun.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `🎲 *FUN* [${funStatus}]\n`;
  text += `   Jeux et amusements\n`;
  text += `   !menu fun - Voir le menu complet\n\n`;

  const nsfwStatus = status.nsfw.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `🔞 *NSFW* [${nsfwStatus}]\n`;
  text += `   Contenu adulte\n`;
  text += `   !menu nsfw - Voir le menu complet\n\n`;

  const xpStatus = status.xp.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `⭐ *SYSTÈME XP* [${xpStatus}]\n`;
  text += `   Niveaux et Classement\n`;
  text += `   !menu xp - Voir le menu complet\n\n`;

  const itemsStatus = status.items.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `🎁 *INVENTAIRE* [${itemsStatus}]\n`;
  text += `   Loot, Équipement, Chakra\n`;
  text += `   !menu items - Voir le menu complet\n\n`;

  const queteStatus = status.quete.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
  text += `📜 *QUÊTES* [${queteStatus}]\n`;
  text += `   Aventures quotidiennes\n`;
  text += `   !menu quete - Voir le menu complet\n\n`;

  text += `═══════════════════════════════════════\n`;
  text += `⚙️ *ADMIN COMMANDS:*\n`;
  text += `!setmodule on <module> - Activer\n`;
  text += `!setmodule off <module> - Désactiver\n`;
  text += `!setmodule status - Voir l'état`;

  return sock.sendMessage(jid, { text });
}

function showMLBBMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.mlbb.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║   🎮 MOBILE LEGENDS: BANG BANG         ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

📊 *INFOS HÉROS:*
!hero <nom>            Voir stats du héros
!build <hero>          Voir les builds
!counter <hero>        Matchups et counters
!combo <hero>          Combos efficaces

📋 *STRATÉGIE:*
!meta                  État du méta actuel
!lane <role>           Infos sur un rôle

👤 *PROFIL JOUEUR:*
!mlbb set <rang> <role>   Enregistrer ton profil
!mlbb me               Voir ton profil

👥 *ÉQUIPES:*
!team <nom>            Créer une équipe
!join <team>           Rejoindre une équipe
!leave <team>          Quitter une équipe

═══════════════════════════════════════
🆘 *AIDE:*
!mlbb                  Voir toutes les commandes`;

  return sock.sendMessage(jid, { text });
}

function showAnimeMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.anime.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║        📺 MODULE ANIME                 ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

🎬 *ANIME & MANGA:*
!anime <titre>         Infos sur un anime
!mangadex <titre>      Rechercher un manga
!topanime              Top 10 animes
!topmanga              Top 10 mangas

👥 *PERSONNAGES:*
!personnage <nom>      Infos personnage
!husbando <nom>        Ajouter un husbando
!waifu <nom>           Ajouter une waifu
!ship <perso1> <perso2>   Voir un ship

═══════════════════════════════════════
🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}

function showFunMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.fun.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║       🎲 MODULE FUN & JEUX            ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

🎮 *JEUX:*
!pfc                   Pierre-Papier-Ciseaux
!roulette              Roulette russe
!duel <user>           Duels entre joueurs
!quiz                  Quiz général
!quizanime             Quiz anime

🎭 *AMUSEMENT:*
!roast <user>          Insultes aléatoires
!chance                Ton niveau de chance

═══════════════════════════════════════
🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}

function showNSFWMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.nsfw.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║       🔞 CONTENU ADULTE                ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

⚠️ *ATTENTION:* Contenu réservé aux adultes

🎬 *CONTENU:*
!hentai                Images aléatoires
!hentaivd              Vidéos
!neko                  Neko images
!boahancook            Contenu spécial

═══════════════════════════════════════
⚙️ *CONFIGURATION:*
!allowhentai <user>    Autoriser un utilisateur

🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}

function showXPMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.xp.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║       ⭐ SYSTÈME XP & NIVEAUX          ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

👤 *PROFIL:*
!xp                    Voir ton XP actuel
!level                 Voir ton niveau
!profil                Profil complet
!stats                 Tes statistiques

🏆 *CLASSEMENT:*
!rank                  Ton rang
!classement            Top 10 joueurs

═══════════════════════════════════════
📊 *SYSTÈME:*
• XP: +5 par message (cooldown 1min)
• Niveaux: 1-300
• Récompenses: Chakra, Items, Badge

🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}

function showItemsMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.items.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║       🎁 INVENTAIRE & ÉQUIPEMENT       ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

🎒 *INVENTAIRE:*
!inventaire            Voir tes items
!loot                  Loot aléatoire
!equip <item>          Équiper un item

⚔️ *ÉQUIPEMENT:*
!equipement            Ton équip actuel
!chakra                Recharge chakra
!chakratest            Test ton chakra

═══════════════════════════════════════
💰 *ÉCONOMIE:*
• Loot: Loots quotidiens
• Chakra: Ressource principale
• Items: Rares et légendaires

🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}

function showQueteMenu(sock, jid) {
  const status = ModuleManager.getGroupStatus(jid);
  const enabled = status.quete.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

  let text = `╔════════════════════════════════════════╗
║         📜 QUÊTES & AVENTURES          ║
║              [${enabled}]              ║
╚════════════════════════════════════════╝

📋 *QUÊTES:*
!quete                 Voir tes quêtes
!quotidien             Quêtes du jour
!hebdo                 Quêtes de la semaine
!quetelundi            Quête du lundi

🎯 *RÉCOMPENSES:*
• XP boosted
• Items rares
• Chakra bonus

═══════════════════════════════════════
📊 *PROGRESSION:*
!quete status          État des quêtes
!quete claim           Réclamer récompenses

🆘 *AIDE:*
!menu                  Retour au menu principal`;

  return sock.sendMessage(jid, { text });
}
