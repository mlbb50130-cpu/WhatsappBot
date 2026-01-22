# 🚀 Guide de Déploiement - Actions Admin Baileys

## 📝 Résumé des changements

Ce guide explique comment déployer et utiliser les **vraies actions admin** via Baileys pour que votre TetsuBot soit pleinement fonctionnel en tant qu'administrateur.

---

## 🎯 Nouvelles Fonctionnalités Implémentées

### ✅ Actions Admin Reelles

1. **Kick Utilisateur** - Expulsion immédiate avec raison enregistrée
2. **Warn Utilisateur** - Système d'avertissement avec ban automatique
3. **Promote** - Promouvoir un membre en administrateur
4. **Demote** - Rétrograder un administrateur
5. **Mute** - Seuls les admins peuvent écrire
6. **Unmute** - Tous les membres peuvent écrire
7. **Lock** - Paramètres modifiables uniquement par les admins
8. **Unlock** - Tous les membres peuvent modifier les paramètres
9. **Group Info** - Afficher les détails du groupe
10. **List Admins** - Lister tous les administrateurs

---

## 📦 Fichiers Nouvellement Créés/Modifiés

### Nouveaux Fichiers:

```
src/utils/adminActions.js          ← Moteur d'actions admin
src/utils/permissionManagerV2.js   ← Gestionnaire de permissions avancé
src/config/adminConfig.js          ← Configuration des actions
src/commands/admin/promote.js       ← Commande promote
src/commands/admin/demote.js        ← Commande demote
src/commands/admin/mute.js          ← Commande mute
src/commands/admin/unmute.js        ← Commande unmute
src/commands/admin/lock.js          ← Commande lock
src/commands/admin/unlock.js        ← Commande unlock
src/commands/admin/groupinfo.js     ← Commande groupinfo
src/commands/admin/admins.js        ← Commande admins
ADMIN_ACTIONS_GUIDE.md              ← Documentation complète
```

### Fichiers Modifiés:

```
src/commands/admin/kick.js          ← Utilise maintenant AdminActionsManager
src/commands/admin/warn.js          ← Utilise maintenant AdminActionsManager
```

---

## 🔧 Installation et Configuration

### Étape 1: Vérifiez les dépendances

```bash
npm list @whiskeysockets/baileys
npm list mongoose
```

**Dépendances requises:**
- `@whiskeysockets/baileys` ^6.6.0 ou plus
- `mongoose` ^8.0.0 ou plus

Si elles manquent:
```bash
npm install @whiskeysockets/baileys mongoose
```

### Étape 2: Vérifiez le modèle User

Assurez-vous que votre modèle `User` dispose des champs suivants:

