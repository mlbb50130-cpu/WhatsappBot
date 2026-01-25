# 🎮 Guide Rapide MLBB pour TetsuBot

## Installation (Automatique)

Les commandes MLBB sont **chargées automatiquement** par TetsuBot grâce au système de chargement dynamique des commandes. Aucune configuration supplémentaire n'est nécessaire!

---

## 📋 Commandes Disponibles

### 1️⃣ PROFIL JOUEUR

```
!mlbb set <rang> <role>
```
Enregistre ton profil MLBB.

**Exemple:**
```
!mlbb set legend assassin
```

**Rangs:** Warrior, Elite, Master, Grandmaster, Epic, Legend, Mythic, Mythic Honor
**Rôles:** Assassin, Fighter, Mage, Marksman, Tank, Support

---

```
!mlbb me
```
Affiche ton profil MLBB avec recommandations personnalisées.

---

### 2️⃣ INFORMATIONS HÉROS

```
!hero <nom>
```
Affiche les infos complètes d'un héros.

**Héros disponibles:** aamon, ling, gusion, chou, fanny, kagura, lancelot, esmeralda

**Exemple:**
```
!hero gusion
```

Affiche:
- Rôle et spécialité
- Compétences détaillées
- Forces et faiblesses

---

### 3️⃣ BUILDS OPTIMISÉES

```
!build <type>
```
Affiche une build itemisée avec ordre des achats.

**Types disponibles:**
- `assassin_burst` - Dégâts maximums
- `assassin_sustain` - Avec survie
- `fighter_tank` - Offensif tanky
- `mage_burst` - Dégâts magiques
- `tank_support` - Support full

**Exemple:**
```
!build assassin_burst
```

---

### 4️⃣ COUNTERS EFFICACES

```
!counter <héros>
```
Affiche les héros qui counter le héros donné.

**Exemple:**
```
!counter ling
```

Résultat: Khufra, Jawhead, Chou, etc. avec raisons.

---

### 5️⃣ COMBOS OPTIMAUX

```
!combo <héros>
```
Affiche les combos de dégâts à maîtriser.

**Exemple:**
```
!combo gusion
```

Contient:
- Full Burst Combo
- Quick Kill Combo
- Chase Combo
- Difficulté de chacun

---

### 6️⃣ META ACTUELLE

```
!meta
```
Affiche la **tier list** actuelle et les tendances par lane.

```
S TIER: Natan, Hilda, Mathilda, Ling, Kagura
A TIER: Aamon, Chou, Esmeralda, Gusion, Vale
B TIER: Lancelot, Fanny, Kaja, Johnson, Badang
```

---

### 7️⃣ GUIDES PAR LANE

```
!lane <role>
```
Guide complet pour chaque position.

**Positions disponibles:**
- `gold` - Gold Lane
- `mid` - Mid Lane (Mages)
- `exp` - EXP Lane / Jungle
- `roam` - Roam Support
- `carry` - ADC equivalent

**Exemple:**
```
!lane mid
```

Contient:
- Champions recommandés
- Objectifs principaux
- Timeline early/mid/late

---

### 8️⃣ CONSEILS ALÉATOIRES

```
!tip
```
Conseil quotidien pour améliorer ton jeu (20+ conseils différents).

---

### 9️⃣ GESTION D'ÉQUIPES

```
!team create <nom>
```
Crée une nouvelle équipe MLBB.

```
!team join <nom>
```
Rejoins une équipe existante.

```
!team leave
```
Quitte ton équipe.

```
!team list
```
Affiche toutes les équipes du groupe.

```
!team info
```
Affiche le roster de ta team.

```
!team disband
```
Dissout l'équipe (capitaine seulement).

---

## 🎯 Workflow Complet

### Nouveau Joueur

```
1. [10:00] !mlbb
   → Voir le guide complet

2. [10:05] !mlbb set legend assassin
   → Enregistrer profil

3. [10:10] !hero gusion
   → Apprendre le héros

4. [10:15] !combo gusion
   → Apprendre les combos

5. [10:20] !build assassin_burst
   → Voir la build

6. [10:25] !counter gusion
   → Voir qui le countre

7. [10:30] !tip
   → Conseil du jour
```

### Création d'Équipe

