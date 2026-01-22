// 👥 CONFIGURATION COMPLÈTE POUR GROUPES WHATSAPP

## ✅ VÉRIFICATION DES CONFIGURATIONS

### 1️⃣ Avant le déploiement

```bash
# Lancer la vérification complète
node verify-config.js

# Résultats attendus:
✅ .env: Toutes les variables requises présentes
✅ package.json: Toutes les dépendances présentes
✅ src/config.js: Configuration valide
✅ src/index.js: Support des groupes configuré
✅ src/database.js: MongoDB correctement configuré
✅ src/handler.js: Handler complet avec permissions
✅ Models: Tous les modèles présents
✅ Commands: 25 commandes trouvées
✅ Utils: Tous les utilitaires présents
✅ Directories: Tous les répertoires requis existent

🎉 Configuration parfaite pour fonctionner dans un groupe WhatsApp!
```

---

## 📋 CHECKLIST CONFIGURATION GROUPES

### A. Configuration Système (.env)
- [ ] PHONE_NUMBER défini
- [ ] MONGODB_URI pointant vers MongoDB
- [ ] PREFIX défini (default: !)
- [ ] ADMIN_JIDS complété (au moins 1)
- [ ] LOG_LEVEL configuré (info par défaut)

### B. Base de Données
- [ ] MongoDB running (local ou Atlas)
- [ ] Collections créées automatiquement
- [ ] Modèles chargés:
  - [ ] User.js
  - [ ] Group.js (NOUVEAU)
  - [ ] Inventory.js
  - [ ] Quest.js
  - [ ] Warn.js

### C. Configuration Bot (src/config.js)
- [ ] PREFIX correct
- [ ] ADMIN_JIDS parsé
- [ ] GROUP_FEATURES activées
- [ ] COLORS configurées
- [ ] Tous les RANKS définis

### D. Utilitaires Groupe
- [ ] groupManager.js créé ✅
- [ ] antiSpam.js présent
- [ ] antiLink.js présent
- [ ] permissions.js opérationnel
- [ ] cooldown.js fonctionnel

### E. Commandes
- [ ] help.js affiche les commandes du groupe
- [ ] admin/kick.js fonctionne
- [ ] admin/warn.js fonctionne
- [ ] profil.js fonctionne
- [ ] classement.js fonctionne

### F. Déploiement
- [ ] Code commité
- [ ] npm install exécuté
- [ ] Sessions créées (./sessions/)
- [ ] Logs activés (./logs/)
- [ ] Backups configurés (./backups/)

---

## 🎯 CONFIGURATIONS PAR CAS D'USAGE

### CAS 1: Groupe de Jeu Casual
```javascript
// .env
PREFIX=!
BLOCK_LINKS=false
JIKAN_ENABLED=true

// Config requis
{
  features: {
    xpSystem: true,
    levelSystem: true,
    quizSystem: true,
    duelSystem: true,
    lootSystem: true,
    leaderboard: true,
    antiSpam: true,
    antiLink: false,
    autoWelcome: true
  }
}
```

### CAS 2: Groupe Sérieux / Professionnel
```javascript
// .env
PREFIX=@
BLOCK_LINKS=true
JIKAN_ENABLED=false

// Config requis
{
  features: {
    xpSystem: true,
    levelSystem: false,
    quizSystem: false,
    duelSystem: false,
    lootSystem: false,
    leaderboard: false,
    antiSpam: true,
    antiLink: true,
    autoWelcome: true
  },
  permissions: {
    onlyAdminsCanUseCommands: true,
    blockNSFW: true,
    blockInviteLinks: true
  }
}
```

### CAS 3: Groupe Otaku / Gaming
```javascript
// Config requis
{
  features: {
    xpSystem: true,
    levelSystem: true,
    quizSystem: true,
    duelSystem: true,
    lootSystem: true,
    leaderboard: true,
    antiSpam: true,
    antiLink: false,
    autoWelcome: true
  },
  settings: {
    xpPerMessage: 10,
    xpCooldown: 3000
  }
}
```

### CAS 4: Groupe Modéré Strict
```javascript
// Config requis
{
  features: {
    xpSystem: false,
    levelSystem: false,
    quizSystem: false,
    duelSystem: false,
    lootSystem: false,
    leaderboard: false,
    antiSpam: true,
    antiLink: true,
    autoWelcome: true
  },
  permissions: {
    onlyAdminsCanUseCommands: true,
    blockNSFW: true,
    blockInviteLinks: true,
    onlyMembersCanDuel: false
  },
  logs: {
    enabled: true,
    logJoins: true,
    logLeaves: true,
    logDeletes: true
  }
}
```

---

## 🚀 DÉPLOIEMENT ÉTAPE PAR ÉTAPE

### Étape 1: Installation
```bash
cd c:\Users\Shayne\Documents\TetsuBot
npm install
```

### Étape 2: Configuration
```bash
# Copier le template
cp .env.example.complete .env

# Éditer avec les infos correctes
# - PHONE_NUMBER: Votre numéro WhatsApp
# - MONGODB_URI: URL de votre MongoDB
# - ADMIN_JIDS: Votre JID (obtenu au premier démarrage)
```

### Étape 3: Premier Démarrage
```bash
npm start

# Le bot va:
# 1. Se connecter à MongoDB
# 2. Charger les 25 commandes
# 3. Générer un QR code
# 4. Attendre que vous scanniez le QR code dans WhatsApp
```