```javascript
// src/models/User.js
{
  jid: String,                    // WhatsApp JID
  username: String,
  warnings: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  warningHistory: Array,          // Optionnel
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Configuration Recommandée

### Dans `src/config/adminConfig.js`:

```javascript
module.exports = {
  WARNINGS: {
    MAX_WARNINGS: 3,           // Nombre d'avertissements avant ban
    AUTO_BAN_THRESHOLD: 3,     // Seuil de ban automatique
    RESET_AFTER_DAYS: 30,      // Réinitialiser après X jours
  },
  
  PERMISSIONS: {
    OWNER_ONLY: ['demote', 'promote'],
    ADMIN_ONLY: ['kick', 'warn', 'promote', 'demote', 'mute', 'unmute', 'lock', 'unlock'],
  },

  SECURITY: {
    PROTECT_OWNER: true,       // Protéger le propriétaire
    PROTECT_ADMINS: false,     // Protéger les autres admins
    CHECK_PERMISSIONS: true,   // Vérifier les permissions
  }
};
```

---

## 🔐 Configuration du Bot en Admin

**TRÈS IMPORTANT:** Le bot doit être **administrateur** du groupe pour utiliser les actions.

### Comment faire le bot admin:

1. **Créez un groupe WhatsApp** (ou utilisez un existant)
2. **Scannez le code QR** avec Baileys pour connecter le bot
3. **Donnez l'accès admin:**
   - Maintenez l'appui sur le nom du bot dans le groupe
   - Sélectionnez "Faire administrateur"
   - Confirmez les permissions

### Permissions requises:

- ✅ Ajouter/Supprimer des membres
- ✅ Modifier les paramètres du groupe
- ✅ Éditer le nom/description
- ✅ Créer des messages de groupe

---

## 🧪 Test des Fonctionnalités

### 1. Test de Kick:

```
!kick @utilisateur Raison du kick
```

**Attendu:**
- Utilisateur expulsé du groupe ✅
- Message de confirmation affiché ✅

### 2. Test de Warn:

```
!warn @utilisateur Spam
!warn @utilisateur Insulte
!warn @utilisateur Comportement toxique
```

**Attendu:**
- Après 3 warns → Utilisateur banni et expulsé ✅

### 3. Test de Promote:

```
!promote @utilisateur
```

**Attendu:**
- Utilisateur devient administrateur ✅

### 4. Test de Mute:

```
!mute
```

**Attendu:**
- Seuls les admins peuvent écrire ✅
- Les messages des autres sont bloqués ✅

```
!unmute
```

**Attendu:**
- Tous peuvent écrire à nouveau ✅

### 5. Test de Lock:

```
!lock
```

**Attendu:**
- Paramètres modifiables uniquement par les admins ✅

### 6. Vérifier les Info:

```
!groupinfo
!admins
```

**Attendu:**
- Informations du groupe affichées ✅

---

## 📊 Structure des Données en Base

### Utilisateurs (Warnings):

```javascript
// MongoDB Collection: users
{
  _id: ObjectId,
  jid: "1234567890@s.whatsapp.net",
  username: "Jean",
  warnings: 2,
  isBanned: false,
  warningHistory: [
    { date: "2026-01-20", reason: "Spam" },
    { date: "2026-01-21", reason: "Insulte" }
  ],
  createdAt: ISODate("2026-01-20"),
  updatedAt: ISODate("2026-01-21")
}
```

---

## 🐛 Dépannage Courant

### ❌ Erreur: "Le bot n'est pas administrateur"

**Cause:** Le bot n'a pas les droits admin  
**Solution:**
1. Maintenez sur le nom du bot
2. Sélectionnez "Faire administrateur"
3. Confirmez les permissions

### ❌ Erreur: "Utilisateur introuvable"

**Cause:** L'utilisateur ne peut pas être trouvé  
**Solution:** Utilisez `@mention` pour cibler l'utilisateur

### ❌ Aucune réponse du bot

**Cause:** 
- Bot déconnecté
- Erreur MongoDB
- Baileys en conflit

**Solution:**
```bash
# Redémarrez le bot
npm run dev

# Vérifiez MongoDB
mongosh
use tetsubot
db.users.find()
```

### ❌ Erreur: "Impossible d'expulser cet utilisateur"

**Causes:**
- L'utilisateur n'existe plus dans le groupe
- L'utilisateur est le propriétaire
- Permissions insuffisantes

---

## 📈 Monitoring et Logs

### Activer les logs détaillés:

Dans `src/index.js`:

```javascript
const logger = require('pino')({ 
  level: 'debug'  // 'info', 'debug', 'error'
});
```

### Voir les actions admin:

```bash
npm run dev 2>&1 | grep "ADMIN LOG"
```

---

## 🔄 Flux d'Exécution

```
Commande Admin
    ↓
LoadCommands() charge la commande
    ↓
handleMessage() parse le message
    ↓
PermissionCheck() vérifie les permissions
    ↓
CooldownCheck() vérifie le cooldown
    ↓
AdminActionsManager execute l'action
    ↓
Baileys envoie la commande WhatsApp
    ↓
Notification envoyée au groupe
    ↓
Action effectuée ✅
```

---

## 📋 Checklist de Déploiement

- [ ] Bot connecté via Baileys
- [ ] Bot administrateur du groupe
- [ ] MongoDB configuré et connecté
- [ ] Modèle User a les champs warnings et isBanned
- [ ] Toutes les commandes admin chargées
- [ ] Test kick - Fonctionne ✅
- [ ] Test warn - Fonctionne ✅
- [ ] Test promote - Fonctionne ✅
- [ ] Test mute - Fonctionne ✅
- [ ] Test groupinfo - Fonctionne ✅
- [ ] Logs affichés correctement
- [ ] Cooldowns fonctionnent

---

## 🎯 Prochaines Étapes

1. **Ajouter plus de commandes:**
   - Rename groupe
   - Change description
   - Reset warnings
   - Ban list

2. **Améliorations:**
   - Système de permissions granulaires
   - Historique des actions
   - Dashboard web

3. **Intégrations:**
   - Logs dans un canal dédié
   - Webhooks Discord
   - Export statistiques

---

## 📞 Support

Si vous avez des problèmes:

1. Vérifiez que Baileys est à jour
2. Testez les logs
3. Vérifiez MongoDB
4. Consultez la documentation Baileys

---

**Version:** 1.0.0  
**Mise à jour:** 21 Janvier 2026  
**Auteur:** TetsuBot Team
