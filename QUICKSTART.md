# 🚀 Guide de Démarrage Rapide - TetsuBot

## ⚡ Démarrage en 5 minutes

### 1️⃣ Installation

```bash
# Clone le projet
git clone <url-repo>
cd TetsuBot

# Installe les dépendances
npm install
```

### 2️⃣ Configuration

```bash
# Copie le fichier exemple
cp .env.example .env

# Édite .env
nano .env
# Ou ouvre-le dans ton éditeur préféré
```

**Contenu minimum du .env:**
```env
MONGODB_URI=mongodb://localhost:27017/tetsubot
BOT_PREFIX=!
```

### 3️⃣ Base de Données

**Option A: MongoDB Local**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo service mongodb start

# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows
# Télécharge depuis https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Docker**
```bash
docker run -d -p 27017:27017 --name mongo mongo
```

**Option C: MongoDB Atlas (Cloud)**
```
1. Crée un compte sur https://www.mongodb.com/cloud/atlas
2. Crée un cluster gratuit
3. Obtiens la chaîne de connexion
4. Mets-la dans .env comme MONGODB_URI
```

### 4️⃣ Lancement

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

### 5️⃣ Première utilisation

1. Attend le message: `✅ Bot connected and ready!`
2. Scanne le QR code avec WhatsApp
3. Le bot devrait se connecter
4. Utilise une commande: `!menu` ou `!profil`

## 📋 Checklist de Configuration

- [ ] Node.js installé (version 16+)
- [ ] MongoDB lancé
- [ ] .env configuré correctement
- [ ] npm install exécuté
- [ ] Aucune erreur lors du lancement
- [ ] QR code scanné
- [ ] Bot connecté à WhatsApp

## 🐛 Résolution de Problèmes

### ❌ "Erreur: Cannot find module '@whiskeysockets/baileys'"
```bash
# Réinstalle les dépendances
rm -rf node_modules package-lock.json
npm install
```

### ❌ "MongoDB connection failed"
```bash
# Vérifie que MongoDB est lancé
mongod --version

# Sur Linux/Mac
sudo service mongodb start
# Ou
brew services start mongodb-community

# Sur Windows, lance mongod.exe depuis Program Files
```

### ❌ "QR code not appearing"
```bash
# Supprime la session ancienne
rm -rf tetsubot_session

# Relance
npm start

# Scanne le QR code immédiatement!
```

### ❌ "Bot ne répond pas aux commandes"
```bash
# Vérifie:
1. Bot est admin du groupe (pour commands groupe)
2. Prefix correct dans .env (par défaut: !)
3. Pas d'erreur dans la console
4. Try: !menu (commande universelle)
```

## 🎮 Première Commande

```
Dans WhatsApp:
1. Ouvre un chat avec le bot ou un groupe
2. Tape: !menu
3. Le bot affiche le menu
4. Essaie: !profil
5. Voilà! C'est actif!
```

## 📱 Tester dans un DM

1. Ajoute le numéro du bot (ton numéro) dans les contacts
2. Envoie-toi un message via WhatsApp
3. Utilise les commandes dans le chat!

## 🔑 Devenir Admin du Bot

Édite `.env` et ajoute ton JID WhatsApp:

```env
ADMIN_JIDS=120363XXXXXXXXXX@g.us
```

Pour trouver ton JID:
1. Va dans les logs/console
2. Cherche ton numéro WhatsApp
3. C'est au format: `120363XXXXXXXXXX@c.us`

## 🚀 Déployer sur Railway

```bash
# 1. Crée un compte sur railway.app
# 2. Connecte ton GitHub
# 3. Clone le repo GitHub
# 4. Sur Railway, clique: New Project > GitHub Repo
# 5. Sélectionne ce repo
# 6. Ajoute les variables d'environnement:
#    - MONGODB_URI=... (ta URL MongoDB Atlas)
#    - BOT_PREFIX=!
# 7. Deploy!
```

## 📊 Vérifier que tout fonctionne

```bash
# 1. Check Node.js
node --version  # Doit être >= 16

# 2. Check npm
npm --version

# 3. Check MongoDB
mongosh --version  # Ou mongo --version

# 4. Affiche info système
npm run dev

# Regarde la console pour:
# ✅ MongoDB Connected
# ✅ N commandes loaded
# ✅ Bot connected and ready!
```

## 💡 Conseils

- 🎯 Garde le terminal ouvert pour voir les logs
- 🔒 N'expose JAMAIS ton .env publiquement
- 🔄 Redémarre le bot après chaque modification de code
- 📖 Lis `README.md` pour la liste complète des commandes
- 🐛 En cas de bug, check les logs dans la console

## ❓ Questions Fréquentes

**Q: Combien de temps pour que ça fonctionne?**
A: 5-10 minutes maximum si tout est bien configuré.

**Q: Faut-il payer pour MongoDB?**
A: Non, MongoDB Atlas propose un niveau gratuit (512 MB).

**Q: Puis-je utiliser le bot sur plusieurs appareils?**
A: Non, Baileys fonctionne mieux avec un appareil.

**Q: Comment faire un backup de la DB?**
A: Exporte via MongoDB Atlas ou utilise `mongodump`.

---

## 🆘 Besoin d'aide?

1. Vérifie les logs de la console
2. Relis ce guide
3. Revérifie ton .env
4. Redémarre le bot
5. Cherche dans les issues GitHub

**Bon jeu! 🎮**
