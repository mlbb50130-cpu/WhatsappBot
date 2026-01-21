# 🚀 Guide de Déploiement sur Railway

## 📋 Prérequis

1. Un compte [Railway.app](https://railway.app)
2. Git installé sur ta machine
3. Le projet TetsuBot
4. Une base de données MongoDB Atlas (gratuite)

## 🔧 Étape 1: Préparer MongoDB Atlas

### 1. Créer un compte MongoDB Atlas
- Va sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crée un compte gratuit
- Crée un cluster gratuit
- Note ton URI de connexion (ressemblera à: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tetsubot?retryWrites=true&w=majority`)

### 2. Configuration du cluster
- Ajoute ta machine à la whitelist IP (ou `0.0.0.0/0` pour développement)
- Crée une base de données `tetsubot`
- Crée un utilisateur avec permissions

## 🚂 Étape 2: Configurer Railway

### 1. Se connecter à Railway
```bash
# Ouvre https://railway.app et connecte-toi avec GitHub/GitLab/Google
```

### 2. Créer un nouveau projet
- Clique sur "New Project"
- Sélectionne "Deploy from GitHub" ou "Deploy from Git"
- Autorise l'accès à tes repos GitHub

### 3. Sélectionner le repo
- Cherche et sélectionne `TetsuBot`
- Clique sur "Deploy"

## 🔐 Étape 3: Configurer les Variables d'Environnement

Dans la page du projet sur Railway:

1. Va dans l'onglet **Variables**
2. Ajoute les variables suivantes:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tetsubot?retryWrites=true&w=majority

# Bot Configuration
NODE_ENV=production
BOT_PREFIX=!
WHATSAPP_SESSION_NAME=tetsubot_session

# Admin
ADMIN_JIDS=120363xxxxxxxxxxxxxx@g.us,120363yyyyyyyyyyyyyyyy@g.us

# Features
XP_PER_MESSAGE=5
XP_COOLDOWN=5000
LOG_LEVEL=info
DEV_MODE=false
```

## 📦 Étape 4: Vérifier le package.json

Le `package.json` doit avoir le bon script `start`:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

✅ C'est déjà configuré correctement dans ton projet!

## 🚀 Étape 5: Déployer

### Option A: Déploiement Automatique (Recommandé)
1. Railway détectera automatiquement les changements sur GitHub
2. Chaque push vers `main` déclenchera un déploiement
3. Accès au terminal: Va dans Railway → Terminal pour voir les logs

### Option B: Déploiement Manuel
```bash
# Installe la CLI Railway (optionnel)
npm install -g @railway/cli

# Authentifie-toi
railway login

# Déploie
railway up
```

## 📊 Surveillance du Déploiement

1. **Onglet Deployments**: Voir l'historique des déploiements
2. **Logs en direct**: Clique sur le déploiement actif pour voir les logs
3. **Metrics**: Monitore l'utilisation CPU/RAM

## ⚠️ Problèmes Courants

### Le bot n'apparaît pas comme "Online"
- Vérifier que `MONGODB_URI` est correcte
- Vérifier que MongoDB Atlas whitelist Railway
- Voir les logs: Railway → Deployment → Logs

### "Cannot find module"
- Assure-toi que `npm install` a été exécuté
- Vérifier le `package.json`
- Redéploie

### Connexion WhatsApp refuse
- Le numéro doit être valide et activé sur WhatsApp
- Scanne le QR code quand le bot démarre
- Les credentials se sauvegardent dans `whatsapp_auth/`

### Erreur "ENOENT: no such file or directory"
- Assure-toi que les dossiers existent:
  - `whatsapp_auth/`
  - `logs/`
  - `sessions/`
- Ils se créent automatiquement au démarrage

## 🔄 Mise à Jour du Code

```bash
# Fais tes changements localement
git add .
git commit -m "Description du changement"
git push origin main

# Railway se redéploiera automatiquement!
```

## 💾 Sauvegarder les Données WhatsApp

Les credentials WhatsApp se créent au premier démarrage:
- Elles sont stockées dans Railway sous `/app/whatsapp_auth/`
- Pour les sauvegarder localement:
  ```bash
  railway run sh
  # Dans le terminal Railway:
  tar -czf whatsapp_auth.tar.gz whatsapp_auth/
  # Télécharge le fichier via l'interface Railway
  ```

## 📱 Ajouter le Bot à des Groupes

1. Lance le bot: `npm start`
2. Scanne le QR code avec ton téléphone WhatsApp
3. Ajoute le numéro associé à un groupe WhatsApp
4. Le bot rejoindra automatiquement et répondra aux commandes

## 🛠️ Maintenance

### Logs en Temps Réel
```bash
# Via Railway CLI
railway logs

# Ou via le dashboard Railway
```

### Redémarrer le Service
```bash
# Via Railway
# Va dans Deployments → Click sur le deployment → Redeploy
```

### Nettoyer les Données
```bash
# En dernier recours (réinitialise tout)
# Via Railway terminal:
rm -rf whatsapp_auth/*
```

## 📞 Support

- **Documentation Railway**: https://docs.railway.app
- **Issues du Bot**: Vérifie les logs Railway
- **Discord Railway**: https://discord.gg/railway

---

**Configurations ajoutées pour Railway:**
- ✅ `Procfile` - Définit la commande de démarrage
- ✅ `railway.json` - Configuration Railway
- ✅ `.railwayignore` - Fichiers à ignorer
- ✅ `RAILWAY_DEPLOYMENT.md` - Ce guide

**Prêt à déployer! 🚀**
