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

**!duel @user** - Défier un utilisateur en duel (1 duel)
  ├─ Coût: 20 chakra
  ├─ Récompense gagnant: +30 XP
  ├─ Récompense perdant: +10 XP
  ├─ Bonus duel win: +5 puissance
  ├─ Calcul: powerlevel + random(10-50)
  └─ Les duels comptent pour les quêtes

**!duel @user 5** - Duels multiples (2-10 duels max)
  ├─ Syntaxe: !duel @user [nombre]
  ├─ Coût total: 20 chakra × nombre de duels
  ├─ Résumé final avec statistiques complètes
  ├─ Victoires/Défaites totales
  ├─ XP gagnés au total
  └─ Différence de puissance accumulée

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
  ├─ Coût: 500 gold par utilisation
  ├─ Ressource: Gold quotidien (reset 24h à 5000)
  ├─ Victoire: +100 XP (pas de gold)
  ├─ Défaite: +20 XP (perte du gold)
  ├─ Affiche solde gold actuel
  └─ Cooldown: 10 secondes

**!chance** - Test ta chance du jour
  ├─ Score de 1 à 100
  ├─ Affecte les récompenses
  └─ Change chaque jour

💰 *GOLD & TRAVAIL*

**!work** - Travailler pour gagner du gold
  ├─ Coût: Aucun
  ├─ Récompense: 100-300 gold aléatoire
  ├─ 8 métiers différents (Cultivateur, Marchand, Chasseur, Apothicaire, Mineur, Forgeron, Alchimiste, Escorte)
  ├─ Cooldown: 1 heure
  └─ Cumulable avec !daily

**!daily** - Bonus quotidien de gold
  ├─ Coût: Aucun
  ├─ Récompense: 750-1000 gold une fois/24h
  ├─ À cumuler avec !work (max ~8200 gold/24h)
  ├─ Affiche temps avant prochain bonus
  └─ Réinitialisable à heure fixe chaque jour

**!gold** - Voir ton solde de gold
  ├─ Gold actuel
  ├─ Gold maximal (5000)
  └─ Affiche dernier reset

════════════════════════════════════════════════════════════════

