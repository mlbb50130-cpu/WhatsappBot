// 🚀 GUIDE COMPLET - DÉPLOIEMENT & TEST LOCAL

## ✅ OUI, VOUS POUVEZ TESTER EN LOCAL!

C'est même **fortement recommandé** avant le déploiement en production.

---

## 📋 PRÉREQUIS

### 1. Node.js v16+
```bash
# Vérifier
node --version    # Doit être >= v16.0.0

# Télécharger si nécessaire
https://nodejs.org/
```

### 2. MongoDB (3 Options)

#### Option A: MongoDB Local (Recommandé pour test)
```bash
# Windows - Installer depuis:
https://www.mongodb.com/try/download/community

# Linux (Ubuntu):
sudo apt-get install mongodb

# Mac (Homebrew):
brew install mongodb-community
```

#### Option B: MongoDB Atlas (Cloud - Gratuit)
```
1. Créer compte: https://www.mongodb.com/cloud/atlas
2. Créer cluster gratuit
3. Obtenir connection string
4. Ajouter dans .env:
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tetsubot
```

#### Option C: Docker (Si installé)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. WhatsApp Web
```
Votre téléphone avec WhatsApp installé
```

---

## 🚀 INSTALLATION LOCALE (4 ÉTAPES)

### Étape 1: Cloner/Préparer le Projet

```bash
cd c:\Users\Shayne\Documents\TetsuBot

# Ou créer un dossier test:
mkdir TetsuBot-Test
cd TetsuBot-Test
```

### Étape 2: Installer les Dépendances

```bash
npm install

# Vérifier:
npm list
# Doit montrer toutes les dépendances
```

### Étape 3: Configurer MongoDB

#### Si MongoDB Local:
```bash
# Windows:
# 1. Installer MongoDB Community
# 2. Lancer le service:
mongod

# Linux:
sudo service mongodb start

# Mac:
brew services start mongodb-community
```

#### Vérifier la connexion:
```bash
mongo
# ou
mongosh

# Commandes de test:
show dbs
db.version()
```

### Étape 4: Configurer .env

```bash
# Copier le template
cp .env.example.complete .env

# Éditer avec vos paramètres
```

**Contenu .env pour test local:**
```env
# Bot
PHONE_NUMBER=+33612345678          # Votre numéro WhatsApp
PREFIX=!
DEV_MODE=true                       # Mode développement

# Database - LOCAL
MONGODB_URI=mongodb://localhost:27017/tetsubot
# OU - CLOUD (Atlas)
# MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/tetsubot

# Admin
ADMIN_JIDS=33612345678@s.whatsapp.net    # Votre JID (obtenu après connexion)

# Logging
LOG_LEVEL=debug                     # Pour plus de détails
SENTRY_ENABLED=false

# APIs (Optionnel pour test)
JIKAN_ENABLED=true
```

---

## 🎯 DÉMARRER EN LOCAL

### Commande Démarrage:
```bash
npm start

# Résultat attendu:
# ✅ Bot connected and ready!
# Affichage du QR code dans le terminal
```

### Scanner le QR Code:
```
1. Ouvrir WhatsApp sur votre téléphone
2. Aller à: Settings → Linked Devices
3. Scanner le QR code avec la caméra du téléphone
4. Attendre la connexion (30-60 secondes)
5. Voir: "✅ Bot connected!"
```

---

## ✅ TESTER LES COMMANDES

### Test 1: Vérifier le Bot

```
GROUPE WHATSAPP → Envoyer: !ping

Résultat attendu:
✅ Pong! Latence: XXms
```

### Test 2: Système XP

```
Envoyer un message normal (sans !)
Attendre 5 secondes
Envoyer: !profil

Résultat attendu:
📊 Votre profil s'affiche
XP: 5 (augmenté de 5)
```

### Test 3: Commandes Basiques

```
!help              → Liste les commandes
!ping              → Vérifier la latence
!profil            → Votre profil RPG
!level             → Votre niveau
!stats             → Vos statistiques
```

### Test 4: Commandes de Jeu

```
!quiz              → Lancer un quiz (30s)
!duel @mention     → Combattre quelqu'un
!loot              → Récupérer du butin
!chance            → Chance quotidienne
!pfc               → Pierre-feuille-ciseaux
!roulette          → Jeu de roulette
```

