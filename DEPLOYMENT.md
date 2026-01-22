# 🚀 Guide de Déploiement - TetsuBot

## 📋 Options de Déploiement

### 1. 🌐 Railway.app (Recommandé)

**Avantages:**
- ✅ Gratuit jusqu'à $5/mois
- ✅ Déploiement automatique depuis GitHub
- ✅ Variables d'environnement intégrées
- ✅ Logs en temps réel
- ✅ Support MongoDB avec Railway

**Étapes:**

1. **Préparer GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/tetsubot
git push -u origin main
```

2. **Configurer Railway**
   - Allez sur [railway.app](https://railway.app)
   - Connectez GitHub
   - Sélectionnez ce repository
   - Railway détectera automatiquement Node.js

3. **Ajouter MongoDB**
   ```
   New > MongoDB
   ```

4. **Variables d'environnement**
   ```env
   MONGODB_URI=<auto-généré par Railway>
   BOT_PREFIX=!
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway déploiera automatiquement
   - Vous verrez les logs en direct
   - Scannez le QR code quand demandé

---

### 2. ☁️ Heroku (Legacy - Plus limité)

**Limitation:** Heroku a fermé son niveau gratuit

**Alternatives similaires:**
- Render.com
- Fly.io
- Koyeb

---

### 3. 🖥️ VPS (Complet & Performant)

**Hébergeurs recommandés:**
- DigitalOcean ($5/mois)
- Linode ($5/mois)
- Hetzner (~$3/mois)
- AWS Free Tier (12 mois gratuits)

**Installation Ubuntu/Debian:**

```bash
# 1. Connexion SSH
ssh root@votre_ip

# 2. Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# 3. Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Installer MongoDB
sudo apt install -y mongodb

# 5. Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 6. Installer Git
sudo apt install -y git

# 7. Cloner le repo
cd /opt
sudo git clone https://github.com/username/tetsubot
cd tetsubot

# 8. Installer dépendances
npm install

# 9. Créer .env
sudo nano .env
# Ajouter config...

# 10. Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# 11. Lancer le bot
pm2 start src/index.js --name "tetsubot"
pm2 startup
pm2 save

# 12. Vérifier
pm2 logs tetsubot
```

**Pour les mises à jour:**

```bash
cd /opt/tetsubot
git pull origin main
npm install
pm2 restart tetsubot
```

---

### 4. 🐳 Docker (Conteneurisation)

**Avantages:**
- Même comportement partout
- Facile à scaler
- Isolation totale

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  bot:
    build: .
    container_name: tetsubot
    environment:
      MONGODB_URI: mongodb://mongo:27017/tetsubot
      BOT_PREFIX: "!"
    volumes:
      - ./tetsubot_session:/app/tetsubot_session
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:latest
    container_name: tetsubot_mongo
    volumes:
      - mongo_data:/data/db
    restart: always

volumes:
  mongo_data:
```

**Lancer avec Docker:**

```bash
docker-compose up -d
docker-compose logs -f bot
```

---

### 5. 🖱️ Windows/Mac (Développement Local)

**Prérequis:**
- Node.js 16+
- MongoDB (ou Docker)

**Étapes:**

```bash
# 1. Clone
git clone https://github.com/username/tetsubot
cd tetsubot

# 2. Installe les dépendances
npm install

# 3. Configure .env
copy .env.example .env
# Édite .env

# 4. Démarre MongoDB
# Windows: mongod.exe depuis Program Files
# Mac: brew services start mongodb-community
# Ou: docker run -d -p 27017:27017 mongo

# 5. Lance le bot
npm start

# 6. Scanne le QR code avec WhatsApp
```

---

## 📊 Comparaison des Options

| Critère | Railway | VPS | Docker | Local |
|---------|---------|-----|--------|-------|
| **Coût** | $5+/mois | $3-15/mois | Variable | 0€ |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Support** | ⭐⭐⭐⭐ | Faible | Moyen | N/A |
| **Uptime** | ✅ 99.9% | ✅ 99.9% | ✅ 99.9% | Dépend de vous |
| **24/7** | ✅ Oui | ✅ Oui | ✅ Oui | ❌ Non |

---

## 🔧 Configuration de Production

### Variables d'Environnement Essentielles

```env
# Base de données
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tetsubot

# Bot
BOT_PREFIX=!
NODE_ENV=production

# Admin
ADMIN_JIDS=120363xxxxxx@g.us,120363xxxxxx@g.us

# Optionnel
LOG_LEVEL=info
API_TIMEOUT=10000
```

### Optimisations de Performance

1. **Node.js**
```bash
node --max-old-space-size=2048 src/index.js
```

2. **MongoDB**
   - Utiliser MongoDB Atlas (cloud)
   - Ajouter des index appropriés
   - Configurer backups automatiques

3. **Cache**
   - Implémenter Redis (optionnel)
   - Cacher les commandes fréquentes

4. **Logs**
   - Rediriger vers fichier
   - Utiliser un service d'agrégation (optionnel)

---

## 📈 Monitoring & Maintenance

### Logs

```bash
# Railway
railway logs

# PM2 (VPS)
pm2 logs tetsubot
pm2 monit

# Docker
docker-compose logs -f bot
```

### Redémarrage Automatique

```bash
# PM2
pm2 restart tetsubot

# Docker
docker-compose restart bot
```

### Backups

```bash
# MongoDB Atlas: Automatique ✅

# MongoDB Local:
mongodump --uri "mongodb://localhost:27017/tetsubot"

# Restaurer:
mongorestore dump/
```

---

## 🚨 Résolution de Problèmes

### Bot se déconnecte souvent
```
→ Vérifier la connexion Internet
→ Augmenter le timeout dans config.js
→ Vérifier les logs d'erreur
→ Relancer le bot
```

### MongoDB ne se connecte pas
```
→ Vérifier la chaîne de connexion
→ Vérifier les credentials
→ Vérifier firewall/IP whitelist
→ Utiliser connection pooling
```

### Déploiement échoue
```
→ Vérifier logs du déploiement
→ Vérifier .env variables
→ Vérifier git repository
→ Redéployer manuellement
```

### Performance lente
```
→ Vérifier ressources disponibles
→ Optimiser requêtes MongoDB
→ Ajouter du cache
→ Upgrade du plan
```

---

## 💡 Conseils de Production

1. ✅ **Toujours** utiliser HTTPS/sécurité
2. ✅ **Jamais** commiter .env
3. ✅ **Toujours** avoir des backups
4. ✅ **Monitorer** les logs régulièrement
5. ✅ **Mettre à jour** les dépendances mensuellement
6. ✅ **Tester** les commandes admin avant production
7. ✅ **Limiter** les rate limits appropriés
8. ✅ **Documenter** vos modifications

---

## 📞 Support Hébergement

| Hébergeur | Support | Docs |
|-----------|---------|------|
| Railway | Chat/Email | Excellentes |
| Heroku | Limited | Bonnes |
| DigitalOcean | Excellent | Excellentes |
| Render | Chat | Bonnes |
| Fly.io | Forum | Bonnes |

---

**Bon déploiement! 🎮**
