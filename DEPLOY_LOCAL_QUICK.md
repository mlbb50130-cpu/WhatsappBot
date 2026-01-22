# 🚀 GUIDE DE DÉPLOIEMENT LOCAL - TetsuBot

## ⚡ DÉMARRAGE RAPIDE (3 ÉTAPES)

### ÉTAPE 1️⃣: Préparation
```
1. Si MongoDB n'est PAS installé → Installez-le:
   https://www.mongodb.com/try/download/community
   ✅ Cochez "Run as Windows Service"

2. Ouvrez 2 terminaux (2 fenêtres):
   Terminal A: Pour MongoDB
   Terminal B: Pour le Bot
```

### ÉTAPE 2️⃣: Lancer MongoDB (Terminal A)
```batch
Double-cliquez sur: run-mongodb.bat

✅ Vous verrez: "waiting for connections on port 27017"
❌ Ne fermez PAS ce terminal pendant les tests
```

### ÉTAPE 3️⃣: Lancer le Bot (Terminal B)
```batch
Double-cliquez sur: deploy-local.bat

✅ Vous verrez un QR code
📱 Scannez avec WhatsApp (menu > Appareils liés)
⏳ Attendez 30-60 secondes pour "Bot prêt!"
```

---

## 📝 CONFIGURATION (.env)

Le fichier `.env` a été créé automatiquement avec:

```env
PHONE_NUMBER=+33612345678  # 👈 Remplacez par votre numéro (format: +33...)
PREFIX=!
MONGODB_URI=mongodb://localhost:27017/tetsubot
```

### Pour obtenir votre JID WhatsApp:
1. Lancez le bot avec `deploy-local.bat`
2. Scannez le QR code
3. Quand vous recevrez le premier message du bot, votre JID apparaîtra dans les logs
4. Format: `33612345678@s.whatsapp.net`
5. Mettez-le dans `ADMIN_JIDS` dans `.env`

---

## 🎮 TESTER LES COMMANDES

Une fois le bot lancé, invitez-le à un groupe WhatsApp et testez:

### Commandes de Base
```
!ping              → Pong! (vérifie connexion)
!help              → Liste toutes les commandes
!info              → Info sur le bot
!profil            → Voir votre profil
```

### Système de Niveaux
```
!level             → Votre niveau actuel
!stats             → Vos statistiques
!classement        → Classement des joueurs
```

### Jeux
```
!quiz              → Jouer un quiz anime
!loot              → Obtenir un butin aléatoire
!pfc               → Pierre-Papier-Ciseaux
!roulette          → Roulette russe
!duel @user        → Défier un joueur
```

### Anime/Manga
```
!waifu             → Waifu aléatoire
!husbando          → Husbando aléatoire
!blagueotaku       → Blague otaku
!roast             → Roast (insulte amusante)
```

### Admin (si vous avez accès)
```
!setxp @user 100   → Donner XP
!warn @user raison → Avertir un joueur
!kick @user        → Expulser (nécessite droits groupe)
!clear             → Effacer les messages
```

---

## 🔧 DÉPANNAGE

### ❌ "mongodb://localhost not found"
```
✅ SOLUTION:
  1. Vérifiez que run-mongodb.bat est en cours d'exécution
  2. Dans .env, assurez-vous: MONGODB_URI=mongodb://localhost:27017/tetsubot
  3. Relancez deploy-local.bat
```

### ❌ "Cannot find module..."
```
✅ SOLUTION:
  1. Fermez le bot (Ctrl+C)
  2. Supprimez le dossier: node_modules/
  3. Relancez deploy-local.bat → npm install s'exécutera automatiquement
```

### ❌ "QR code n'apparaît pas"
```
✅ SOLUTION:
  1. Assurez-vous PHONE_NUMBER dans .env est au format: +33612345678
  2. Supprimez le dossier: sessions/
  3. Relancez deploy-local.bat
```

### ❌ "Bot se connecte mais ne répond pas"
```
✅ SOLUTION:
  1. Vérifiez que le groupe permet les messages des bots
  2. Testez d'abord en DM (message privé)
  3. Vérifiez le PREFIX dans .env (par défaut: !)
  4. Tapez: !ping → devrait répondre Pong!
```

### ❌ Erreurs dans les logs
```
✅ CONSEIL:
  - Les logs s'enregistrent dans: logs/tetsubot-YYYY-MM-DD.log
  - Consultez ce fichier pour diagnostiquer
```

---

## 📊 STRUCTURE DE DÉPLOIEMENT

```
TetsuBot/
├── deploy-local.bat          ← Lance le bot en local
├── run-mongodb.bat           ← Lance MongoDB
├── .env                       ← Configuration (créée auto)
├── package.json               ← Dépendances npm
├── node_modules/              ← Dépendances (créées par npm install)
├── sessions/                  ← Sessions WhatsApp
├── logs/                       ← Fichiers logs
└── src/
    ├── index.js               ← Point d'entrée du bot
    ├── handler.js             ← Gestionnaire de messages
    ├── config.js              ← Configuration
    ├── database.js            ← Connexion MongoDB
    ├── commands/              ← Tous les commandes
    └── models/                ← Modèles MongoDB
```

---

## 🎯 WORKFLOW COMPLET

```
1. PRÉPARATION (première fois seulement)
   └─ run-mongodb.bat ✅ (Terminal A - le laisser ouvert)

2. DÉMARRAGE
   └─ deploy-local.bat ✅ (Terminal B)

3. AUTHENTIFICATION
   └─ Scannez le QR code avec WhatsApp

4. ACTIVATION
   └─ Invitez le bot à un groupe

5. TESTS
   └─ !ping, !help, !profil, !quiz, etc.

6. ARRÊT
   └─ Ctrl+C dans Terminal B (deploy-local.bat)
   └─ Ctrl+C dans Terminal A (run-mongodb.bat) quand fini
```

---

## 💾 DONNÉES PERSISTANTES

Les données sont sauvegardées dans MongoDB:

**Collections:**
- `users` - Profils joueurs (XP, niveau, inventaire)
- `groups` - Configurations par groupe
- `quests` - Quêtes disponibles
- `warns` - Avertissements des joueurs
- `inventories` - Inventaires personnels

Les données SURVIVENT aux redémarrages du bot! ✅

---

## 📞 BESOIN D'AIDE?

1. Vérifiez les logs: `logs/tetsubot-YYYY-MM-DD.log`
2. Consultez: `TEST_COMMANDS.md`
3. Consultez: `LOCAL_TESTING.md`
4. Consultez: `MONGODB_ATLAS.md` (si vous préférez le cloud)

---

## ✨ PRÊT À TESTER?

```bash
1. Double-cliquez: run-mongodb.bat
2. Double-cliquez: deploy-local.bat
3. Scannez le QR code
4. Testez: !ping
5. Profitez! 🎮
```

Bon déploiement! 🚀
