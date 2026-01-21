# 🚀 DÉMARRAGE RAPIDE - TetsuBot

## ⚡ 3 ÉTAPES POUR LANCER LE SERVEUR

### ✅ Configuration pré-requise
Le fichier `.env` est déjà configuré avec votre numéro WhatsApp:
- ✅ PHONE_NUMBER: +2290145494464
- ✅ MONGODB_URI: mongodb://localhost:27017/tetsubot
- ✅ PREFIX: !

### 📋 ÉTAPE 1: Vérifier MongoDB (Terminal A)
```bash
Double-cliquez sur: mongodb.bat

Vous verrez:
✅ MongoDB installé
🚀 Démarrage de MongoDB...
📌 MongoDB tourne sur: mongodb://localhost:27017

❌ Ne fermez PAS ce terminal!
```

**Si MongoDB n'est pas installé:**
1. Téléchargez: https://www.mongodb.com/try/download/community
2. Lancez l'installateur
3. Cochez "Run as Windows Service"
4. Relancez `mongodb.bat`

### 📋 ÉTAPE 2: Lancer le Bot (Terminal B)
```bash
Double-cliquez sur: start.bat

Vous verrez:
✅ Node.js trouvé
✅ npm trouvé  
✅ MongoDB trouvé
🚀 Démarrage du bot...

Attendez le QR code!
```

### 📱 ÉTAPE 3: Authentifier sur WhatsApp
```
1. Scannez le QR code avec WhatsApp
   - Menu > Appareils liés > Nouvel appareil
   
2. Attendez 30-60 secondes pour:
   ✅ Bot prêt!
   
3. Invitez le bot à un groupe WhatsApp

4. Testez une commande:
   !ping
   → Doit répondre: Pong! + infos de latence
```

---

## 🎮 TESTER LES COMMANDES

Une fois le bot connecté:

### Commands de Base
```
!ping          → Vérifie la connexion
!help          → Liste les commandes
!info          → Info sur le bot
```

### Système de Niveaux
```
!profil        → Votre profil
!level         → Votre niveau
!stats         → Vos stats
!classement    → Classement top 10
```

### Jeux & Amusement
```
!quiz          → Quiz anime (répondez avec le numéro)
!loot          → Ouvrir un butin aléatoire
!pfc           → Pierre-Papier-Ciseaux
!duel @user    → Défier un joueur
!waifu         → Image waifu aléatoire
```

### Admin (si droits)
```
!warn @user    → Avertir un joueur
!kick @user    → Expulser un joueur
!promote @user → Promouvoir en modérateur
```

---

## 🔧 DÉPANNAGE

### ❌ "MongoDB not found"
```
✅ SOLUTION:
   1. Lancez: mongodb.bat
   2. Attendez que MongoDB soit actif
   3. Puis lancez: start.bat
```

### ❌ "Cannot find module..."
```
✅ SOLUTION:
   1. Fermez le bot (Ctrl+C)
   2. Supprimer dossier: node_modules/
   3. Relancez start.bat → npm install automatique
```

### ❌ "Erreur de connexion WhatsApp"
```
✅ SOLUTION:
   1. Supprimez le dossier: sessions/
   2. Relancez start.bat
   3. Nouveau QR code devrait apparaître
```

### ❌ "BOT ne répond pas"
```
✅ SOLUTION:
   1. Testez d'abord en DM (message privé)
   2. Vérifiez que le groupe accepte les bots
   3. Tapez: !ping
   4. Consultez les logs (Terminal B)
```

---

## 📊 STRUCTURE DE DÉMARRAGE

```
Terminal A:
├─ mongodb.bat (GARDER OUVERT)
└─ MongoDB localhost:27017

Terminal B:
├─ start.bat
├─ npm start
└─ Bot WhatsApp actif
```

---

## ✨ READY TO LAUNCH!

```bash
1️⃣  mongodb.bat (Terminal A - garder ouvert)
2️⃣  start.bat (Terminal B)
3️⃣  Scannez le QR code
4️⃣  Testez: !ping
5️⃣  Profitez! 🎮
```

**Le serveur est maintenant prêt à fonctionner!** 🚀
