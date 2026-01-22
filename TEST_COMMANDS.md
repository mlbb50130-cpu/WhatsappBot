# 🎮 GUIDE DE TEST DES COMMANDES - LOCAL

## ✅ TESTER TOUTES LES COMMANDES LOCALEMENT

Voici comment vérifier que chaque commande fonctionne correctement.

---

## 🚀 AVANT DE COMMENCER

```bash
# 1. Démarrer MongoDB
start-mongodb.bat

# 2. Dans une autre console, démarrer le bot
test-local.bat

# 3. Scanner le QR code
# Ouvrir WhatsApp Web → Paramètres → Appareils connectés
```

---

## ✅ PHASE 1: COMMANDES DE BASE

### Test 1: !ping
```
Envoyez: !ping

Résultat attendu:
✅ Pong! Latence: XXms

Status: ✅ OK
```

### Test 2: !help
```
Envoyez: !help

Résultat attendu:
Liste de toutes les commandes

Status: ✅ OK
```

### Test 3: !info
```
Envoyez: !info

Résultat attendu:
À propos de TetsuBot
Version 1.0.0

Status: ✅ OK
```

---

## 🎯 PHASE 2: SYSTÈME RPG

### Test 4: !profil
```
Envoyez: !profil

Résultat attendu:
📊 Votre Profil
Niveau: 1
XP: 0/100
Rang: Genin Otaku 🥋

Status: ✅ OK
```

### Test 5: XP System
```
Étape 1: Envoyer un message normal (sans !)
Étape 2: Attendre 5 secondes
Étape 3: Envoyer un autre message normal
Étape 4: Envoyer: !profil

Résultat attendu:
XP augmente de 5 par message
(Vous devez voir: XP: 10/100)

Status: ✅ OK
```

### Test 6: !level
```
Envoyez: !level

Résultat attendu:
📈 Votre Niveau
Niveau actuel: 1
Rang: Genin Otaku 🥋
Progression vers niveau 2: 10/100

Status: ✅ OK
```

### Test 7: !stats
```
Envoyez: !stats

Résultat attendu:
📊 Vos Statistiques
Messages: XX
Quiz complétés: 0
Victoires: 0
Défaites: 0

Status: ✅ OK
```

### Test 8: !classement
```
Envoyez: !classement

Résultat attendu:
🏆 Classement du groupe
1. Votre_Nom - Niveau 1 - 10 XP
...

Status: ✅ OK
```

---

## 🎮 PHASE 3: JEUX ET ACTIVITÉS

### Test 9: !quiz
```
Envoyez: !quiz

Résultat attendu:
🎯 Quiz lancé! (30 secondes)
Question 1/6: ...
A) ...
B) ...
C) ...
D) ...

Étape 2: Répondre avec: !reponse A

Résultat: XP +50 si correct, -10 si incorrect
Status: ✅ OK
```

### Test 10: !loot
```
Envoyez: !loot

Résultat attendu:
💎 Vous avez trouvé:
[Item rare/common/uncommon/epic/legendary]
Nom: Bronze Sword
Rareté: Common

Status: ✅ OK
```

### Test 11: !inventaire
```
Envoyez: !loot (2-3 fois pour avoir des items)
Envoyez: !inventaire

Résultat attendu:
📦 Votre Inventaire
- Bronze Sword x1 (Common)
- Leather Armor x1 (Uncommon)
- Gold: 250

Status: ✅ OK
```

### Test 12: !chance
```
Envoyez: !chance

Résultat attendu:
🍀 Votre chance du jour: XX%
(Une fois par 24h)

Status: ✅ OK
```

### Test 13: !pfc (Pierre-Feuille-Ciseaux)
```
Envoyez: !pfc

Résultat attendu:
✂️ Vous avez choisi: Pierre/Feuille/Ciseaux
Le bot a choisi: ...
Résultat: Gagné/Perdu/Égalité
(Gagnant: +20 XP)

Status: ✅ OK
```

### Test 14: !roulette
```
Envoyez: !roulette

Résultat attendu:
🎰 Vous avez lancé la roulette!
Résultat: Gagné/Perdu
(Gagné: +500 gold)

Status: ✅ OK
```

### Test 15: !ship (Compatibilité)
```
Envoyez: !ship @utilisateur2

Résultat attendu:
💕 Compatibilité: XX%
❤️❤️❤️⚪⚪ (3/5 coeurs)

Status: ✅ OK
```

### Test 16: !roast
```
Envoyez: !roast @utilisateur

Résultat attendu:
🔥 Roast aléatoire humoristique

Status: ✅ OK
```

### Test 17: !waifu
```
Envoyez: !waifu

Résultat attendu:
Image d'une waifu + lien

Status: ✅ OK
```

### Test 18: !husbando
```
Envoyez: !husbando

Résultat attendu:
Image d'un husbando + lien

Status: ✅ OK
```

