# 📚 Documentation des Modèles Mongoose

## 👤 Modèle User

Représente un utilisateur du bot avec son profil RPG.

### Schéma

```javascript
{
  jid: String,                    // ID WhatsApp unique (indexed)
  username: String,               // Nom d'utilisateur
  
  // Système de progression
  xp: Number,                     // Experience points
  level: Number,                  // Niveau (1-999)
  rank: String,                   // Rang actuel (Genin, Chuunin, etc)
  title: String,                  // Titre personnalisé
  
  // Achievements
  badges: [{
    name: String,                 // Nom du badge
    emoji: String,                // Emoji du badge
    unlockedAt: Date              // Date obtention
  }],
  
  // Timing
  lastXpTime: Date,               // Dernière fois gagné XP
  
  // Inventaire
  inventory: [{
    itemId: String,               // ID unique de l'objet
    name: String,                 // Nom de l'objet
    quantity: Number,             // Quantité
    rarity: String,               // common, rare, epic, legendary
    addedAt: Date                 // Date d'ajout
  }],
  
  // Statistiques
  stats: {
    messages: Number,             // Messages envoyés
    quiz: Number,                 // Quiz complétés
    wins: Number,                 // Victoires en duel
    losses: Number,               // Défaites en duel
    duels: Number                 // Total duels
  },
  
  // Modération
  warnings: Number,               // Avertissements (0-3)
  isBanned: Boolean,              // Banni?
  isMuted: Boolean,               // Mute?
  mutedUntil: Date,               // Jusqu'à quand mute?
  
  // Métadonnées
  createdAt: Date,                // Date création
  updatedAt: Date                 // Dernière modification
}
```

### Méthodes Utiles

```javascript
// Récupérer un utilisateur
const user = await User.findOne({ jid: '120363...' });

// Créer un nouvel utilisateur
const newUser = new User({
  jid: '120363...',
  username: 'Shayne'
});
await newUser.save();

// Mettre à jour XP
user.xp += 50;
await user.save();

// Récupérer les top users par niveau
const topUsers = await User.find({})
  .sort({ level: -1, xp: -1 })
  .limit(10);

// Récupérer les top users par victoires
const topWinners = await User.find({})
  .sort({ 'stats.wins': -1 })
  .limit(10);

// Compter les utilisateurs
const count = await User.countDocuments();

// Banning un utilisateur
user.isBanned = true;
await user.save();

// Vérifier si banni
if (user.isBanned) { /* ... */ }
```

---

## 📦 Modèle Inventory

Gère l'inventaire détaillé d'un utilisateur.

### Schéma

```javascript
{
  userId: ObjectId,               // Référence User (indexed)
  
  items: [{
    itemId: String,               // ID unique
    name: String,                 // Nom
    description: String,          // Description
    rarity: String,               // Rareté
    type: String,                 // weapon, armor, accessory, consumable
    stats: {
      attack: Number,             // Dégâts
      defense: Number,            // Défense
      hp: Number                  // Santé
    },
    quantity: Number,             // Quantité
    equipped: Boolean,            // Équipé?
    addedAt: Date                 // Date ajout
  }],
  
  // Équipement actif
  slots: {
    weapon: {
      itemId: String,
      name: String
    },
    armor: {
      itemId: String,
      name: String
    },
    accessory: {
      itemId: String,
      name: String
    }
  },
  
  // Monnaies
  currency: {
    gold: Number,                 // Or
    diamonds: Number              // Diamants
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Exemple d'Utilisation

```javascript
// Récupérer inventaire
const inventory = await Inventory.findOne({ userId: user._id });

// Ajouter un objet
inventory.items.push({
  itemId: 'waifu_123',
  name: 'Figurine Waifu',
  rarity: 'legendary',
  quantity: 1
});
await inventory.save();

// Équiper une arme
const weapon = inventory.items.find(i => i.name === 'Katana');
weapon.equipped = true;
inventory.slots.weapon = { itemId: weapon.itemId, name: weapon.name };
await inventory.save();

// Ajouter de l'or
inventory.currency.gold += 100;
await inventory.save();
```

---

## 🎯 Modèle Quest

Représente les quêtes du jeu.

### Schéma

```javascript
{
  questId: String,                // ID unique (indexed)
  title: String,                  // Titre
  description: String,            // Description
  
  type: String,                   // daily, weekly, quest
  difficulty: String,             // easy, medium, hard
  
  requirements: {
    minLevel: Number,             // Niveau minimum
    minXp: Number                 // XP minimum
  },
  
  objectives: [{
    objectiveId: String,
    description: String,
    target: Number,               // Nombre à atteindre
    current: Number               // Progrès actuel
  }],
  
  rewards: {
    xp: Number,                   // XP reward
    gold: Number,                 // Gold reward
    diamonds: Number,             // Diamonds reward
    items: [String]               // Item IDs
  },
  
  isActive: Boolean,              // Active?
  createdAt: Date
}
```

### Exemple

```javascript
// Créer une quête quotidienne
const dailyQuest = new Quest({
  questId: 'daily_001',
  title: 'Tue 10 monstres',
  type: 'daily',
  difficulty: 'easy',
  objectives: [{
    objectiveId: 'kill_10',
    description: 'Tue 10 monstres',
    target: 10,
    current: 0
  }],
  rewards: {
    xp: 50,
    gold: 100
  }
});
await dailyQuest.save();

