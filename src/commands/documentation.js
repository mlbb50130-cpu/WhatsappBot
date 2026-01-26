const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'documentation',
  description: 'Documentation complète du bot',
  category: 'BOT',
  usage: '!documentation',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const pageNum = parseInt(args[0]) || 1;
      let responseText = '';

      if (pageNum === 1) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 1/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

🎮 *SYSTÈME DE PROFIL & PROGRESSION*

**!profil** - Affiche ton profil complet
  ├─ Niveau actuel
  ├─ Points d'expérience (XP)
  ├─ Rang/Titre
  ├─ Statistiques globales
  └─ Inventaire équipé

**!level** - Voir ton niveau détaillé
  ├─ Niveau actuel
  ├─ XP vers le prochain niveau
  ├─ Barre de progression
  └─ Récompenses débloquées

**!xp** - Affiche tes points XP
  ├─ XP total accumulé
  ├─ XP par niveau
  └─ Progression globale

**!rank** - Ton classement global
  ├─ Position dans le classement
  ├─ Points de comparaison
  └─ Utilisateurs à proximité

**!powerlevel** - Ton niveau de puissance
  ├─ Puissance actuelle
  ├─ Calcul: Base 100 + (niveau×10) + bonus
  ├─ Bonus de +5 par duel gagné
  └─ Affiché lors des duels

**!stats** - Tes statistiques détaillées
  ├─ Messages envoyés
  ├─ Duels joués (wins/losses)
  ├─ Quiz réussis
  ├─ Loots ouverts
  └─ Ratio de victoire

════════════════════════════════════════════════════════════════

Tape \`!documentation 2\` pour voir la suite...
`;
      } else if (pageNum === 2) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 2/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

⚔️ *SYSTÈME DE COMBAT & DUELS*

**!duel @user** - Défier un utilisateur en duel
  ├─ Coût: 20 chakra
  ├─ Récompense gagnant: +30 XP
  ├─ Récompense perdant: +10 XP
  ├─ Bonus duel win: +5 puissance
  ├─ Calcul: powerlevel + random(10-50)
  └─ Les duels comptent pour les quêtes

**!chakra** - Voir ton chakra (ressource de mana)
  ├─ Chakra actuel / maxChakra
  ├─ Réinitialisation: Chaque 24h
  ├─ Calcul maxChakra: 100 + (niveau-1)×10
  ├─ Barre visuelle de progression
  └─ Compte à rebours avant reset

**!chakratest** - Test/debug des stats chakra
  ├─ Affiche infos détaillées
  ├─ Dernière réinitialisation
  ├─ Heures avant prochain reset
  └─ Utile pour vérifier les bugs

🎯 *MINI-JEUX*

**!pfc <choix>** - Pierre-Feuille-Ciseaux
  ├─ Utilisation: !pfc pierre / !pfc feuille / !pfc ciseaux
  ├─ Récompense gagner: +20 XP
  ├─ Récompense égalité: +10 XP
  ├─ Récompense perdre: +5 XP
  └─ Cooldown: 5 secondes

**!roulette** - Roulette russe (jeu de hasard)
  ├─ Risque élevé, récompense importante
  ├─ Peut augmenter/diminuer XP
  └─ À utiliser avec prudence

**!chance** - Test ta chance du jour
  ├─ Score de 1 à 100
  ├─ Affecte les récompenses
  └─ Change chaque jour

════════════════════════════════════════════════════════════════

Tape \`!documentation 3\` pour voir la suite...
`;
      } else if (pageNum === 3) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 3/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

📚 *QUIZ & CONNAISSANCE*

**!quiz** - Quiz otaku aléatoire
  ├─ Type: Questions sur animes/mangas
  ├─ Récompense correcte: +15 XP
  ├─ Récompense fausse: +3 XP
  ├─ Compte pour les quêtes
  └─ Répondre avec: !reponse <réponse>

**!quizanime** - Quiz spécialisé animes
  ├─ Questions avancées sur animes
  ├─ Niveau de difficulté: Moyen-Difficile
  └─ Récompense: +20 XP si correct

**!reponse <réponse>** - Répondre à une question
  ├─ Format: !reponse a / !reponse b / etc
  ├─ Validation automatique
  └─ Feedback immédiat

