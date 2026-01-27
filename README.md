# 🤖 TetsuBot - Otaku RPG WhatsApp Bot

Un bot WhatsApp complet et modulaire avec système RPG otaku, niveaux, quêtes, duels et bien plus!

## 🎯 Caractéristiques

- **🎖️ Système de niveaux** - Gagnez XP automatiquement par messages
- **⚔️ Duels PvP** - Affrontez d'autres joueurs
- **📚 Quiz Otaku** - Questions sur anime/manga (99+ questions)
- **🎁 Système de Loot** - Ouvrez des coffres aléatoires
- **🎨 Images Anime** - Waifu, Husbando, GIF anime
- **🎯 Quêtes** - Missions quotidiennes et hebdomadaires
- **🔐 Modération** - Avertissements, bans, kicks
- **⚙️ Admin** - Contrôle total du bot (restreint aux admins)
- **📊 Inventaire** - Collectionnez des objets avec rareté
- **🏆 Classements** - Compétition globale
- **🎰 Roulette** - Jeu de hasard avec système de gold quotidien
- **⚙️ Équipement** - Gain XP passif toutes les heures selon rareté
- **🛡️ Anti-Spam** - Protection contre l'utilisation rapide de commandes
- **🎪 Mini-jeux** - Ship, Chance, Pierre-Feuille-Ciseaux

## 🛠️ Stack Technique

- **Node.js** - Runtime JavaScript
- **Baileys** - Client WhatsApp multi-device
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **Axios** - Client HTTP

## 📦 Installation

### Prérequis
- Node.js >= 16
- MongoDB
- NPM ou Yarn

### Étapes

1. **Clone le repo**
```bash
git clone <repo-url>
cd TetsuBot
```

2. **Installe les dépendances**
```bash
npm install
```

3. **Configure l'environnement**
```bash
cp .env.example .env
# Édite .env avec tes paramètres
```

4. **Lance le bot**
```bash
npm start
```

5. **Première utilisation**
   - Scanne le QR code avec WhatsApp
   - Attends la connexion
   - Commence à utiliser les commandes!

## 📋 Configuration (.env)

```env
MONGODB_URI=mongodb://localhost:27017/tetsubot
WHATSAPP_SESSION_NAME=tetsubot_session
NODE_ENV=development
BOT_PREFIX=!
ADMIN_JIDS=120363xxxxxx@g.us,120363xxxxxx@g.us
```

## 🚀 Commandes

### 👤 Profil & Niveau
```
!profil        - Voir ton profil
!level         - Voir ton niveau
!xp            - Voir ton XP
!stats         - Voir tes stats
!badges        - Voir tes badges
```

### ⚔️ Duels & Combats
```
!duel @user    - Défier un utilisateur
!powerlevel    - Voir ton power level
!chakra        - Voir ton chakra
```

### 📚 Quiz
```
!quiz          - Lancer un quiz otaku
!reponse A     - Répondre A/B/C/D
```

### 🎁 Loot
```
!loot          - Ouvrir un loot aléatoire
!inventaire    - Voir ton inventaire
```

### 🎨 Images
```
!waifu         - Image waifu aléatoire
!husbando      - Image husbando aléatoire
```

### 🎪 Fun
```
!chance        - Voir ta chance du jour
!roast @user   - Faire un roast
!ship @u1 @u2 - Shipper deux personnes
!pfc           - Pierre-Feuille-Ciseaux
!roulette      - Roulette russe (500 gold, +100 XP si survécu)
```

### 🛡️ Équipement & Gold
```
!equipement    - Voir tes équipements et XP passif/h
!gold          - Voir ton solde de gold
```

### 🏆 Tournoi
```
!tournoisquiz  - Lancer un tournoi quiz interactif (admin)
```

### 🛡️ Admin (ADMIN SEULEMENT)
```
!kick @user         - Expulser un utilisateur
!warn @user raison  - Avertir un utilisateur
!setxp @user 500    - Définir l'XP
```

### 📌 Bot
```
!menu          - Afficher le menu
!help          - Aide générale
!help commande - Aide sur une commande
!ping          - Latence du bot
!info          - Info du bot
```

## 📁 Structure du Projet

```
/src
 ├─ index.js                → Point d'entrée principal
 ├─ handler.js              → Gestion des messages et commandes
 ├─ config.js               → Configuration centralisée
 ├─ database.js             → Connexion MongoDB
 ├─ commands/
 │   ├─ profil.js
 │   ├─ level.js
 │   ├─ quiz.js
 │   ├─ duel.js
 │   ├─ loot.js
 │   ├─ waifu.js
 │   ├─ fun.js
 │   ├─ admin/
 │   │   ├─ kick.js
 │   │   ├─ warn.js
 │   │   └─ setxp.js
 ├─ models/
 │   ├─ User.js             → Schéma utilisateur
 │   ├─ Inventory.js        → Inventaire
 │   ├─ Quest.js            → Quêtes
 │   └─ Warn.js             → Avertissements
 └─ utils/
     ├─ xpSystem.js         → Calculs XP/Niveaux
     ├─ cooldown.js         → Gestion cooldown
     ├─ antiSpam.js         → Anti-spam
     ├─ antiLink.js         → Anti-lien
     ├─ permissions.js      → Gestion permissions
     └─ random.js           → Utilitaires aléatoires
```

## 🎮 Système de Niveaux