// Récupérer les quêtes actives
const activeQuests = await Quest.find({ isActive: true });
```

---

## ⚠️ Modèle Warn

Gère les avertissements des utilisateurs.

### Schéma

```javascript
{
  userId: String,                 // JID utilisateur (indexed)
  groupId: String,                // JID groupe (indexed)
  
  reason: String,                 // Raison de l'avertissement
  moderator: String,              // JID du modérateur
  
  severity: String,               // low, medium, high
  expired: Boolean,               // Expiré?
  expiresAt: Date,                // Quand expire
  
  createdAt: Date                 // Date création (TTL: 30 jours)
}
```

### Exemple

```javascript
// Créer un avertissement
const warn = new Warn({
  userId: '120363...',
  groupId: '120363...@g.us',
  reason: 'Spam de messages',
  moderator: '120363...',
  severity: 'medium',
  expiresAt: new Date(Date.now() + 30*24*60*60*1000) // 30 jours
});
await warn.save();

// Récupérer les avertissements d'un utilisateur
const warns = await Warn.find({ userId: jid, expired: false });
const warnCount = warns.length;

if (warnCount >= 3) {
  // Ban!
}
```

---

## 🔗 Relations Entre Modèles

```
User
  ├─ jid (unique)
  ├─ username
  ├─ inventory[]
  └─ stats

    ↓ (1-to-1 virtuel)

Inventory
  ├─ userId (ref User)
  ├─ items[]
  └─ currency

    ↓ (1-to-many)

Quest
  ├─ questId (unique)
  ├─ objectives[]
  └─ rewards

    ↓ (1-to-many)

Warn
  ├─ userId
  ├─ groupId
  └─ moderator
```

---

## 📊 Requêtes Courantes

### User

```javascript
// Récupérer par JID
User.findOne({ jid: '120363...' })

// Top 10 par niveau
User.find({}).sort({ level: -1 }).limit(10)

// Tous les utilisateurs bannies
User.find({ isBanned: true })

// Compter les utilisateurs
User.countDocuments()

// Mettre à jour plusieurs users
User.updateMany({ level: { $lt: 5 } }, { $set: { rank: 'Genin' } })

// Supprimer les utilisateurs inactifs
User.deleteMany({ 
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

### Warn

```javascript
// Avertissements actifs d'un utilisateur
Warn.find({ userId: jid, expired: false })

// Avertissements dans un groupe
Warn.find({ groupId: groupJid })

// Les plus graves avertissements
Warn.find({ severity: 'high' })

// Nettoyer les anciens avertissements
Warn.deleteMany({ 
  createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})
```

---

## 💾 Sauvegarde & Validation

```javascript
// Sauvegarder
await user.save();

// Valider avant de sauvegarder
try {
  await user.save();
} catch (error) {
  console.error('Erreur validation:', error.message);
}

// Mettre à jour directement
await User.findByIdAndUpdate(id, { xp: 500 }, { new: true });
```

---

## 🔍 Indexes Disponibles

```javascript
User:
  - jid (unique)
  - level, xp (compound)
  - createdAt

Inventory:
  - userId (indexed)

Quest:
  - questId (unique)

Warn:
  - userId (indexed)
  - groupId (indexed)
  - createdAt (TTL: 2592000s)
```

---

## 🚀 Bonnes Pratiques

1. **Toujours vérifier l'existence** avant d'utiliser un document
2. **Utiliser try/catch** pour les opérations DB
3. **Indexer** les champs fréquemment recherchés
4. **Valider** les données avant d'insérer
5. **Ne pas modifier** directement sans sauvegarder
6. **Utiliser des transactions** pour les opérations critiques
7. **Nettoyer** les vieilles données régulièrement

---

## ⚡ Performance

```javascript
// ❌ Mauvais
for (let user of users) {
  await user.save();
}

// ✅ Bon
await User.bulkWrite([
  { updateOne: { ... } },
  { updateOne: { ... } }
]);

// ❌ Mauvais
const users = await User.find({});
const topUsers = users.sort((a,b) => b.level - a.level).slice(0, 10);

// ✅ Bon
const topUsers = await User.find({}).sort({ level: -1 }).limit(10);
```