### Test 5: Commandes Admin

```
!warn @user        → Avertir un utilisateur
!kick @user        → Expulser du groupe
!setxp @user 100   → Définir XP
```

---

## 🔧 CONFIGURATION DE MONGODB LOCAL

### Windows:

#### 1. Installation:
```bash
# Télécharger: https://www.mongodb.com/try/download/community
# Installer avec les paramètres par défaut
```

#### 2. Vérifier l'installation:
```bash
mongo --version
# ou
mongosh --version
```

#### 3. Lancer MongoDB:
```bash
# Méthode 1: Comme service Windows
# Paramètres → Services → MongoDB (doit être Running)

# Méthode 2: Commande manuelle
mongod

# Méthode 3: Avec données personnalisées
mongod --dbpath C:\data\db
```

#### 4. Tester:
```bash
# Ouvrir une autre console
mongosh

# Commandes:
show dbs
use tetsubot
db.users.find()
exit()
```

### Linux (Ubuntu):

```bash
# 1. Installer
sudo apt-get install -y mongodb

# 2. Démarrer
sudo service mongodb start

# 3. Vérifier
sudo service mongodb status

# 4. Arrêter (si besoin)
sudo service mongodb stop
```

### Mac (Homebrew):

```bash
# 1. Installer
brew install mongodb-community

# 2. Démarrer
brew services start mongodb-community

# 3. Vérifier
brew services list

# 4. Arrêter
brew services stop mongodb-community
```

---

## 📊 VÉRIFIER MONGODB

### Vérifier la connexion:

```bash
# Ouvrir mongosh
mongosh

# Voir les bases de données
show dbs

# Utiliser tetsubot
use tetsubot

# Voir les collections
show collections

# Compter les utilisateurs
db.users.countDocuments()

# Voir les groupes
db.groups.find().pretty()

# Quitter
exit()
```

---

## 🐛 DÉPANNAGE LOCAL

### Erreur: "MongoDB connection refused"

```bash
# Vérifier si MongoDB est lancé
mongosh

# Si erreur:
# 1. Lancer MongoDB
mongod

# 2. Vérifier le port
# MongoDB utilise par défaut: 27017

# 3. Vérifier MONGODB_URI dans .env
MONGODB_URI=mongodb://localhost:27017/tetsubot
```

### Erreur: "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "QR code doesn't display"

```bash
# 1. Terminal ne supporte pas les QR codes
# 2. Chercher dans les logs
tail -f logs/tetsubot-*.log

# 3. Ou utiliser WhatsApp Web manuellement
# Paramètres → Appareils connectés → Scanner

# 4. Relancer le bot
npm start
```

### Erreur: "Bot doesn't respond"

```bash
# 1. Vérifier le prefix
echo $PREFIX  # Doit être !

# 2. Vérifier que le bot est connecté
# Console doit afficher: ✅ Bot connected and ready!

# 3. Ajouter le bot au groupe comme admin (optionnel)

# 4. Vérifier les permissions
# Envoyer: !help
```

### Erreur: "Permission denied"

```bash
# 1. Vérifier ADMIN_JIDS dans .env
# Doit contenir: 33612345678@s.whatsapp.net

# 2. Obtenir votre JID:
# Envoyer n'importe quelle commande
# Voir dans les logs: [JID: 33612345678@s.whatsapp.net]

# 3. Ajouter à ADMIN_JIDS
ADMIN_JIDS=33612345678@s.whatsapp.net
```

---

## 📈 MONITORING EN LOCAL

### Voir les logs en direct:

```bash
# Windows (PowerShell):
Get-Content logs/tetsubot-*.log -Wait

# Linux/Mac:
tail -f logs/tetsubot-*.log
```

### Voir les erreurs:

```bash
# Chercher les erreurs
grep "ERROR" logs/tetsubot-*.log

# Voir les 50 dernières lignes
tail -50 logs/tetsubot-*.log
```

### Voir les commandes utilisées:

```bash
# Dans mongosh:
mongosh
use tetsubot
db.users.find().pretty()  # Voir les utilisateurs et leurs stats
db.groups.find().pretty() # Voir les groupes
```

---

## 🎮 SCÉNARIOS DE TEST

### Scénario 1: Test XP System

```
1. Envoyer plusieurs messages normaux (5s entre chaque)
2. Vérifier: !level
3. Résultat: XP augmente de 5 par message
```

