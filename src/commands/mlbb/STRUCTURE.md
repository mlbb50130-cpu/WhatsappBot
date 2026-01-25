# 📁 Structure Isolée des Commandes MLBB

## 🎯 Architecture Complètement Isolée

Les commandes MLBB sont **complètement isolées** dans le dossier dédié `src/commands/mlbb/`

### 📂 Arborescence

```
src/commands/mlbb/
├── index.js              ✅ Point d'entrée principal (!mlbb)
├── mlbb.js               ✅ Wrapper/alias vers index.js
├── handler.js            ✅ Routeur pour sous-commandes
├── mlbb-profile.js       ✅ Gestion des profils utilisateur
├── hero.js               ✅ Info sur les héros
├── build.js              ✅ Builds recommandées par héro
├── counter.js            ✅ Matchups efficaces
├── combo.js              ✅ Combos de combo défensives
├── meta.js               ✅ Meta actuelle du jeu
├── lane.js               ✅ Guides par lane
├── team.js               ✅ Gestion des équipes
├── tip.js                ✅ Conseils aléatoires
├── config.js             ✅ Configuration MLBB
├── README.md             ✅ Documentation complète
└── STRUCTURE.md          📄 Ce fichier

src/models/
└── MLBBProfile.js        ✅ Modèle pour profils/équipes (JSON)

src/data/
├── mlbb.json             ✅ Base de données héros (45+ héros)
└── mlbbDatabase.js       ✅ Données structurées
```

### 🔌 Intégration Système

**Chargement automatique:** Le `handler.js` charge les commandes récursivement
```javascript
loadDir(commandsPath); // Charge mlbb/ automatiquement
```

**Module Manager:** Les commandes MLBB sont contrôlées via le module `mlbb`
```javascript
ModuleManager.isCommandAllowed(groupJid, 'hero') // Vérifie si MLBB est activé
```

### 🚫 Données Isolées

- **Profils utilisateur:** Stockés dans `mlbb_profiles.json` (JSON local, pas MongoDB)
- **Équipes:** Stockées dans `mlbb_teams.json` (JSON local, pas MongoDB)
- **Base de données:** `mlbb.json` (45+ héros avec stats complètes)
- **Configuration:** `mlbb_config.json` (settings par groupe)

### ✨ Commandes MLBB

Toutes isolées dans `src/commands/mlbb/`:

| Commande | Fichier | Fonction |
|----------|---------|----------|
| `!mlbb set` | mlbb-profile.js | Enregistrer profil |
| `!mlbb me` | mlbb-profile.js | Afficher profil |
| `!hero <nom>` | hero.js | Info héros |
| `!build <nom>` | build.js | Builds recommandées |
| `!counter <nom>` | counter.js | Matchups |
| `!combo <nom>` | combo.js | Combos |
| `!meta` | meta.js | Meta actuelle |
| `!lane <nom>` | lane.js | Guide par lane |
| `!team` | team.js | Gestion équipes |
| `!tip` | tip.js | Conseil aléatoire |

### 🔐 Contrôle d'Accès

Module `mlbb`:
- **Activé par défaut:** ❌ Désactivé
- **Contrôle:** Admin seulement via `!setmodule on mlbb`
- **Stockage:** `group_modules.json`

### 🔄 Zéro Dépendances Externes

✅ Pas d'API externe  
✅ Données locales (JSON)  
✅ Modèle JSON pour profils  
✅ Complètement indépendant des autres modules  

---

**Dernière mise à jour:** 25 Janvier 2026  
**Status:** ✅ Complètement isolé et fonctionnel
