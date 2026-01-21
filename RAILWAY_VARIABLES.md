# 🔐 Variables d'Environnement pour Railway

Guide complet des variables d'environnement à configurer dans Railway.

## 📝 Variables Requises

### 1. MongoDB
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tetsubot?retryWrites=true&w=majority
```
- **Description**: Chaîne de connexion complète MongoDB Atlas
- **Obtenir**: https://www.mongodb.com/cloud/atlas
- **Format**: `mongodb+srv://user:password@host/database?options`
- **Important**: Remplace les `<>` et encode les caractères spéciaux

### 2. Configuration du Bot
```env
NODE_ENV=production
```
- **Valeurs**: `production` ou `development`
- **Par défaut**: `development` (local)
- **Sur Railway**: Toujours `production`

```env
BOT_PREFIX=!
```
- **Description**: Préfixe des commandes
- **Défaut**: `!`
- **Exemples**: `!`, `$`, `.`, `/`

```env
WHATSAPP_SESSION_NAME=tetsubot_session
```
- **Description**: Nom de la session WhatsApp
- **Défaut**: `tetsubot_session`
- **Conseil**: Laisse par défaut

## 📋 Variables Optionnelles

### Admins
```env
ADMIN_JIDS=120363xxxxxxxxxxxxxx@g.us,120363yyyyyyyyyyyyyyyy@g.us
```
- **Description**: IDs des administrateurs (séparés par virgule)
- **Format**: `numeroPhone-numero@g.us` pour groupes
- **Obtenir**: Lance le bot une fois et récupère le JID
- **Défaut**: Vide (pas d'admins)

### Système XP
```env
XP_PER_MESSAGE=5
```
- **Description**: XP gagnés par message
- **Défaut**: `5`
- **Plage**: `1-100` (recommandé)

```env
XP_COOLDOWN=5000
```
- **Description**: Délai entre les gains XP (ms)
- **Défaut**: `5000` (5 secondes)
- **Plage**: `1000-60000`

### Logging
```env
LOG_LEVEL=info
```
- **Valeurs**: `error`, `warn`, `info`, `debug`
- **Défaut**: `info`
- **Production**: `warn` ou `info`

### Mode Développement
```env
DEV_MODE=false
```
- **Valeurs**: `true` ou `false`
- **Défaut**: `false` (production)
- **Important**: Laisse à `false` sur Railway

### API Jikan (Anime)
```env
JIKAN_ENABLED=true
```
- **Valeurs**: `true` ou `false`
- **Description**: Active les commandes anime/manga
- **Défaut**: `true`
- **Note**: API gratuite, aucune clé requise

## 🛠️ Configuration Pas à Pas dans Railway

### 1. Accéder aux Variables
1. Va sur https://railway.app
2. Ouvre ton projet TetsuBot
3. Clique sur l'onglet **Variables**

### 2. Ajouter les Variables
- Clique sur **Add Variable**
- Entre le nom (ex: `MONGODB_URI`)
- Entre la valeur
- Clique sur **Add**

### 3. Valeurs à Ajouter Initialement

```env
MONGODB_URI=<ta-string-mongodb-atlas>
NODE_ENV=production
BOT_PREFIX=!
ADMIN_JIDS=<ton-jid>
LOG_LEVEL=info
```

### 4. Variables Optionnelles
```env
WHATSAPP_SESSION_NAME=tetsubot_session
XP_PER_MESSAGE=5
XP_COOLDOWN=5000
DEV_MODE=false
JIKAN_ENABLED=true
```

## 🔍 Exemple de Configuration Complète

```env
# MongoDB
MONGODB_URI=mongodb+srv://tetsu:myPassword123@cluster0.abc123.mongodb.net/tetsubot?retryWrites=true&w=majority

# Environment
NODE_ENV=production
DEV_MODE=false

# Bot
BOT_PREFIX=!
WHATSAPP_SESSION_NAME=tetsubot_session

# Admin
ADMIN_JIDS=120363012345678901@g.us

# Game
XP_PER_MESSAGE=5
XP_COOLDOWN=5000

# Logging
LOG_LEVEL=info

# APIs
JIKAN_ENABLED=true
```

## ⚠️ Erreurs Courantes

### "ECONNREFUSED" ou "Connection Timeout"
```
❌ MONGODB_URI incorrect
✅ Solution:
  - Copie-colle directement depuis MongoDB Atlas
  - Assure-toi que Railway est whitelisté
  - Teste la connexion localement d'abord
```

### "Cannot find module"
```
❌ package.json non mis à jour
✅ Solution:
  - Railway redéploie automatiquement
  - Attend le fin du deployment
  - Vérifie les logs
```

### Bot reste "offline"
```
❌ Variables incomplètes ou érronées
✅ Vérifier:
  1. MONGODB_URI valide
  2. NODE_ENV=production
  3. Logs pour les erreurs spécifiques
```

## 🔐 Sécurité

### Ne Jamais Commiter
- ❌ `.env` avec vraies valeurs
- ❌ Credentials MongoDB
- ❌ Admin JIDs publiquement

### Bonnes Pratiques
- ✅ Use Railway variables (pas de `.env`)
- ✅ Régénère les passwords régulièrement
- ✅ Whitelist les IPs Railway uniquement
- ✅ Use `railway secrets set` pour les données sensibles

## 🚀 Mettre en Production

1. **MongoDB Atlas**:
   - Crée un utilisateur de production
   - Whitelist Railway IP: `0.0.0.0/0` (optionnel) ou ton IP
   - Crée une DB séparée si voulu

2. **Variables Railway**:
   ```env
   NODE_ENV=production
   LOG_LEVEL=warn
   JIKAN_ENABLED=true
   ```

3. **Redéploie**:
   - Railway se redéploiera automatiquement
   - Vérifie les logs en direct

## 📊 Monitoring

### Voir les Variables en Temps Réel
```bash
# Via CLI
railway variables list

# Via Dashboard
# Settings → Variables
```

### Modifier une Variable
1. Va dans Variables
2. Clique sur la variable
3. Modifie la valeur
4. Railway redéploiera automatiquement ✅

---

**Besoin d'aide?**
- 📖 Docs Railway: https://docs.railway.app
- 🐛 Logs: Railway → Deployment → Logs
- 💬 Discord Railway: https://discord.gg/railway
