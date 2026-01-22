// 🔍 VÉRIFICATION COMPLÈTE DE LA CONFIGURATION POUR GROUPES WHATSAPP

const fs = require('fs');
const path = require('path');

class ConfigVerification {
  /**
   * Vérifie tous les fichiers de configuration essentiels
   */
  static async verifyAllConfigs() {
    console.log('🔍 Vérification de la configuration complète...\n');

    const checks = {
      '.env': this.checkEnvFile(),
      'package.json': this.checkPackageJson(),
      'src/config.js': this.checkConfigFile(),
      'src/index.js': this.checkIndexFile(),
      'src/database.js': this.checkDatabaseFile(),
      'src/handler.js': this.checkHandlerFile(),
      'Models': this.checkModels(),
      'Commands': this.checkCommands(),
      'Utils': this.checkUtils(),
      'Directories': this.checkDirectories()
    };

    let passed = 0;
    let failed = 0;

    for (const [name, result] of Object.entries(checks)) {
      if (result.status === 'OK') {
        console.log(`✅ ${name}: ${result.message}`);
        passed++;
      } else if (result.status === 'WARNING') {
        console.log(`⚠️  ${name}: ${result.message}`);
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Résultats: ${passed} OK, ${failed} Erreurs\n`);

    if (failed === 0) {
      console.log('🎉 Configuration parfaite pour fonctionner dans un groupe WhatsApp!\n');
      return true;
    } else {
      console.log('⚠️  Des corrections sont nécessaires avant déploiement\n');
      return false;
    }
  }

  static checkEnvFile() {
    try {
      if (!fs.existsSync('.env')) {
        return {
          status: 'ERROR',
          message: 'Fichier .env manquant'
        };
      }

      const envContent = fs.readFileSync('.env', 'utf8');
      const required = ['PHONE_NUMBER', 'MONGODB_URI', 'PREFIX'];
      const missing = required.filter(key => !envContent.includes(key));

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Variables manquantes: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: 'Toutes les variables requises présentes'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkPackageJson() {
    try {
      const pkg = require('./package.json');
      const required = [
        '@whiskeysockets/baileys',
        'mongoose',
        'dotenv',
        'axios'
      ];

      const missing = required.filter(dep => !pkg.dependencies[dep]);

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Dépendances manquantes: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: `Toutes les dépendances présentes (${Object.keys(pkg.dependencies).length})`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkConfigFile() {
    try {
      if (!fs.existsSync('src/config.js')) {
        return {
          status: 'ERROR',
          message: 'Fichier manquant'
        };
      }

      const config = require('./src/config.js');
      const required = ['PREFIX', 'MONGODB_URI', 'COLORS'];

      const missing = required.filter(key => !config[key]);

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Propriétés manquantes: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: 'Configuration valide'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkIndexFile() {
    try {
      if (!fs.existsSync('src/index.js')) {
        return {
          status: 'ERROR',
          message: 'Fichier manquant'
        };
      }

      const content = fs.readFileSync('src/index.js', 'utf8');
      const required = ['makeWASocket', 'useMultiFileAuthState', 'handleMessage', 'connectDatabase'];

      const missing = required.filter(item => !content.includes(item));

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Imports manquants: ${missing.join(', ')}`
        };
      }

      // Vérifier la gestion des groupes
      if (!content.includes('isGroup') || !content.includes('groupData')) {
        return {
          status: 'WARNING',
          message: 'Support des groupes peut être incomplet'
        };
      }

      return {
        status: 'OK',
        message: 'Support des groupes configuré'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkDatabaseFile() {
    try {
      if (!fs.existsSync('src/database.js')) {
        return {
          status: 'ERROR',
          message: 'Fichier manquant'
        };
      }

      const content = fs.readFileSync('src/database.js', 'utf8');
      if (!content.includes('mongoose') || !content.includes('connect')) {
        return {
          status: 'ERROR',
          message: 'Configuration MongoDB incomplète'
        };
      }

      return {
        status: 'OK',
        message: 'MongoDB correctement configuré'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkHandlerFile() {
    try {
      if (!fs.existsSync('src/handler.js')) {
        return {
          status: 'ERROR',
          message: 'Fichier manquant'
        };
      }

      const content = fs.readFileSync('src/handler.js', 'utf8');
      const required = ['loadCommands', 'handleMessage', 'getOrCreateUser'];

      const missing = required.filter(item => !content.includes(item));

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Fonctions manquantes: ${missing.join(', ')}`
        };
      }

      // Vérifier la gestion des permissions
      if (!content.includes('PermissionManager')) {
        return {
          status: 'WARNING',
          message: 'Permissions non vérifiées'
        };
      }

      return {
        status: 'OK',
        message: 'Handler complet avec permissions'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkModels() {
    try {
      const models = ['User.js', 'Inventory.js', 'Quest.js', 'Warn.js'];
      const modelsPath = 'src/models';

      if (!fs.existsSync(modelsPath)) {
        return {
          status: 'ERROR',
          message: 'Dossier models manquant'
        };
      }

      const missing = models.filter(model => !fs.existsSync(path.join(modelsPath, model)));

      if (missing.length > 0) {
        return {
          status: 'ERROR',
          message: `Modèles manquants: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: `Tous les modèles présents (${models.length})`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkCommands() {
    try {
      const commandsPath = 'src/commands';

      if (!fs.existsSync(commandsPath)) {
        return {
          status: 'ERROR',
          message: 'Dossier commands manquant'
        };
      }

      const files = this.countFiles(commandsPath);

      if (files === 0) {
        return {
          status: 'ERROR',
          message: 'Aucune commande trouvée'
        };
      }

      return {
        status: 'OK',
        message: `${files} commandes trouvées`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkUtils() {
    try {
      const utils = [
        'xpSystem.js',
        'cooldown.js',
        'permissions.js',
        'random.js',
        'antiSpam.js',
        'antiLink.js'
      ];
      const utilsPath = 'src/utils';

      if (!fs.existsSync(utilsPath)) {
        return {
          status: 'ERROR',
          message: 'Dossier utils manquant'
        };
      }

      const missing = utils.filter(util => !fs.existsSync(path.join(utilsPath, util)));

      if (missing.length > 0) {
        return {
          status: 'WARNING',
          message: `Utilitaires optionnels manquants: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: `Tous les utilitaires présents (${utils.length})`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static checkDirectories() {
    try {
      const required = ['sessions', 'logs', 'backups'];
      const missing = required.filter(dir => !fs.existsSync(dir));

      if (missing.length > 0) {
        missing.forEach(dir => {
          fs.mkdirSync(dir, { recursive: true });
        });
        return {
          status: 'WARNING',
          message: `Répertoires créés: ${missing.join(', ')}`
        };
      }

      return {
        status: 'OK',
        message: 'Tous les répertoires requis existent'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Erreur: ${error.message}`
      };
    }
  }

  static countFiles(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        count += this.countFiles(filePath);
      } else if (file.endsWith('.js')) {
        count++;
      }
    }

    return count;
  }
}

// Export pour utilisation
module.exports = ConfigVerification;

// Lancer si appelé directement
if (require.main === module) {
  ConfigVerification.verifyAllConfigs();
}
