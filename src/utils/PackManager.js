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
}

module.exports = PackManager;
