# 🛡️ Documentation des Actions Admin Baileys

## Vue d'ensemble

Le système de modération du TetsuBot utilise **Baileys** pour effectuer des actions concrètes dans les groupes WhatsApp. Le bot doit être **administrateur** du groupe pour utiliser toutes ces fonctionnalités.

---

## 📋 Commandes Disponibles

### 1. ⚠️ WARN - Avertir un utilisateur
```
!warn @utilisateur [raison]
```

**Fonctionnalités:**
- Enregistre un avertissement à l'utilisateur
- 3 avertissements = Ban automatique
- Raison stockée en base de données
- Notification au groupe avec compteur

**Exemple:**
```
!warn @Jean Spam dans le chat
```

**Réponse:**
```
⚠️ AVERTISSEMENT ENREGISTRÉ

👤 @Jean
📝 Raison: Spam dans le chat
📊 Avertissements: 1/3
⏰ Avertissements restants avant ban: 2

👮 Modérateur: Admin
```

---

### 2. 🚪 KICK - Expulser un utilisateur
```
!kick @utilisateur [raison]
```

**Fonctionnalités:**
- Expulsion immédiate du groupe
- Raison optionnelle
- Vérification admin du bot
- Notification au groupe

**Exemple:**
```
!kick @Jean Comportement toxique
```

---

### 3. 👑 PROMOTE - Promouvoir en admin
```
!promote @utilisateur
```

**Fonctionnalités:**
- Promouvoir un membre en administrateur
- Vérification que le bot est admin
- Vérification que l'utilisateur n'est pas déjà admin
- Notification au groupe

**Exemple:**
```
!promote @Jean
```

**Réponse:**
```
✅ PROMOTION EFFECTUÉE

👤 @Jean
👑 Est maintenant administrateur!

👮 Promu par: Admin
```

---

### 4. ⬇️ DEMOTE - Rétrograder un admin
```
!demote @admin
```

**Fonctionnalités:**
- Rétrograder un administrateur
- Vérification que ce n'est pas le propriétaire
- Notification au groupe
- Protection contre l'auto-rétrogradation

**Exemple:**
```
!demote @Jean
```

---

### 5. 🔇 MUTE - Rendre le groupe muet
```
!mute
```

**Fonctionnalités:**
- Seuls les admins peuvent écrire
- Tous les messages des membres sont bloqués
- Paramètre du groupe modifié
- Réversible avec `!unmute`

**Effet:** Les membres ne peuvent que lire, pas écrire

---

### 6. 🔊 UNMUTE - Réactiver le groupe
```
!unmute
```

**Fonctionnalités:**
- Tous les membres peuvent écrire à nouveau
- Rétablit la communication normale
- Inverse de `!mute`

---

### 7. 🔐 LOCK - Verrouiller les paramètres
```
!lock
```

**Fonctionnalités:**
- Seuls les admins peuvent modifier:
  - Le nom du groupe
  - La description
  - L'image
  - Les paramètres
- Protection du groupe contre les modifications par les membres

---

### 8. 🔓 UNLOCK - Déverrouiller les paramètres
```
!unlock
```

**Fonctionnalités:**
- Tous les membres peuvent modifier les paramètres
- Inverse de `!lock`

---

### 9. 📊 GROUPINFO - Informations du groupe
```
!groupinfo
```

**Affiche:**
- Nom du groupe
- Nombre de membres
- Nombre d'admins
- Date de création
- Statut du groupe (muet/déverrouillé)
- Description

**Exemple de sortie:**
```
╔═══════════════════════════════════╗
║    📊 INFORMATIONS DU GROUPE      ║
╚═══════════════════════════════════╝

👥 Nom: Anime Squad

📈 Statistiques:
  • Membres total: 25
  • Administrateurs: 3
  • Membres réguliers: 22

⚙️ Paramètres:
  • Message: 💬 Tous peuvent écrire
  • Verrouillage: 🔓 Déverrouillé

📅 Créé le: 15/01/2026

👨‍💼 Propriétaire: 213456789@s.whatsapp.net

📝 Description:
Groupe d'amis passionnés par l'anime!
```

---

### 10. 👑 ADMINS - Lister les administrateurs
```
!admins
```

**Affiche:**
- Tous les administrateurs du groupe
- Badge "Super Admin" ou "Administrateur"
- Nombre total d'admins

**Exemple de sortie:**
```
╔════════════════════════════════╗
║    👑 ADMINISTRATEURS (3)       ║
╚════════════════════════════════╝

1. 👑 213456789@s.whatsapp.net
   └─ Super Admin

2. 🔱 987654321@s.whatsapp.net
   └─ Administrateur

3. 🔱 555666777@s.whatsapp.net
   └─ Administrateur
```

---

## 🔐 Vérifications de Sécurité

### Avant chaque action, le bot vérifie:

1. **🤖 Bot Admin Check**
   - Le bot doit être administrateur du groupe
   - Si non → ❌ "Le bot n'est pas administrateur"

