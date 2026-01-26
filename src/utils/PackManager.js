// Gestionnaire de packs de commandes
const ModuleManager = require('./ModuleManager');

class PackManager {
  static PACKS = {
    otaku: {
      name: '📺 RPG OTAKU',
      description: 'Commandes Anime, RPG, Quêtes, Aventures',
      emoji: '🎌',
      modules: {
        anime: true,
        fun: true,
        xp: true,
        items: true,
        quete: true,
        nsfw: false,
        mlbb: false
      }
    },
    gamin: {
      name: '🎮 MLBB GAMIN',
      description: 'Commandes Mobile Legends Bang Bang',
      emoji: '🎯',
      modules: {
        mlbb: true,
        anime: false,
        fun: false,
        xp: false,
        items: false,
        quete: false,
        nsfw: false
      }
    },
    complet: {
      name: '🌟 COMPLET',
      description: 'Tous les modules activés (Otaku + MLBB)',
      emoji: '⭐',
      modules: {
        mlbb: true,
        anime: true,
        fun: true,
        xp: true,
        items: true,
        quete: true,
        nsfw: false
      }
    },
    custom: {
      name: '⚙️ PERSONNALISÉ',
      description: 'Configurer chaque module individuellement',
      emoji: '🔧',
      modules: null // À configurer
    }
  };

  static getPacks() {
    return Object.entries(this.PACKS).map(([key, pack]) => ({
      id: key,
      ...pack
    }));
  }

  static getPackMessage() {
    const packs = this.getPacks();
    let message = `
╔═══════════════════════════════════╗
║   🎯 CHOISIR UN PACK DE COMMANDES ║
╚═══════════════════════════════════╝

Quel type de commandes voulez-vous?

`;

    packs.forEach((pack, i) => {
      message += `${i + 1}. ${pack.emoji} *${pack.name}*\n   ${pack.description}\n\n`;
    });

    message += `_Réponds par le numéro (ex: 1, 2, 3, ou 4)_\n\n`;
    message += `💡 *Exemple:* \`1\` pour RPG OTAKU`;

    return message;
  }

  static applyPack(packId, groupJid) {
    const pack = this.PACKS[packId.toLowerCase()];
    
    if (!pack || !pack.modules) {
      return null;
    }

    ModuleManager.setGroupModules(groupJid, pack.modules);
    return pack;
  }

  static getPackNameById(packId) {
    const pack = this.PACKS[packId.toLowerCase()];
    return pack ? pack.name : null;
  }

  static getPackDocumentation(packId) {
    const pack = this.PACKS[packId.toLowerCase()];
    
    if (!pack) return null;

    const docs = {
      otaku: `
╔═══════════════════════════════════╗
║    📺 RPG OTAKU - DOCUMENTATION   ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

📚 *MODULES ACTIVÉS:*
• 🎌 Anime - Personnages, waifus, husbandos
• 🎲 Fun - Jeux amusants, quiz, duels
• ⭐ XP - Système de niveaux et classement
• 📦 Items - Inventaire et équipement
• 📜 Quêtes - Aventures quotidiennes

🎮 *COMMANDES PRINCIPALES:*
!xp - Voir ton XP et niveau
!quete - Quêtes disponibles
!personnage - Infos sur un personnage
!duel @user - Défier quelqu'un
!inventaire - Voir ton inventaire

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      gamin: `
╔═══════════════════════════════════╗
║  🎮 MLBB GAMIN - DOCUMENTATION    ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

🎮 *MODULES ACTIVÉS:*
• 🎯 MLBB - Mobile Legends Bang Bang

📚 *COMMANDES PRINCIPALES:*
!hero <nom> - Info sur un héros
!build <nom> - Builds recommandées
!counter <nom> - Counters efficaces
!combo <nom> - Combos optimaux
!meta - État du meta actuel
!lane <nom> - Guide par lane
!team <nom> - Gestion équipes

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      complet: `
╔═══════════════════════════════════╗
║   🌟 COMPLET - DOCUMENTATION      ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

🎮 *TOUS LES MODULES ACTIVÉS:*
• 📺 Anime - Personnages et waifus
• 🎲 Fun - Jeux et divertissements
• ⭐ XP - Système RPG complet
• 📦 Items - Inventaire avancé
• 📜 Quêtes - Aventures quotidiennes
• 🎯 MLBB - Mobile Legends Bang Bang

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``,

      custom: `
╔═══════════════════════════════════╗
║  ⚙️ PERSONNALISÉ - CONFIGURATION   ║
╚═══════════════════════════════════╝

*Pack sélectionné:* ${pack.emoji} *${pack.name}*

Vous pouvez configurer chaque module:
!setmodule on <module>
!setmodule off <module>
!setmodule status

💡 *POUR ACTIVER:*
Seul l'admin peut taper: \`!activatebot\``
    };

    return docs[packId.toLowerCase()] || null;
  }
}

module.exports = PackManager;