### Test 19: !blagueotaku
```
Envoyez: !blagueotaku

Résultat attendu:
😂 Blague otaku aléatoire

Status: ✅ OK
```

### Test 20: !menu
```
Envoyez: !menu

Résultat attendu:
📋 Menu principal
- !profil - Votre profil
- !quiz - Jouer au quiz
- etc...

Status: ✅ OK
```

---

## ⚔️ PHASE 4: COMBATS PVP

### Test 21: !duel @utilisateur2

**Prérequis:** 2 utilisateurs dans le groupe

```
Utilisateur 1 envoie: !duel @Utilisateur2

Résultat attendu:
⚔️ Duel lancé!
Utilisateur1 VS Utilisateur2

Utilisateur1 attaque!
Dégâts: XX
Utilisateur2 PV: XX/100

... Combat se déroule ...

🏆 Utilisateur1 a gagné!
XP: +100
Gold: +500

Status: ✅ OK
```

---

## 🛡️ PHASE 5: MODÉRATION (Optionnel - Besoin Permission Admin)

### Test 22: !warn @utilisateur
```
Envoyez: !warn @utilisateur

Résultat attendu:
⚠️ Utilisateur a reçu 1/3 avertissements

Status: ✅ OK (si vous êtes admin)
```

### Test 23: !setxp @utilisateur 500
```
Envoyez: !setxp @utilisateur 500

Résultat attendu:
✅ XP défini à 500 pour l'utilisateur

Status: ✅ OK (si vous êtes admin)
```

### Test 24: !kick @utilisateur
```
Envoyez: !kick @utilisateur

Résultat attendu:
👋 Utilisateur expulsé du groupe

Status: ✅ OK (si vous êtes admin)
```

### Test 25: !clear
```
Envoyez: !clear

Résultat attendu:
🗑️ Tentative de nettoyage (peut ne pas fonctionner)

Status: ✅ OK (si vous êtes admin)
```

---

## 🎯 RÉSUMÉ DES TESTS

### Checklist Complète:

```
Commandes de Base:
 ☐ !ping          - Vérifier latence
 ☐ !help          - Lister les commandes
 ☐ !info          - À propos du bot

Système RPG:
 ☐ !profil        - Profil utilisateur
 ☐ !level         - Niveau et progression
 ☐ !stats         - Statistiques
 ☐ !classement    - Top du groupe
 ☐ XP System      - XP par message

Jeux:
 ☐ !quiz          - Jeu de questions
 ☐ !loot          - Butin aléatoire
 ☐ !inventaire    - Voir items
 ☐ !chance        - Chance quotidienne
 ☐ !pfc           - Pierre-Feuille-Ciseaux
 ☐ !roulette      - Jeu de roulette
 ☐ !ship          - Compatibilité
 ☐ !roast         - Roast aléatoire
 ☐ !waifu         - Image waifu
 ☐ !husbando      - Image husbando
 ☐ !blagueotaku   - Blague otaku
 ☐ !menu          - Menu principal

Combats:
 ☐ !duel @user    - Combattre quelqu'un

Admin (Optionnel):
 ☐ !warn @user    - Avertir
 ☐ !kick @user    - Expulser
 ☐ !setxp @user   - Définir XP
 ☐ !clear         - Nettoyer
```

---

## 📊 RÉSULTAT ATTENDU

Après ces tests, vous devriez avoir:

```
✅ 25 commandes testées
✅ Aucune erreur critique
✅ XP system fonctionnel
✅ Cooldown system fonctionnel
✅ Permissions vérifiées
✅ Base de données remplie
✅ Logs sans erreurs
✅ Bot prêt pour production
```

---

## 🐛 DÉPANNAGE PENDANT LES TESTS

### Commande ne répond pas
```
1. Vérifier le prefix: doit être !
2. Vérifier que le bot est connecté
3. Voir les logs: tail -f logs/tetsubot-*.log
4. Vérifier les permissions
```

### Erreur "Permission denied"
```
1. Vérifier ADMIN_JIDS dans .env
2. Obtenir votre JID depuis les logs
3. Ajouter à ADMIN_JIDS
4. Redémarrer le bot
```

### Erreur "Database connection"
```
1. Vérifier que MongoDB est lancé
2. Vérifier MONGODB_URI dans .env
3. Relancer MongoDB: start-mongodb.bat
4. Redémarrer le bot
```

### Erreur "Cannot find module"
```
1. Réinstaller: rm -rf node_modules && npm install
2. Relancer: npm start
```

---

## ✨ PROCHAINES ÉTAPES

Si tous les tests passent:

1. ✅ Félicitations! Votre bot fonctionne
2. 📦 Prêt pour le déploiement
3. 🚀 Voir: DEPLOYMENT.md

Si des tests échouent:

1. Consulter: LOCAL_TESTING.md
2. Vérifier: logs/tetsubot-*.log
3. Relancer: test-local.bat

---

**🎮 Bon test! Et bienvenue dans TetsuBot!** 🤖