2. **👤 User Admin Check**
   - L'utilisateur doit être administrateur (sauf indication)
   - Si non → ❌ "Seuls les administrateurs peuvent utiliser cette commande"

3. **🚫 Self-Action Protection**
   - L'utilisateur ne peut pas s'effectuer des actions sur lui-même
   - Exemples: pas de self-kick, self-demote, etc.

4. **⏱️ Cooldown Check**
   - Délai minimum entre les commandes
   - Empêche le spam des commandes admin

---

## 📊 Système de Warnings

### Processus:
1. **1er avertissement** → ⚠️ Notification
2. **2e avertissement** → ⚠️ Notification (2/3)
3. **3e avertissement** → ⛔ Ban automatique + Kick

### Stockage:
- Tous les avertissements sont stockés dans MongoDB
- Persistants même après redémarrage du bot
- Consultable via la base de données

```javascript
// Structure en base de données
{
  jid: "1234567890@s.whatsapp.net",
  username: "Jean",
  warnings: 2,
  isBanned: false,
  warningHistory: [
    { date: "2026-01-20", reason: "Spam" },
    { date: "2026-01-21", reason: "Insulte" }
  ]
}
```

---

## 🛠️ Configuration Requise

### Le bot doit avoir les permissions:
- ✅ Administrateur du groupe
- ✅ Peut ajouter/supprimer des membres
- ✅ Peut modifier les paramètres du groupe

### Installation du bot comme admin:

1. Créer un groupe WhatsApp
2. Ajouter le bot via QR code
3. Faire le bot administrateur:
   - Maintenir le doigt sur le bot
   - Sélectionner "Faire administrateur"

---

## 📝 Exemples d'Utilisation

### Scénario 1: Modération basique
```
Utilisateur toxique: "Hey tous *spam spam spam*"

Admin: !warn @Utilisateur Spam dans le chat
Bot: ⚠️ AVERTISSEMENT ENREGISTRÉ
     👤 @Utilisateur
     📝 Raison: Spam dans le chat
     📊 Avertissements: 1/3

Utilisateur toxique: "Plus de spam *insulte*"

Admin: !warn @Utilisateur Insulte
Bot: ⚠️ AVERTISSEMENT ENREGISTRÉ
     👤 @Utilisateur
     📊 Avertissements: 2/3

Utilisateur toxique: "Encore du spam!"

Admin: !warn @Utilisateur Spam répété
Bot: ⛔ UTILISATEUR BANNI
     👤 @Utilisateur
     🚫 Avertissements: 3/3
     [Utilisateur expulsé du groupe]
```

### Scénario 2: Gestion du groupe
```
Admin: !mute
Bot: 🔇 Groupe rendu muet - Seuls les admins peuvent écrire

Admin: !lock
Bot: 🔐 Groupe verrouillé - Seuls les admins peuvent modifier les paramètres

[... Événement/Annonce ...]

Admin: !unmute
Bot: 🔊 Groupe dérendu muet - Tous les membres peuvent écrire

Admin: !unlock
Bot: 🔓 Groupe déverrouillé - Tous les membres peuvent modifier les paramètres
```

### Scénario 3: Gestion des admins
```
Admin: !promote @Jean
Bot: ✅ PROMOTION EFFECTUÉE
     👤 @Jean
     👑 Est maintenant administrateur!

[Plus tard...]

Admin: !demote @Jean
Bot: ✅ RÉTROGRADATION EFFECTUÉE
     👤 @Jean
     😔 N'est plus administrateur!

Admin: !admins
Bot: 👑 ADMINISTRATEURS (2)
     1. 👑 [Propriétaire]
     2. 🔱 [Modérateur]
```

---

## ⚠️ Limitations Connues

### WhatsApp/Baileys:
1. **Pas de suppression de messages** - WhatsApp n'autorise que les messages personnels
2. **Pas de message d'accueil automatique** - Limitation WhatsApp
3. **Délai d'exécution** - Légère latence possible (1-3 sec)

### Bot:
1. **Notifications stockées** - Pas de système de notification persistant
2. **Historique limité** - Les logs sont stockés localement

---

## 🔧 Dépannage

### Erreur: "Le bot n'est pas administrateur"
**Solution:** Faire le bot administrateur dans les paramètres du groupe

### Erreur: "Impossible d'expulser cet utilisateur"
**Causes possibles:**
- L'utilisateur n'existe plus dans le groupe
- Le bot n'a pas les permissions
- L'utilisateur est le propriétaire du groupe

### Erreur: "Utilisateur introuvable"
**Cause:** Vous devez mentionner l'utilisateur avec `@mention`

---

## 📞 Support

Pour toute issue ou suggestion:
1. Vérifiez que le bot est admin
2. Vérifiez que Baileys est à jour
3. Consultez les logs du bot
4. Créez une issue sur le GitHub

---

**Version:** 1.0.0  
**Dernière mise à jour:** 21 Janvier 2026
