# 🚀 DÉPLOIEMENT RAPIDE SUR RAILWAY

## ⚡ Version Ultra-Rapide (5 minutes)

### 1️⃣ Préparer MongoDB Atlas
```
1. Va sur https://www.mongodb.com/cloud/atlas
2. Crée un account gratuit
3. Crée un cluster (Free tier)
4. Whitelist "0.0.0.0/0"
5. Crée un utilisateur DB
6. Copie l'URI: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/tetsubot
```

### 2️⃣ Vérifier la config
```bash
# Dans le terminal
node railway-check.js
```

### 3️⃣ Pousser sur GitHub
```bash
git add .
git commit -m "Railway deployment config"
git push origin main
```

### 4️⃣ Déployer sur Railway
```
1. Va sur https://railway.app
2. Crée un compte (GitHub login)
3. Clique "New Project"
4. Sélectionne "Deploy from GitHub"
5. Cherche "TetsuBot" → Deploy
```

### 5️⃣ Ajouter les Variables
```
Dans Railway:
1. Variables tab
2. Add Variable:
   - MONGODB_URI = ton_uri_atlas
   - NODE_ENV = production
   - BOT_PREFIX = !
   - ADMIN_JIDS = ton_numero@g.us (optionnel)
```

**DONE! ✅ Le bot est en ligne!**

---

## 📋 Checklist Avant Déploiement

- [ ] MongoDB Atlas account créé
- [ ] MongoDB URI copiée
- [ ] `.env` file NOT commité
- [ ] `railway-check.js` a passé ✅
- [ ] GitHub push complété
- [ ] Railway project créé
- [ ] Variables ajoutées

## 🔗 Liens Utiles

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Railway**: https://railway.app
- **Guide Complet**: Ouvre `RAILWAY_DEPLOYMENT.md`
- **Variables**: Ouvre `RAILWAY_VARIABLES.md`

## 📝 Fichiers de Config Créés

✅ `Procfile` - Commande de démarrage
✅ `railway.json` - Configuration Railway
✅ `.railwayignore` - Fichiers ignorés
✅ `RAILWAY_DEPLOYMENT.md` - Guide complet
✅ `RAILWAY_VARIABLES.md` - Variables d'env
✅ `railway-check.js` - Vérification pre-deploy
✅ `.gitignore` - Mis à jour

## ⚠️ Points Importants

1. **Ne commit jamais** `.env` avec vraies valeurs
2. **MongoDB**: Utilise Atlas (gratuit, cloud)
3. **Railway**: Redéploie auto à chaque `git push`
4. **Logs**: Railway → Deployments → Logs en temps réel
5. **WhatsApp**: Scanne le QR au premier démarrage

## 🆘 Problèmes?

### Bot n'apparaît pas
```
→ Vérifier les logs: Railway dashboard → Logs
→ Vérifier MONGODB_URI
→ Vérifier whitelist MongoDB
```

### "Cannot find module"
```
→ Attendre que Railway finisse le build
→ Redéployer: Railway → Redeploy
→ Vérifier package.json
```

### Connexion WhatsApp refuse
```
→ Le numéro doit être un compte WhatsApp valide
→ Scanne le QR code à la première connexion
→ Vérifie les logs pour l'erreur exacte
```

---

**Questions?** Consulte les guides complets:
- `RAILWAY_DEPLOYMENT.md` - Guide détaillé
- `RAILWAY_VARIABLES.md` - Variables d'environnement