```
1. Capitaine: !team create Shadow Assassins
   → Équipe créée

2. Joueur1: !team join Shadow Assassins
   → Rejoint

3. Joueur2: !team join Shadow Assassins
   → Rejoint

4. Capitaine: !team info
   → Vérifier roster

5. Fin de saison: !team disband
   → Équipe dissoute
```

---

## 📱 Utilisation en Groupe WhatsApp

```
[14:30] User1: !mlbb set mythic fighter
[14:31] TetsuBot: ✅ Profil mis à jour!
        👤 Joueur: User1
        🎖️ Rang: Mythic
        🎯 Rôle: Fighter

[14:32] User2: !hero chou
[14:33] TetsuBot: [Infos détaillées sur Chou]

[14:35] User1: !build fighter_tank
[14:36] TetsuBot: [Build optimale]

[14:40] User3: !team create Dragon Slayers
[14:41] TetsuBot: ✅ Équipe créée!
        🏆 Dragon Slayers
        👥 Membres: 1

[14:42] User1: !team join Dragon Slayers
[14:43] TetsuBot: ✅ Tu as rejoint Dragon Slayers!

[14:44] User2: !team list
[14:45] TetsuBot: 🏆 ÉQUIPES DISPONIBLES
        1. Dragon Slayers
           👤 Capitaine: User3
           👥 Membres: 2
```

---

## 🔥 Cas d'Usage Communs

| Situation | Commande |
|-----------|----------|
| Je viens d'arriver au groupe | `!mlbb` |
| Je veux enregistrer mon profil | `!mlbb set <rang> <role>` |
| Comment jouer ce héros? | `!hero <nom>` |
| Quelle build utiliser? | `!build <type>` |
| Quel héros le countre? | `!counter <nom>` |
| Comment faire des dégâts? | `!combo <nom>` |
| Qui est OP en ce moment? | `!meta` |
| Je suis mid, comment jouer? | `!lane mid` |
| Besoin de conseils | `!tip` |
| Créer une team | `!team create <nom>` |
| Rejoindre une team | `!team join <nom>` |

---

## ⚙️ Fonctionnalités Spéciales

### Cooldown (Anti-Spam)
- Chaque commande a un cooldown (2-5 secondes)
- Évite le spam dans le groupe
- Messages aléatoires stylisés

### Validation des Entrées
- Vérifie les rangs valides
- Vérifie les rôles valides
- Messages d'erreur clairs

### Stockage Local
- Profils sauvegardés en JSON
- Équipes sauvegardées en JSON
- Persiste entre les redémarrages

### Format Stylisé
- Emojis modérés 🎮🔥
- Formatage clair et lisible
- Réponses structurées

---

## 📊 Données Incluses

### 8 Héros Détaillés
- Aamon, Ling, Gusion, Chou
- Fanny, Kagura, Lancelot, Esmeralda

Chaque héros contient:
- Rôle et spécialité
- Difficulté
- 4 compétences
- Forces et faiblesses

### 5 Builds Complètes
- Chaque build = 6 items ordonnés
- Avantages et inconvénients
- Adaptées par type

### Counters pour 4 Héros
- Chaque counter avec raison
- Stratégies d'adaptation
- Banning intelligents

### Combos pour 3 Héros
- Séquences détaillées
- Niveau de difficulté
- Dégâts estimés

### 5 Guides de Lane
- Gold, Mid, EXP, Roam, Carry
- Objectifs par phase
- Timeline early/mid/late

### Meta Tier List
- S/A/B tiers
- Tendances par lane
- Notes importantes

---

## 🚀 Prochaines Améliorations

- [ ] Ajouter plus de héros (50+)
- [ ] Système de statistiques personnelles
- [ ] Ranking intra-groupe
- [ ] Système d'achievements
- [ ] Historique de matchs
- [ ] Calcul de winrate
- [ ] Suggestions de ban/pick
- [ ] Tournois internes

---

## 💬 Support

**Problèmes?**
- Commande non reconnue → Vérifier le nom exact
- Profil non trouvé → Utiliser `!mlbb set <rang> <role>` d'abord
- Équipe inexistante → Créer avec `!team create <nom>`

**Questions?**
- Consulter le README dans `/src/commands/mlbb/README.md`
- Utiliser `!mlbb` pour le guide complet

---

## 🎮 DOMINEZ AVEC TETSUBOT! 🔥

*Le système MLBB complet pour les groupes WhatsApp*