### Rangs par Niveau
- **Lv 1-5**: 🥋 Genin Otaku
- **Lv 6-10**: 🎌 Chuunin Otaku
- **Lv 11-20**: ⚔️ Jounin Otaku
- **Lv 21-30**: 👨‍🏫 Sensei Otaku
- **Lv 31-50**: ✨ Légende Otaku
- **Lv 51+**: 👑 Dieu Otaku

### Gain d'XP
- 💬 Message: +5 XP (cooldown 5s)
- 🎯 Quiz: +25 XP
- ⚔️ Duel gagné: +30 XP
- 🎁 Loot: +10-100 XP (selon rareté)
- 🎰 Roulette: +100 XP (victoire) / +20 XP (défaite)
- ⚙️ Équipement: +10-80 XP/h passif (selon rareté)

### Système de Gold
- 💰 Gold initial: 5000 gold par utilisateur
- 🎰 Roulette: -500 gold par utilisation
- 🔄 Réinitialisation: Toutes les 24h à 5000 gold

### Système d'Équipement Passif
- ⚪ Common: +10 XP/h
- 🔵 Rare: +25 XP/h
- 🟣 Epic: +50 XP/h
- 🟡 Legendary: +80 XP/h

## 🛡️ Modération & Sécurité

### Système d'Avertissements
- **1-2 avertissements**: Avertissement enregistré
- **3 avertissements**: BAN automatique

### Anti-Spam
- 🚫 Détecte l'utilisation rapide/simultanée de commandes (< 1500ms)
- 🔒 Ban automatique de 30 minutes
- 🔓 Accès limité à `!profil` pendant le ban
- ❌ Aucun gain XP pendant le ban

### Commandes Admin (Restreintes)
```
!kick @user              - Expulser du groupe
!warn @user raison       - Avertir (3 = ban)
!setxp @user 500         - Modifier XP
!tournoisquiz            - Créer tournoi interactif
```

### Cooldown
- **Par défaut**: 6 secondes entre chaque commande
- **Personnalisé**: Chaque commande peut avoir son cooldown

## 🔌 API Externes

- **Waifu.pics** - Images anime
- **Jikan** - Données anime/manga (optionnel)

## 🚀 Déploiement

### Railway
```bash
npm install
npm start
```

### Heroku
```bash
heroku login
heroku create my-tetsubot
git push heroku main
```

### VPS (Ubuntu)
```bash
sudo apt-get install nodejs mongodb
npm install -g pm2
pm2 start src/index.js --name tetsubot
pm2 startup
pm2 save
```

## 📝 Format Standard d'une Commande

```javascript
module.exports = {
  name: "commande",
  description: "Description",
  category: "CATEGORIE",
  usage: "!commande",
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,
  
  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    // Code ici
  }
};
```

## 🐛 Dépannage

### Bot ne se connecte pas
```bash
# Supprime la session et relance
rm -rf tetsubot_session
npm start
```

### MongoDB ne se connecte pas
```bash
# Vérifie que MongoDB est lancé
mongod --version
# Ou lance with Docker
docker run -d -p 27017:27017 mongo
```

### Erreurs de permissions
- Assure-toi que le bot est admin du groupe
- Vérifie les permissions dans config.js

## 📖 Documentation API

### User Model
```javascript
{
  jid: String,           // ID WhatsApp unique
  username: String,      // Nom d'utilisateur
  xp: Number,            // Expérience
  level: Number,         // Niveau
  rank: String,          // Rang actuel
  title: String,         // Titre personnalisé
  badges: Array,         // Badges gagnés
  inventory: Array,      // Inventaire
  stats: {
    messages: Number,    // Messages envoyés
    quiz: Number,        // Quiz complétés
    wins: Number,        // Victoires
    losses: Number,      // Défaites
    duels: Number        // Duels
  },
  warnings: Number,      // Avertissements
  isBanned: Boolean,     // Banni?
  isMuted: Boolean,      // Mute?
  gold: Number,          // Solde de gold (défaut 5000)
  spamBannedUntil: Date, // Ban anti-spam jusqu'à date
  lastCommandTime: Date, // Timestamp dernière commande
  equipped: Object,      // Équipement actuels
  lastGoldReset: Date,   // Date dernier reset de gold
  createdAt: Date        // Date création
}
```

## 🤝 Contribution

Les contributions sont bienvenues! N'hésite pas à:
1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

## � Changements Récents (v1.1.0)

### ✨ Nouvelles Fonctionnalités
- **🎰 Système de Roulette** - Jeu avec gold quotidien
- **⚙️ Équipement Passif XP** - Gain XP automatique toutes les heures
- **🛡️ Anti-Spam Avancé** - Détection et ban des utilisations rapides
- **🎪 Tournoi Interactif** - Configuration 4 étapes pour quiz personnalisés
- **🪙 Système de Gold** - Monnaie avec réinitialisation quotidienne

### 🔧 Améliorations
- Cooldown augmenté de 3s à 6s (par défaut)
- Restriction des commandes admin au bot lui-même
- Messages avec images formatées visuellement
- XP gagnés par messages en groupe

### 🐛 Corrections
- XP rewards tournoi (async/await)
- Cooldown de loot corrigé
- Gestion des valeurs null en équipement
- Messages XP en groupe

## �📄 Licence

MIT License - vois [LICENSE](LICENSE) pour plus de détails

## 👨‍💻 Auteur

**Shayne Dev** - [GitHub](https://github.com)

## ⭐ Support

Si t'aimes ce projet, n'oublie pas de laisser une ⭐!

## 📞 Contact

- Discord: Shayne#0000
- Email: shayne@example.com

---

**Fait avec ❤️ par Shayne Dev**

**Bon jeu! 🎮 Amusez-vous bien!**