### Étape 4: Scan QR Code
```
Ouvrir WhatsApp Web → Scanner le QR code avec votre téléphone
→ Attendre la connexion (30-60 secondes)
→ Bot prêt!
```

### Étape 5: Ajouter le Bot au Groupe
```
1. Créer un groupe WhatsApp
2. Inviter le numéro du bot
3. Donner des permissions admin (optionnel)
4. Envoyer: !help
```

---

## 🎮 UTILISATION DANS UN GROUPE

### Commandes Essentielles
```
!ping            → Vérifie si bot actif
!help            → Liste des commandes
!profil          → Votre profil RPG
!level           → Votre niveau
!stats           → Vos statistiques

!duel @mention   → Défier quelqu'un
!quiz            → Quiz de 30 secondes
!loot            → Récupérer du butin
!classement      → Top 10 du groupe

!quiz            → Commande XP gratuit
!chance          → Chance quotidienne
!pfc             → Pierre-feuille-ciseaux
!roulette        → Jeu de roulette
```

### Commandes Admin
```
!warn @mention   → Avertir quelqu'un
!kick @mention   → Expulser du groupe
!clear           → Effacer messages
!setxp @mention 100 → Définir XP
```

### Configuration du Groupe (Optionnel)
```
Le bot mémorise par groupe:
- Prefix personnalisé
- Features activées/désactivées
- Modérateurs
- Membres bannis
- Statistiques du groupe
```

---

## 🔍 VÉRIFICATION POST-DÉPLOIEMENT

### Test 1: Bot Répond
```bash
# Dans le groupe, envoyer:
!ping

# Réponse attendue:
✅ Pong! Latence: XXms
```

### Test 2: Système XP Fonctionne
```bash
# Envoyer un message normal (sans !)
# Attendre 5 secondes
# Envoyer: !profil

# Résultat attendu:
# XP augmente de 5
```

### Test 3: Commandes Fonctionnent
```bash
!help            → Liste complète
!quiz            → Quiz démarre
!duel @admin     → Duel lancé
```

### Test 4: Permissions Respectées
```bash
# En tant que membre normal:
!kick @someone   
# → Résultat: Permission refusée ✅

# En tant qu'admin du groupe:
!warn @member
# → Résultat: Avertissement enregistré ✅
```

### Test 5: Base de Données
```bash
# Vérifier les collections MongoDB:
# - Users (doit avoir des entrées)
# - Groups (doit avoir votre groupe)
# - Inventories (peut être vide)
# - Warns (peut être vide)
```

---

## 🐛 DÉPANNAGE

### Bot ne démarre pas
```bash
# Vérifier Node.js
node --version
# Doit être >= 16.0.0

# Vérifier les erreurs
npm start 2>&1 | tail -20
```

### Erreur MongoDB
```bash
# Vérifier la connexion
MONGODB_URI=mongodb://localhost:27017/tetsubot

# Si local:
mongod --version
# Doit être en cours d'exécution

# Si Atlas:
Vérifier l'URL dans .env
```

### Bot ne répond pas aux messages
```bash
# Vérifier le prefix
echo $PREFIX
# Doit être: !

# Vérifier la permission
# Adminateur? Oui
# Groupe? Oui
# Commande désactivée? Non
```

### QR Code ne s'affiche pas
```bash
# Chercher dans les logs:
grep -i qr logs/*.log

# Ou scanner manuellement:
Ouvrir WhatsApp Web → Settings → Linked Devices
```

---

## 📊 STATISTIQUES & MONITORING

### Voir les Stats du Groupe
```bash
# Via MongoDB:
db.groups.findOne({ groupJid: "..." })

# Résultat:
{
  stats: {
    totalMessages: 1234,
    totalUsers: 45,
    totalCommands: 567,
    createdAt: Date
  }
}
```

### Voir les Utilisateurs
```bash
# Top 10 du groupe:
!classement

# Tous les users:
db.users.find().sort({ level: -1 }).limit(100)
```

### Logs d'Activité
```bash
# Fichiers logs:
ls -la logs/

# Contenu:
tail -f logs/tetsubot-2026-01-21.log
```

---

## ✨ FONCTIONNALITÉS AVANCÉES

### Moderateurs Personnalisés
```javascript
// Ajouter un modérateur (admin bot uniquement)
GroupManager.addModerator(groupJid, userJid);

// Supprimer
GroupManager.removeModerator(groupJid, userJid);
```

### Bannir des Membres
```javascript
// Bannir pour 24 heures
GroupManager.banMember(
  groupJid,
  userJid,
  'Spam',
  24 * 60 * 60 * 1000
);

// Débannir
GroupManager.unbanMember(groupJid, userJid);
```

### Prefix Personnalisé
```javascript
// Changer le prefix du groupe
GroupManager.setPrefix(groupJid, '@');

// Récupérer
const prefix = await GroupManager.getPrefix(groupJid);
```

---

## 🎯 PROCHAINES ÉTAPES

1. **Test complet** - Vérifier checklist
2. **Documentation** - Créer guide pour membres
3. **Customization** - Adapter les messages
4. **Backup** - Configurer backups auto
5. **Production** - Déployer sur serveur

---

**🎉 Tout est prêt pour un deployment parfait!**
