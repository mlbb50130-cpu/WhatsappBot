const fs = require('fs');
const path = require('path');

const MODULES_PATH = path.join(__dirname, '../data/group_modules.json');

class ModuleManager {
  static MODULES = {
    mlbb: {
      name: 'MLBB',
      description: 'Commandes Mobile Legends: Bang Bang',
      commands: ['mlbb', 'hero', 'build', 'counter', 'combo', 'meta', 'lane', 'team', 'join', 'leave'],
      enabled: false
    },
    anime: {
      name: 'Anime',
      description: 'Commandes Anime (personnages, infos)',
      commands: ['anime', 'mangadex', 'personnage', 'husbando', 'waifu', 'ship', 'topanime', 'topmanga'],
      enabled: true
    },
    fun: {
      name: 'Amusement',
      description: 'Commandes fun et jeux',
      commands: ['pfc', 'roulette', 'duel', 'roast', 'chance', 'quiz', 'quizanime'],
      enabled: true
    },
    nsfw: {
      name: 'NSFW',
      description: 'Contenu adulte (hentai, etc)',
      commands: ['hentai', 'hentaivd', 'neko', 'boahancook'],
      enabled: false
    },
    xp: {
      name: 'Système XP',
      description: 'Niveaux, XP, classement',
      commands: ['xp', 'level', 'rank', 'classement', 'stats'],
      enabled: true
    },
    items: {
      name: 'Inventaire',
      description: 'Loot, équipement, chakra',
      commands: ['loot', 'inventaire', 'equip', 'equipement', 'chakra'],
      enabled: true
    },
    quete: {
      name: 'Quêtes',
      description: 'Quêtes et aventures',
      commands: ['quete', 'quetelundi', 'quotidien', 'hebdo'],
      enabled: true
    }
  };

  static loadModules() {
    try {
      if (fs.existsSync(MODULES_PATH)) {
        return JSON.parse(fs.readFileSync(MODULES_PATH, 'utf8'));
      }
    } catch (err) {
      console.error('Erreur chargement modules:', err);
    }
    return {};
  }

  static saveModules(modules) {
    try {
      fs.writeFileSync(MODULES_PATH, JSON.stringify(modules, null, 2));
    } catch (err) {
      console.error('Erreur sauvegarde modules:', err);
    }
  }

  static getGroupModules(groupJid) {
    const modules = this.loadModules();
    if (!modules[groupJid]) {
      modules[groupJid] = {};
      Object.keys(this.MODULES).forEach(key => {
        modules[groupJid][key] = this.MODULES[key].enabled;
      });
      this.saveModules(modules);
    }
    return modules[groupJid];
  }

  static setGroupModules(groupJid, moduleConfig) {
    const modules = this.loadModules();
    modules[groupJid] = moduleConfig;
    this.saveModules(modules);
  }

  static toggleModule(groupJid, moduleName) {
    const modules = this.loadModules();
    if (!modules[groupJid]) {
      modules[groupJid] = {};
      Object.keys(this.MODULES).forEach(key => {
        modules[groupJid][key] = this.MODULES[key].enabled;
      });
    }

    if (this.MODULES[moduleName]) {
      modules[groupJid][moduleName] = !modules[groupJid][moduleName];
      this.saveModules(modules);
      return modules[groupJid][moduleName];
    }
    return null;
  }

  static isCommandAllowed(groupJid, commandName) {
    const groupModules = this.getGroupModules(groupJid);

    for (const [moduleName, moduleData] of Object.entries(this.MODULES)) {
      if (moduleData.commands.includes(commandName)) {
        return groupModules[moduleName] !== false;
      }
    }
    
    // Commandes par défaut toujours autorisées
    const alwaysAllowed = ['help', 'ping', 'setmodule', 'modules', 'menu'];
    return alwaysAllowed.includes(commandName);
  }

  static getGroupStatus(groupJid) {
    const groupModules = this.getGroupModules(groupJid);
    const status = {};

    for (const [moduleName, moduleData] of Object.entries(this.MODULES)) {
      status[moduleName] = {
        name: moduleData.name,
        enabled: groupModules[moduleName] !== false,
        commands: moduleData.commands
      };
    }

    return status;
  }
}

module.exports = ModuleManager;
