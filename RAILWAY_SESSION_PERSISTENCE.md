# 🚀 Guide de Persistance de Session WhatsApp sur Railway

## ⚠️ Problème: Session WhatsApp se perd à chaque redéploiement

Lorsque vous redéployez votre bot sur Railway, le dossier `whatsapp_auth/` est supprimé, ce qui force une nouvelle authentification WhatsApp.

## ✅ Solutions

### Solution 1: Utiliser les Volumes Persistants Railway (RECOMMANDÉ)

#### Étape 1: Accéder à Railway
1. Va sur https://railway.app
2. Ouvre ton projet TetsuBot
3. Clique sur l'onglet **"Volumes"**

#### Étape 2: Créer un Volume
1. Clique sur **"Add Volume"**
2. Configure:
   - **Nom**: `whatsapp-auth-storage`
   - **Chemin de montage**: `/app/whatsapp_auth`
3. Clique **"Create"**

#### Étape 3: Vérifier la Configuration

Dans Railway, ton volume sera monté et disponible à:
```
/app/whatsapp_auth/
```

Nos variables d'environnement gèrent automatiquement ce chemin:
```env
SESSION_DIR=/app/whatsapp_auth
```

### Solution 2: Stocker les Credentials dans MongoDB (Alternative)

Si tu préfères ne pas utiliser de volumes, tu peux stocker les credentials WhatsApp dans MongoDB:

1. Crée une collection `whatsapp_credentials`
2. Sauvegarde les credentials chiffrés
3. Charge-les au démarrage

*Nécessite des modifications du code*

## 🔐 Configuration des Variables d'Environnement sur Railway

Ajoute ces variables dans l'onglet **Variables** de Railway:

```env
# Session
SESSION_DIR=/app/whatsapp_auth
WHATSAPP_SESSION_NAME=whatsapp_auth

# Database (ne change pas si tu utilises MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tetsubot

# Bot
NODE_ENV=production
DEV_MODE=false
BOT_PREFIX=!
```

## 📊 Vérification

Après redéploiement, vérifie dans les logs Railway:

```
✅ Session directory: /app/whatsapp_auth
✅ Created session directory: /app/whatsapp_auth
```

Si tu vois cela, la persistance fonctionne! ✨

## 🐛 Dépannage

### Erreur: "Permission denied"
→ Le volume n'a pas les bonnes permissions
→ Solution: Supprime et recrée le volume

### Erreur: "Session directory not found"
→ Tu as oublié de créer le volume
→ Solution: Crée le volume comme décrit ci-dessus

### Le bot se reconnecte constantement
→ Les credentials sont corrompus
→ Solution: Supprime le volume et redéploie

## 🔄 Processus Complet

```
1. Crée un volume Railway: whatsapp_auth_storage
2. Configure SESSION_DIR=/app/whatsapp_auth
3. Déploie le bot
4. Scanne le QR code une fois
5. Les credentials sont sauvegardés dans le volume persistant
6. Les redéploiements futurs réutiliseront la même session
```

## ✨ Avantages de cette Approche

- ✅ Pas besoin de scaner le QR à chaque redéploiement
- ✅ Session persistante entre les mises à jour
- ✅ Pas de stockage sensible en base de données
- ✅ Simple et rapide à configurer

---

**Status**: ✅ Configuration complète et testée
**Dernière mise à jour**: 2026-01-22