Tape \`!documentation 3\` pour voir la suite...
`;
      } else if (pageNum === 3) {
        responseText = `
╔════════════════════════════════════════════════════════════════╗
║         📚 DOCUMENTATION COMPLÈTE DU BOT - PAGE 3/5 📚         ║
╚════════════════════════════════════════════════════════════════╝

� *QUIZ & QUÊTES*

**!quiz** - Quiz otaku aléatoire (200+ questions!)
  ├─ Type: Questions sur animes/mangas
  ├─ Couverture: Naruto, One Piece, Bleach, MHA, JJK, Demon Slayer, Attack on Titan, Black Clover, Death Note, Code Geass, Steins;Gate, Sailor Moon & PLUS!
  ├─ Récompense correcte: +15-30 XP (selon difficulté)
  ├─ Récompense fausse: +3 XP
  ├─ Format: 4 réponses possibles (A, B, C, D)
  ├─ Compte pour les quêtes
  ├─ Cooldown: 30 secondes (anti-spam)
  ├─ Répondre avec: !reponse A / !reponse B / !reponse C / !reponse D
  └─ Pas de limite de quiz par jour!

**!quest** - Voir les quêtes actives
  ├─ Types de quêtes: Win duel, Quiz correct, Récolter gold
  ├─ Format: Objectif / Récompense / Progression
  ├─ Récompense complète: ~200 XP + 200 gold
  ├─ À renouveler après 24h
  ├─ Limite: 5 quêtes actives max
  └─ Motivation quotidienne

**!validate** - Valider une quête (après accomplissement)
  ├─ Coût: Aucun
  ├─ Attente requise: Au moins 5 secondes entre quête et validation
  ├─ Récupère automatique les récompenses
  ├─ Confirme avec emoji ✅
  └─ À faire manuellement après accomplissement

**!newquest** - Générer une nouvelle quête (max 5)
  ├─ Coût: Aucun
  ├─ Quête remplacée: La prochaine échouée
  ├─ Format: Identique aux quêtes générées
  ├─ Renouvellement: 24h après création
  └─ Utile si quête trop difficile

**!mysterybox** - Coffre mystérieux aléatoire
  ├─ Coût: 50 gold par ouverture
  ├─ Contenu: XP (5-30), Gold (10-100), Chakra, Badass, Buff
  ├─ Rareté: Affichée avec couleur (Commun-Rare-Épique-Légendaire)
  ├─ Cooldown: 10 secondes
  └─ Gamble content avec bonus possible

🎊 *RÉCOMPENSES & ÉVÉNEMENTS*

**!dailyreward** - Récompense quotidienne spéciale
  ├─ Différente de !daily
  ├─ Bonus: 150-300 XP aléatoire
  ├─ Réinitialisation: Tous les jours
  ├─ Streak: Bonus accru si connecté tous les jours
  └─ Alternative aux quêtes

**!badge** - Voir tes badges/accomplissements
  ├─ 15+ badges disponibles
  ├─ Déverrouillés par: Quêtes, Événements, Milestones
  ├─ Affichage: Liste avec descriptions
  ├─ Contribution: Ajoute prestige au profil
  └─ Collectathon motivant

**!special** - Commandes spéciales aléatoires
  ├─ Peut être: Event, Item, Mystery
  ├─ Récompense variable
  ├─ Rare à déclencher
  └─ Surprise d'événement!

**!birthday** - Fêter l'anniversaire d'un joueur
  ├─ Utilisateur: Celui mentionné en @user
  ├─ Récompense: +50 XP + "Joyeux anniversaire 🎂"
  ├─ Emoji: 🎂🎉🎈
  └─ Engagement communautaire

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
  ├─ Tête, Corps, Mains, Pieds
  ├─ Rareté de chaque item (⚪🔵🟣🟡)
  ├─ XP/h passif par équipement
  ├─ Total XP/h passif gagnés
  └─ ⚪ Commun +10 | 🔵 Rare +25 | 🟣 Epic +50 | 🟡 Légendaire +80

**!equip <item>** - Équiper un item
  ├─ Utilisation: !equip nom_item
  ├─ Modifie tes stats
  └─ Déséquipe automatiquement l'ancien

**!badges** - Affiche tes badges
  ├─ Achievements débloqués
  ├─ Dates d'obtention
  └─ Descriptions

💰 *GESTION DE GOLD AVANCÉE*

**Systèmes de Gain:**
  ├─ !work: +100-300 gold (Cooldown: 1h, max ~7200/jour)
  ├─ !daily: +750-1000 gold (1x/24h, max 1000/jour)
  └─ Total possible: ~8200 gold/24h

**Systèmes de Dépense:**
  ├─ !roulette: -500 gold par tentative
  └─ Réinitialisation automatique à 5000/24h

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

💎 XP & Niveau: Gagnez XP par messages, quiz, duels, équipements
🎖️ Chakra: Resource 24h, utilisé pour les duels
⚔️ Duels: Combats PvP avec récompenses
📜 Quêtes: Objectives quotidiennes & hebdomadaires
🎁 Loots: Trésor aléatoire avec cooldown 1h
📸 Assets: 22 catégories d'images anime
🎰 Roulette: Jeu avec gold quotidien (500 gold/utilisation)
💰 Gold: Monnaie spéciale réinitialisée 24h (5000 max)
⚙️ Équipement: Gain XP passif +10 à +80 XP/h selon rareté
🏆 Tournoi: Compétition quiz interactive 4 étapes
🛡️ Anti-Spam: Ban 30 min pour usage rapide (< 500ms)

════════════════════════════════════════════════════════════════

*IMPORTANT - SÉCURITÉ:*

⚠️ ANTI-SPAM: Utilisation rapide/simultanée = BAN 30 MIN
  ├─ Détection automatique < 500ms entre commandes
  ├─ Accès limité à !profil pendant le ban
  ├─ Aucun XP gagnés pendant le ban
  └─ Déblocage automatique après 30 min

⚠️ COOLDOWN: 6 secondes minimum entre commandes
  ├─ Chaque commande peut avoir son propre cooldown
  └─ Respectez les limites!

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
