// 🎯 Guide complet - Configuration & APIs

## 🚀 Configuration Complète du Bot

### 1️⃣ Installation Initiale

```bash
# Cloner/organiser le projet
cd TetsuBot

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example.complete .env

# Créer les répertoires
mkdir -p sessions logs backups
```

### 2️⃣ Configuration .env Requise

**Obligatoire:**
```env
PHONE_NUMBER=+33612345678
PREFIX=!
MONGODB_URI=mongodb://localhost:27017/tetsubot
ADMIN_JIDS=33612345678@s.whatsapp.net
```

**Recommandé:**
```env
JIKAN_ENABLED=true
LOG_LEVEL=info
DEV_MODE=false
```

### 3️⃣ Démarrage du Bot

```bash
# Démarrage normal
npm start

# Scan du QR code dans terminal
# Sauvegarde automatique dans ./sessions/

# Logs disponibles dans ./logs/
```

---

## 🔗 APIs Disponibles (Par Priorité)

### **TIER 1 - Essentielles ✅**

#### 🎌 Jikan API (Anime Data)
- **URL:** https://jikan.moe
- **Setup:** Gratuit, pas d'authentification
- **Fichier:** `src/utils/jikanAPI.js`
- **Exemple:**
```javascript
const JikanAPI = require('./src/utils/jikanAPI');

const anime = await JikanAPI.searchAnime('Naruto');
// Retourne: title, synopsis, episodes, score, image, url, genres, etc.
```

#### 🖼️ Waifu.pics (Images Anime)
- **URL:** https://waifu.pics
- **Setup:** Gratuit, pas d'authentification
- **Endpoints:** `/waifu`, `/husbando`, `/neko`, `/shinobu`, `/mitsuri`
- **Code existant:** `src/commands/waifu.js`, `husbando.js`

#### 💬 Discord Webhook (Notifications)
- **Setup:** 2 minutes
- **Étapes:**
  1. Créer un serveur Discord (gratuit)
  2. Créer un canal #bot-logs
  3. Créer un webhook: Paramètres → Intégrations → Webhooks
  4. Copier l'URL dans .env:
  ```env
  DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdef
  ```

### **TIER 2 - Recommandées ⭐**

#### 🎮 Stripe (Paiements Premium)
- **Setup:** 10 minutes
- **Étapes:**
  1. Créer compte: https://stripe.com
  2. Aller à Dashboard → API Keys
  3. Copier les clés:
  ```env
  STRIPE_PUBLIC_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```

#### 🚀 Firebase (Authentication)
- **Setup:** 15 minutes
- **Étapes:**
  1. Créer projet: https://console.firebase.google.com
  2. Activer Authentication
  3. Copier les config:
  ```env
  FIREBASE_API_KEY=AIza...
  FIREBASE_PROJECT_ID=tetsubot-xxxxx
  ```

#### 📊 Sentry (Error Tracking)
- **Setup:** 5 minutes
- **Étapes:**
  1. Créer compte: https://sentry.io
  2. Créer projet Node.js
  3. Copier le DSN:
  ```env
  SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456
  ```

### **TIER 3 - Optionnelles 🎁**

#### 🎨 Imgflip (Memes)
- **Setup:** Configuration créée dans config
```env
IMGFLIP_USERNAME=votre_username
IMGFLIP_PASSWORD=votre_password
```

#### 📞 Telegram Bot (Logs)
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=987654321
```

#### ☁️ AWS S3 (Cloud Storage)
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=tetsubot-bucket
AWS_REGION=eu-west-1
```

---

## 🔧 Configuration Avancée

### Cache Manager
```javascript
const CacheManager = require('./src/utils/cache');

const cache = new CacheManager(
  3600000,  // TTL: 1 heure
  1000      // Max 1000 items
);

// Utilisation
cache.set('anime:naruto', animeData);
const data = cache.get('anime:naruto');

// Stats
console.log(cache.stats());
// { size: 5, maxSize: 1000, utilization: '0.5%', ttl: 3600000 }
```

### Error Handler & Logging
```javascript
const ErrorHandler = require('./src/utils/errorHandler');

const logger = new ErrorHandler('./logs');

logger.info('Bot started');
logger.warn('Deprecated API used');
logger.error('Database error', error);
logger.logCommand('duel', userId, true);

// Cleanup logs vieux de +7 jours
logger.cleanup(7);
```

### Configuration Complète
```javascript
const advancedConfig = require('./ADVANCED_CONFIG_FULL');

// Accéder à:
console.log(advancedConfig.XP_SYSTEM);
console.log(advancedConfig.COMBAT_SYSTEM);
console.log(advancedConfig.APIS);
```

---

## 📋 Checklist Complète

- [ ] **Installation**
  - [ ] Node.js v16+ installé
  - [ ] MongoDB running (local ou Atlas)
  - [ ] npm install terminé

- [ ] **Configuration de Base**
  - [ ] .env créé avec PHONE_NUMBER
  - [ ] MONGODB_URI configuré
  - [ ] PREFIX défini

- [ ] **Premier Démarrage**
  - [ ] npm start exécuté
  - [ ] QR code scanné
  - [ ] Session créée dans ./sessions/

- [ ] **APIs Optionnelles**
  - [ ] Jikan API testée
  - [ ] Discord Webhook configuré
  - [ ] Logs en ./logs/ vérifiés

- [ ] **Déploiement**
  - [ ] Code commité (git)
  - [ ] .env.example mis à jour
  - [ ] README complété
  - [ ] Prêt pour Railway/VPS/Docker

---

## 🐛 Troubleshooting

### Bot ne démarre pas
```bash
# Vérifier Node.js
node --version  # Doit être v16+

# Vérifier MongoDB
# Local: mongod doit tourner
# Atlas: vérifier la connexion dans MONGODB_URI
```

### Erreur "Cannot find module"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### QR code ne s'affiche pas
```bash
# Vérifier que le terminal supporte les QR codes
# Sinon, chercher le lien dans les logs

# Créer manuellement la session
mkdir -p sessions
```

### Commandes ne répondent pas
```bash
# Vérifier le PREFIX dans .env
# Vérifier que le bot reçoit les messages (test avec !ping)
# Vérifier les logs: cat logs/tetsubot-*.log
```

---

## 📚 Ressources

- **Baileys:** https://github.com/WhiskeySockets/Baileys
- **Jikan API:** https://docs.api.jikan.moe/
- **MongoDB:** https://docs.mongodb.com/
- **Mongoose:** https://mongoosejs.com/
- **Stripe:** https://stripe.com/docs
- **Firebase:** https://firebase.google.com/docs
- **Sentry:** https://docs.sentry.io/

---

## ✨ Prochaines Étapes

1. **Tester les commandes de base**
   - !ping, !profil, !level, !stats

2. **Ajouter un Webhook Discord**
   - Pour tracker les événements

3. **Configurer Jikan API**
   - Pour les recherches d'anime

4. **Déployer en production**
   - Railway.app (5 min) ou VPS (15 min)

---

**Besoin d'aide?** Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour le déploiement!
