# 🎮 Système MLBB pour TetsuBot

Système complet de commandes **Mobile Legends: Bang Bang** pour un bot WhatsApp avec Baileys.

---

## 📋 Table des matières

- [Installation](#installation)
- [Commandes](#commandes)
- [Architecture](#architecture)
- [Système de Profils](#système-de-profils)
- [Système d'Équipes](#système-déquipes)
- [Données Disponibles](#données-disponibles)

---

## 🚀 Installation

### 1. Structure des fichiers

Les fichiers MLBB sont organisés dans:

```
src/
├── commands/mlbb/          # Toutes les commandes MLBB
│   ├── mlbb.js             # Commande principale
│   ├── mlbb-profile.js     # Gestion profil (!mlbb set/me)
│   ├── hero.js             # Info héros
│   ├── build.js            # Builds recommandées
│   ├── counter.js          # Counters efficaces
│   ├── combo.js            # Combos optimaux
│   ├── meta.js             # Meta actuelle
│   ├── lane.js             # Guides par lane
│   ├── team.js             # Gestion équipes
│   ├── tip.js              # Conseils aléatoires
│   └── handler.js          # Router sous-commandes
├── models/
│   └── MLBBProfile.js      # Gestion BDD profils/équipes
└── data/
    └── mlbbDatabase.js     # Données héros/builds/counters
```

### 2. Prérequis

- Node.js 14+
- TetsuBot configuré
- Module `CooldownManager` existant

### 3. Activation automatique

Les commandes sont chargées **automatiquement** par le handler de TetsuBot grâce au système de chargement dynamique.

---

## 📖 Commandes

### 1. Guide Principal

```
!mlbb
```

Affiche le menu complet avec toutes les commandes disponibles.

### 2. Gestion du Profil

```
!mlbb set <rang> <rôle>
```

Enregistre ton profil de joueur.

**Rangs disponibles:**
- Warrior, Elite, Master, Grandmaster, Epic, Legend, Mythic, Mythic Honor

**Rôles disponibles:**
- Assassin, Fighter, Mage, Marksman, Tank, Support

**Exemple:**
```
!mlbb set mythic assassin
```

```
!mlbb me
```

Affiche ton profil enregistré avec date et recommandations.

```
!mlbb reset
```

Supprime ton profil MLBB.

### 3. Information Héros

```
!hero <nom>
```

Affiche les infos complètes d'un héros:
- Rôle et spécialité
- Difficulté
- Compétences détaillées
- Forces et faiblesses
- Recommendations

**Héros disponibles:**
- `aamon`, `ling`, `gusion`, `chou`, `fanny`, `kagura`, `lancelot`, `esmeralda`

**Exemple:**
```
!hero gusion
```

### 4. Builds Recommandées

```
!build <type>
```

Affiche une build complète avec items ordonnés.

**Types de build:**
- `assassin_burst` - Dégâts massifs
- `assassin_sustain` - Durabilité + sustain
- `fighter_tank` - Tank offensif
- `mage_burst` - Dégâts magiques
- `tank_support` - Full support

**Exemple:**
```
!build assassin_burst
```

### 5. Counters Efficaces

```
!counter <héros>
```

Affiche les héros qui counter efficacement.

**Exemple:**
```
!counter ling
```

Résultat:
- Khufra (raison: anti-mobilité)
- Jawhead (raison: interruption)
- Etc.

### 6. Combos Optimaux

```
!combo <héros>
```

Montre les combos de dégâts pour maximiser la sortie.

**Exemple:**
```
!combo gusion
```

Contient:
- Combo full burst
- Quick kill combo
- Chase combo
- Difficulté de chaque

### 7. Meta Actuelle

```
!meta
```

Affiche la **tier list** actuelle et tendances par lane.

- **S-Tier:** Heroes overpowered
- **A-Tier:** Très bons
- **B-Tier:** Viables
- Tendances par: Gold, Mid, EXP, Roam, Carry

### 8. Guides par Lane

```
!lane <role>
```

Guide complet pour chaque position:
- Champions recommandés
- Objectifs principaux
- Conseils stratégiques
- Timeline early/mid/late

**Roles disponibles:**
- `gold` - Gold Lane
- `mid` - Mid Lane
- `exp` - EXP Lane (Jungle)
- `roam` - Support Roaming
- `carry` - ADC equivalent

**Exemple:**
```
!lane mid
```

### 9. Conseils Aléatoires

```
!tip
```

Conseil MLBB aléatoire pour améliorer ton jeu. 20+ conseils différents.

### 10. Gestion d'Équipes

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

Quitte ton équipe actuelle.

```
!team list
```

Affiche toutes les équipes créées avec:
- Nom
- Capitaine
- Nombre de membres
- Date de création

```
!team info
```

Affiche les infos de ta team:
- Roster complet
- Roles
- Capitaine

```
!team disband
```

Dissout l'équipe (capitaine uniquement).

---

## 🏗️ Architecture

### Structure de Données

#### 1. Profils Joueurs (`src/data/mlbb/profiles.json`)

```json
{
  "jid_utilisateur": {
    "username": "NomJoueur",
    "rank": "Legend",
    "role": "Assassin",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
}
```

#### 2. Équipes (`src/data/mlbb/teams.json`)

```json
{
  "team_1234567890": {
    "id": "team_1234567890",
    "name": "Shadow Assassins",
    "creator": "jid_capitaine",
    "creatorName": "Captain",
    "members": [
      {
        "jid": "jid_joueur1",
        "name": "Joueur1",
        "role": "Captain"
      },
      {
        "jid": "jid_joueur2",
        "name": "Joueur2",
        "role": "Member"
      }
    ],
    "createdAt": "2026-01-25T10:00:00.000Z"
  }
}
```

### Modèle MLBBProfile

Le modèle `MLBBProfile.js` gère:
- Lecture/Écriture de profils
- Création/Suppression d'équipes
- Ajout/Retrait de membres
- Stockage en JSON local

### Cooldown Manager

Chaque commande a un cooldown pour éviter le spam:
- `!mlbb` - 5 secondes
- `!hero`, `!build`, `!counter`, `!combo` - 3 secondes
- `!lane`, `!tip` - 3 secondes
- `!meta` - 5 secondes
- `!team` - 2 secondes

---

## 💾 Système de Profils

### Avantages

✅ **Stockage Local:**
- Pas d'API externe
- Données persistantes
- Rapidité

✅ **Flexibilité:**
- Facile de modifier rangs/rôles
- Suppression simple
- Mise à jour tracking

### Usage

**Enregistrement:**

```
!mlbb set legend fighter
```

**Consultation:**

```
!mlbb me
```

Affiche profil + recommendations personnalisées.

---

## 👥 Système d'Équipes

### Fonctionnalités

✅ **Création d'équipes:**
- Créateur = Capitaine
- Nom personnalisé

✅ **Gestion de roster:**
- Rejoindre équipes
- Quitter équipes
- Voir tous les membres
- Dissoudre (Captain only)

✅ **Système flexible:**
- Pas de limite de membres
- Pas de système de tier/rank
- Basé sur volontariat

### Workflow Équipes

```
1. Capitaine: !team create Shadow Assassins
2. Joueur1: !team join Shadow Assassins
3. Joueur2: !team join Shadow Assassins
4. Leader: !team info (vérifier roster)
5. Fin de saison: !team disband
```

---

## 📊 Données Disponibles

### Héros (8 héros)

| Nom | Rôle | Spécialité | Difficulté |
|-----|------|-----------|-----------|
| Aamon | Assassin | Burst/Chase | Medium |
| Ling | Assassin | Mobility | Hard |
| Gusion | Assassin | Burst | Hard |
| Chou | Fighter | Control | High |
| Fanny | Assassin | Mobility | Very Hard |
| Kagura | Mage | Control | Very Hard |
| Lancelot | Assassin | Burst | High |
| Esmeralda | Tank/Fighter | Defense | Medium |

### Builds (5 types)

- `assassin_burst` - Max dégâts
- `assassin_sustain` - Durable
- `fighter_tank` - Offensif
- `mage_burst` - Magic
- `tank_support` - Support

### Lanes (5 positions)

- **Gold** - Fighter/Mage hybrid
- **Mid** - Burst magic
- **EXP** - Assassin/Jungler
- **Roam** - Support
- **Carry** - ADC equivalent

---

## 🔧 Customisation

### Ajouter un Héros

Édite `src/data/mlbbDatabase.js`:

```javascript
heroes: {
  newhero: {
    name: 'NewHero',
    role: 'Mage',
    specialty: 'Control/Burst',
    difficulty: 'Hard',
    skills: {
      passive: 'Description',
      skill1: 'Description',
      skill2: 'Description',
      ultimate: 'Description'
    },
    weakness: ['Weakness1', 'Weakness2'],
    strength: ['Strength1', 'Strength2']
  }
}
```

### Ajouter une Build

```javascript
builds: {
  mage_sustain: {
    name: 'Sustain Mage Build',
    items: ['Item1', 'Item2', ...],
    advantages: ['Advantage1'],
    disadvantages: ['Disadvantage1']
  }
}
```

### Ajouter un Counter

```javascript
counters: {
  newhero: {
    hero: 'NewHero',
    counters: [
      { name: 'CounterHero', reason: 'Why it counters' }
    ]
  }
}
```

---

## 📱 Utilisation en Groupe WhatsApp

Tous les exemples supposent un groupe WhatsApp:

```
[10:30] User1: !mlbb set mythic assassin
[10:31] TetsuBot: ✅ Profil mis à jour!
        👤 Joueur: User1
        🎖️ Rang: Mythic
        🎯 Rôle: Assassin

[10:32] User1: !hero gusion
[10:33] TetsuBot: [Infos complètes]

[10:35] User2: !team create Shadow Assassins
[10:36] User3: !team join Shadow Assassins
[10:37] User2: !team info
[10:38] TetsuBot: [Roster complet]
```

---

## 🎯 Cas d'usage

1. **Nouvelle équipe?** → `!team create <nom>`
2. **Quel héros jouer?** → `!meta` → `!lane <role>`
3. **Counters de l'ennemi?** → `!counter <héros>`
4. **Comment jouer?** → `!combo <héros>`
5. **Build optimale?** → `!build <type>`
6. **Conseil du jour?** → `!tip`

---

## ⚙️ Configuration

### Cooldowns (modifiables)

Édite les fichiers de commandes pour ajuster:

```javascript
const cooldown = new CooldownManager(5000); // 5 secondes
```

### Répertoire de stockage

Les fichiers JSON sont stockés dans:

```
src/data/mlbb/
├── profiles.json
└── teams.json
```

---

## 🐛 Troubleshooting

**Erreur "Cette commande fonctionne uniquement en groupe"**
→ Utilise la commande en groupe WhatsApp, pas en DM

**Profil non trouvé**
→ Enregistre d'abord: `!mlbb set <rang> <role>`

**Équipe non trouvée**
→ Crée d'abord: `!team create <nom>`

**Cooldown limité**
→ Patiente quelques secondes avant réutilisation

---

## 📝 Checklist Fonctionnalités

- [x] Commandes principales (mlbb, hero, build, etc.)
- [x] Système de profils
- [x] Système d'équipes
- [x] Cooldown manager
- [x] Base de données locale (JSON)
- [x] Validation des rangs/rôles
- [x] Messages stylisés
- [x] Gestion d'erreurs
- [x] Documentation complète

---

## 🚀 Améliorations Futures

- [ ] Système de statistiques personnelles
- [ ] Ranking intra-groupe
- [ ] Système d'achievements
- [ ] Intégration avec l'API MLBB (si disponible)
- [ ] Tournois internes
- [ ] Historique de matchs
- [ ] Calcul de winrate
- [ ] Ban/Pick suggestions

---

## 📄 License

Système créé pour TetsuBot WhatsApp.

---

## 👨‍💻 Support

Toutes les commandes requièrent:
- **Environnement:** Groupe WhatsApp
- **Format:** `!<commande> <arguments>`
- **Cooldown:** Respecte les cooldowns entre utilisations

Prêt à dominer en MLBB? 🎮🔥