**!blagueotaku** - Blague otaku aléatoire
  ├─ Humour relatif à l'anime
  ├─ Gratuit, pas de XP
  └─ Juste pour rire!

🎁 *QUÊTES & RÉCOMPENSES*

**!quete** - Voir tes quêtes actuelles
  ├─ Quêtes du jour
  ├─ Quêtes hebdomadaires
  ├─ Progression complète
  └─ Objectifs restants

**!quetejour** - Quêtes du jour uniquement
  ├─ Objectif 1: 50 messages
  ├─ Objectif 2: 3 duels gagnés
  ├─ Objectif 3: 5 quiz réussis
  ├─ Réinitialisation: Chaque 24h
  └─ Bonus complétion: +100 XP

**!hebdo** - Quêtes hebdomadaires
  ├─ Objectif 1: 10 loots ouverts
  ├─ Objectif 2: Atteindre niveau 10
  ├─ Réinitialisation: Chaque lundi
  └─ Bonus complétion: +250 XP

**!queteprogress** - Progression détaillée
  ├─ Messages: X/50 pour quête jour
  ├─ Duels: X/3 gagnés
  ├─ Quiz: X/5 corrects
  ├─ Loots: X/10 ouverts
  └─ Barre visuelle de progression

**!loot** - Ouvrir un loot aléatoire
  ├─ Types: Objet, XP, Chakra
  ├─ Rareté: Commun → Légendaire
  ├─ Cooldown: 1 heure
  └─ Compte pour les quêtes

════════════════════════════════════════════════════════════════

Tape \`!documentation 4\` pour voir la suite...
`;
      } else if (pageNum === 4) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 4/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

📸 *COMMANDES ASSET (IMAGES)*

Les commandes asset envoient des images aléatoires et donnent +15 XP
⚠️ UNIQUEMENT en groupe - PAS DE XP en DM

**Anime/Personnages:**
  ├─ !naruto - Naruto Uzumaki 🧡
  ├─ !madara - Madara Uchiha 🔴
  ├─ !gokuui - Goku Ultra Instinct ⚡
  ├─ !deku - Deku (My Hero Academia) 💚
  ├─ !gojo - Gojo (Jujutsu Kaisen) 👁️
  ├─ !sukuna - Sukuna (Jujutsu Kaisen) 👹
  ├─ !jinwoo - Sung Jinwoo (Solo Leveling) 💜
  ├─ !zerotwo - Zero Two (DITF) 💕
  ├─ !livai - Levi (Attack on Titan) ❄️
  ├─ !tengen - Tengen Uzui (Demon Slayer) ⚔️
  ├─ !rengokudemon - Rengoku (Demon Slayer) 🔥
  └─ !tsunade - Tsunade (Naruto) 💛

**Personnages Féminins:**
  ├─ !miku - Miku Nakano (HD) 💙
  ├─ !mikunakano - Miku (5-toubun) 💗
  ├─ !nino - Nino Nakano (5-toubun) 💚
  ├─ !makima - Makima (Chainsaw Man) 🔴
  ├─ !yoruichi - Yoriichi (Demon Slayer) 🌙
  ├─ !boahancook - Boa Hancock (One Piece) 🐍
  ├─ !waifu - Waifu aléatoire 🥰
  └─ !husbando - Husbando aléatoire 😍

**Collections Spéciales:**
  ├─ !bleach - Personnages Bleach ⚪
  ├─ !yami - Yami (Black Clover) 🖤
  └─ !nsfw - NSFW (18+) 🔞

📺 *ANIME & MANGA*

**!anime <nom>** - Infos sur un anime
  ├─ Titre & synopsis
  ├─ Nombre d'épisodes
  ├─ Date de sortie
  ├─ Studio d'animation
  └─ Score MyAnimeList

**!animegif** - GIF anime aléatoire
  ├─ GIF de memes/réactions
  └─ Pour le fun!

**!topanime** - Top 10 animes
  ├─ Meilleurs animes selon MyAnimeList
  ├─ Score & popularité
  └─ Descriptions courtes

**!manga <nom>** - Infos sur un manga
  ├─ Titre & synopsis
  ├─ Chapitres publiés
  ├─ Auteur & illustrateur
  └─ État (En cours/Terminé)