### Scénario 2: Test Commandes RPG

```
1. Créer un groupe test
2. Inviter 2+ utilisateurs
3. Tester: !duel @autre
4. Résultat: Combat se déroule, gagnant reçoit XP
```

### Scénario 3: Test Modération

```
1. Donner admin au bot (optionnel)
2. Envoyer: !warn @user
3. Résultat: Utilisateur reçoit 1 warning
4. Envoyer 2x de plus: 3 warnings = ban automatique
```

### Scénario 4: Test Quiz

```
1. Envoyer: !quiz
2. Résultat: Questions s'affichent (6 total)
3. Répondre: !reponse 1 (pour réponse A)
4. Vérifier: XP augmente si correcte
```

### Scénario 5: Test Loot

```
1. Envoyer: !loot
2. Résultat: Item aléatoire obtenu
3. Envoyer: !inventaire
4. Vérifier: Item apparaît dans l'inventaire
```

---

## 💾 SAUVEGARDER LES DONNÉES

### Exporter les données:

```bash
# Exporter tous les users
mongodump --db tetsubot --collection users --out ./backup/

# Ou utiliser MongoDB Compass (GUI):
https://www.mongodb.com/products/compass
```

### Réinitialiser les données:

```bash
# Supprimer la base de données
mongosh
use tetsubot
db.dropDatabase()
exit()

# Ou supprimer une collection
db.users.deleteMany({})
db.groups.deleteMany({})
```

---

## 🔧 SCRIPTS DE TEST

### Script Windows (test-local.bat):

```batch
@echo off
echo 🚀 Test Local TetsuBot
echo.

echo 1️⃣ Vérifier Node.js...
node --version

echo.
echo 2️⃣ Vérifier MongoDB...
mongosh --version

echo.
echo 3️⃣ Installer dépendances...
npm install

echo.
echo 4️⃣ Vérifier configuration...
node verify-config.js

echo.
echo 5️⃣ Démarrer le bot...
npm start

pause
```

### Script Linux/Mac (test-local.sh):

```bash
#!/bin/bash

echo "🚀 Test Local TetsuBot"
echo

echo "1️⃣ Vérifier Node.js..."
node --version

echo
echo "2️⃣ Vérifier MongoDB..."
mongosh --version

echo
echo "3️⃣ Installer dépendances..."
npm install

echo
echo "4️⃣ Vérifier configuration..."
node verify-config.js

echo
echo "5️⃣ Démarrer le bot..."
npm start
```

---

## ✅ CHECKLIST DE TEST LOCAL

- [ ] Node.js v16+ installé
- [ ] MongoDB running (local ou cloud)
- [ ] .env configuré
- [ ] npm install exécuté
- [ ] Bot démarre: npm start
- [ ] QR code affiché/scanné
- [ ] ✅ Bot connected!
- [ ] Test: !ping → Pong!
- [ ] Test: !profil → Profil affiché
- [ ] Test: !level → Niveau affiché
- [ ] Test: !quiz → Quiz lancé
- [ ] Test: XP augmente
- [ ] Test: Commande admin (avec permission)
- [ ] Logs affichés correctement
- [ ] MongoDB contient les données

---

## 📊 RÉSULTAT ATTENDU APRÈS TEST

```
✅ Bot connecté
✅ 25 commandes chargées
✅ Database connectée
✅ Utilisateurs créés automatiquement
✅ XP système fonctionnel
✅ Cooldown système
✅ Permissions vérifiées
✅ Logs en cours de création
✅ Aucune erreur critique
```

---

## 🎯 PROCHAINES ÉTAPES APRÈS TEST

### Si tout fonctionne:
1. ✅ Prêt pour production
2. Voir: DEPLOYMENT.md

### Si erreurs:
1. Vérifier les logs
2. Relire DÉPANNAGE section
3. Consulter: verify-config.js

---

## 🚀 COMMANDES RAPIDES

```bash
# Installation + Test
npm install && npm start

# Vérifier MongoDB
mongosh

# Voir les logs
tail -f logs/tetsubot-*.log

# Arrêter le bot
Ctrl + C

# Réinstaller
rm -rf node_modules && npm install
```

---

**Maintenant, vous pouvez tester complètement en local! 🎮**

Commencez par:
```bash
npm install
npm start
```
