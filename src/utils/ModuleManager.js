const fs = require('fs');
const path = require('path');

const MODULES_PATH = path.join(__dirname, '../data/group_modules.json');

class ModuleManager {
  static MODULES = {
    mlbb: {
      name: 'MLBB',
      description: 'Commandes Mobile Legends: Bang Bang',
      commands: ['mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile', 'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions', 'hero', 'heroe', 'champion', 'build', 'builds', 'items', 'set', 'counter', 'counters', 'beat', 'antiheroe', 'combo', 'combos', 'rotation', 'cc', 'meta', 'metagame', 'tier', 'tierlist', 'lane', 'position', 'role', 'guide', 'team', 'equipe', 'squad', 'crew', 'join', 'j', 'leave', 'l', 'heroes', 'heroslist', 'listheroe', 'herolist', 'heros', 'tip', 'tips', 'conseil', 'conseils'],
      enabled: false
    },
    anime: {
      name: 'Anime',
      description: 'Commandes Anime (personnages, infos)',
      commands: ['anime', 'manga', 'mangadex', 'personnage', 'topanime', 'topmanga', 'animegif', 'husbando', 'waifu', 'madara', 'naruto', 'vegito', 'yoruichi', 'bleach', 'deku', 'gojo', 'gokuui', 'jinwoo', 'livai', 'makima', 'miku', 'mikunakano', 'nino', 'rengokudemon', 'sukuna', 'tengen', 'tsunade', 'yami', 'zerotwo'],
      enabled: true
    },
    fun: {
      name: 'Amusement',
      description: 'Commandes fun et jeux',
      commands: ['pfc', 'roulette', 'duel', 'roast', 'chance', 'quiz', 'quizanime', 'reponse', 'blagueotaku', 'reaction', 'react', 'r', 'ship', 'sticker', 's', 'stick', 'steal', 'take', 'stickercrop', 'scrop', 'smeme', 'stickermeme', 'quote', 'q', 'emojimix', 'surprise', 'truth', 'dare', 'coinflip', 'dice', 'fact', 'viewonce', 'vo', 'vonce', 'revive', 'antiviewonce', 'voiranime', 'anniversaire'],
      enabled: true
    },
    nsfw: {
      name: 'NSFW',
      description: 'Contenu adulte (hentai, etc)',
      commands: ['hentai', 'hentaivd', 'neko', 'boahancook', 'nsfw'],
      enabled: false
    },
    xp: {
      name: 'Système XP',
      description: 'Niveaux, XP, classement',
      commands: ['xp', 'level', 'rank', 'classement', 'leaderboard', 'top', 'stats', 'badges', 'profil', 'profile', 'chakra', 'powerlevel', 'daily', 'gold', 'work', 'vendre', 'sell', 'miner', 'mine', 'acheterchakra', 'rechargechakra', 'buychakra', 'chakraplus'],
      enabled: true
    },
    items: {
      name: 'Inventaire',
      description: 'Loot, équipement, chakra',
      commands: ['loot', 'inventaire', 'equip', 'equipement', 'boutique', 'shop', 'store', 'acheter', 'buy', 'fusion', 'merge', 'fusionner', 'ameliorer', 'upgrade', 'ameliore'],
      enabled: true
    },
    quete: {
      name: 'Quêtes',
      description: 'Quêtes et aventures',
      commands: ['quete', 'nouvellequete', 'quetelundi', 'quotidien', 'hebdo', 'valider'],
      enabled: true
    }
  };

  static loadModules() {
    try {
      if (fs.existsSync(MODULES_PATH)) {
        return JSON.parse(fs.readFileSync(MODULES_PATH, 'utf8'));
      }
    } catch (err) {
    }
    return {};
  }

  static saveModules(modules) {
    try {
      fs.writeFileSync(MODULES_PATH, JSON.stringify(modules, null, 2));
    } catch (err) {
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
    const alwaysAllowed = ['help', 'h', 'ping', 'modules', 'module', 'setmodule', 'menu', 'documentation', 'docs', 'commandes', 'commands', 'info', 'regles', 'whoami', 'activatebot', 'selectpack', 'pack', 'packselect', 'choosepack'];
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