**!topmanga** - Top 10 mangas
  ├─ Meilleurs mangas selon MyAnimeList
  └─ Scores & classement

**!personnage** - Infos personnage anime
  ├─ Nom & anime/manga
  ├─ Caractéristiques
  ├─ Rôle & importance
  └─ Popularité

**!voiranime** - Lien regarder animes
  ├─ Plateformes de streaming recommandées
  └─ Où regarder légalement

════════════════════════════════════════════════════════════════

Tape \`!documentation 5\` pour voir la suite...
`;
      } else if (pageNum === 5) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 5/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

🎭 *INTERACTIONS & JEUX SOCIAUX*

**!neko** - Chat neko aléatoire
  ├─ Images de chats kawai
  └─ Gratuit, pas de cooldown

**!ship <user1> <user2>** - Calculer compatibilité
  ├─ Pourcentage de compatibilité: 0-100%
  ├─ Sarcasme amusant
  └─ Juste pour rire!

**!roast** - Reçois une insulte humoristique
  ├─ Insultes otaku
  ├─ À prendre à la légère
  └─ Changent chaque fois

🎖️ *ÉQUIPEMENT & INVENTAIRE*

**!inventaire** - Voir ton inventaire
  ├─ Tous les items trouvés
  ├─ Quantité de chaque
  ├─ Rareté (Commun → Légendaire)
  └─ Date d'acquisition

**!equipement** - Voir équipement équipé
  ├─ Tête
  ├─ Corps
  ├─ Mains
  ├─ Pieds
  └─ Stats bonifiées

**!equip <item>** - Équiper un item
  ├─ Utilisation: !equip nom_item
  ├─ Modifie tes stats
  └─ Déséquipe automatiquement l'ancien

**!badges** - Affiche tes badges
  ├─ Achievements débloqués
  ├─ Dates d'obtention
  └─ Descriptions

📊 *CLASSEMENTS & INFOS*

**!classement** - Top 10 joueurs
  ├─ Classement global XP
  ├─ Noms & niveaux
  ├─ XP total de chacun
  └─ Mis à jour en temps réel

**!help [commande]** - Aide détaillée
  ├─ Utilisatin: !help duel
  ├─ Description complète
  ├─ Exemple d'utilisation
  └─ Paramètres requis

**!menu** - Menu complet des commandes
  ├─ Affiche toutes les catégories
  ├─ Commandes disponibles
  └─ Rapide et facile

**!assets** - Liste des commandes asset
  ├─ Toutes les images disponibles
  ├─ Emojis & descriptions
  └─ Nombres de photos par catégorie

**!ping** - Vérifier latence du bot
  ├─ Temps de réponse en ms
  ├─ Status du serveur
  └─ Pas de cooldown

**!info** - Infos sur le bot
  ├─ Version du bot
  ├─ Nombre de commandes
  ├─ Créateur
  └─ Plateforme

**!regles** - Règles du serveur
  ├─ Comportement attendu
  ├─ Conditions d'utilisation
  └─ Sanctions pour violations

🔧 *COMMANDES ADMIN*

**!activatebot** - Activer le bot dans le groupe
  ├─ Admin du groupe requis
  ├─ Active tous les systèmes
  └─ Enregistre le groupe en BD

**!deactivatebot** - Désactiver le bot
  ├─ Admin du groupe + Bot Admin requis
  ├─ Désactive les commandes
  └─ Peut être réactivé

════════════════════════════════════════════════════════════════

*RÉSUMÉ DES SYSTÈMES:*

💎 XP & Niveau: Gagnez XP par messages, quiz, duels
🎖️ Chakra: Resource 24h, utilisé pour les duels
⚔️ Duels: Combats PvP avec récompenses
📜 Quêtes: Objectives quotidiennes & hebdomadaires
🎁 Loots: Trésor aléatoire avec cooldown 1h
📸 Assets: 22 catégories d'images anime

════════════════════════════════════════════════════════════════

Besoin d'aide? Tape \`!help <commande>\` pour plus d'infos!
`;
      } else {
        responseText = '❌ Page non trouvée. Tape `!documentation 1` pour commencer.';
      }

      await sock.sendMessage(senderJid, { text: responseText });
    } catch (error) {
      console.error('Error in documentation command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};
