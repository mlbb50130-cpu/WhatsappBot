#!/usr/bin/env node

// 🎯 CHECKLIST INTERACTIVE - VÉRIFICATION FINALE

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.clear();
console.log(`${CYAN}╔════════════════════════════════════════════════════╗${RESET}`);
console.log(`${CYAN}║  ${BLUE}🎯 CHECKLIST FINALE - TetsuBot Configuration${CYAN}     ║${RESET}`);
console.log(`${CYAN}║  ${BLUE}Préparez votre Bot pour les Groupes WhatsApp${CYAN}  ║${RESET}`);
console.log(`${CYAN}╚════════════════════════════════════════════════════╝${RESET}\n`);

const checks = [
  {
    category: '📋 PRÉREQUIS SYSTÈME',
    items: [
      {
        name: 'Node.js v16+',
        check: () => {
          try {
            const version = require('child_process').execSync('node --version').toString().trim();
            return version;
          } catch { return false; }
        }
      },
      {
        name: 'npm v7+',
        check: () => {
          try {
            const version = require('child_process').execSync('npm --version').toString().trim();
            return version;
          } catch { return false; }
        }
      }
    ]
  },
  {
    category: '⚙️  FICHIERS DE CONFIGURATION',
    items: [
      {
        name: '.env',
        check: () => fs.existsSync('.env')
      },
      {
        name: '.env.example.complete',
        check: () => fs.existsSync('.env.example.complete')
      },
      {
        name: 'package.json',
        check: () => fs.existsSync('package.json')
      },
      {
        name: 'src/config.js',
        check: () => fs.existsSync('src/config.js')
      }
    ]
  },
  {
    category: '📁 FICHIERS SOURCE',
    items: [
      {
        name: 'src/index.js',
        check: () => fs.existsSync('src/index.js')
      },
      {
        name: 'src/handler.js',
        check: () => fs.existsSync('src/handler.js')
      },
      {
        name: 'src/database.js',
        check: () => fs.existsSync('src/database.js')
      }
    ]
  },
  {
    category: '🗄️  MODÈLES DE DONNÉES',
    items: [
      {
        name: 'User.js',
        check: () => fs.existsSync('src/models/User.js')
      },
      {
        name: 'Group.js (NOUVEAU)',
        check: () => fs.existsSync('src/models/Group.js')
      },
      {
        name: 'Inventory.js',
        check: () => fs.existsSync('src/models/Inventory.js')
      },
      {
        name: 'Quest.js',
        check: () => fs.existsSync('src/models/Quest.js')
      },
      {
        name: 'Warn.js',
        check: () => fs.existsSync('src/models/Warn.js')
      }
    ]
  },
  {
    category: '🛠️  UTILITAIRES',
    items: [
      {
        name: 'groupManager.js (NOUVEAU)',
        check: () => fs.existsSync('src/utils/groupManager.js')
      },
      {
        name: 'xpSystem.js',
        check: () => fs.existsSync('src/utils/xpSystem.js')
      },
      {
        name: 'cooldown.js',
        check: () => fs.existsSync('src/utils/cooldown.js')
      },
      {
        name: 'permissions.js',
        check: () => fs.existsSync('src/utils/permissions.js')
      },
      {
        name: 'antiSpam.js',
        check: () => fs.existsSync('src/utils/antiSpam.js')
      },
      {
        name: 'antiLink.js',
        check: () => fs.existsSync('src/utils/antiLink.js')
      },
      {
        name: 'cache.js',
        check: () => fs.existsSync('src/utils/cache.js')
      },
      {
        name: 'errorHandler.js',
        check: () => fs.existsSync('src/utils/errorHandler.js')
      },
      {
        name: 'jikanAPI.js',
        check: () => fs.existsSync('src/utils/jikanAPI.js')
      },
      {
        name: 'random.js',
        check: () => fs.existsSync('src/utils/random.js')
      }
    ]
  },
  {
    category: '🎮 COMMANDES (25 Total)',
    items: [
      {
        name: 'Commandes présentes',
        check: () => {
          const commandsPath = 'src/commands';
          if (!fs.existsSync(commandsPath)) return 0;
          
          let count = 0;
          const countFiles = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
              const filePath = path.join(dir, file);
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                countFiles(filePath);
              } else if (file.endsWith('.js')) {
                count++;
              }
            });
          };
          
          countFiles(commandsPath);
          return `${count}/25`;
        }
      }
    ]
  },
  {
    category: '📚 DOCUMENTATION',
    items: [
      {
        name: 'README.md',
        check: () => fs.existsSync('README.md')
      },
      {
        name: 'CONFIG_GROUPS_COMPLETE.md (NOUVEAU)',
        check: () => fs.existsSync('CONFIG_GROUPS_COMPLETE.md')
      },
      {
        name: 'API_INTEGRATION.md',
        check: () => fs.existsSync('API_INTEGRATION.md')
      },
      {
        name: 'DEPLOYMENT.md',
        check: () => fs.existsSync('DEPLOYMENT.md')
      },
      {
        name: 'VERIFICATION_FINALE.md (NOUVEAU)',
        check: () => fs.existsSync('VERIFICATION_FINALE.md')
      }
    ]
  },
  {
    category: '🔧 OUTILS DE SETUP',
    items: [
      {
        name: 'verify-config.js',
        check: () => fs.existsSync('verify-config.js')
      },
      {
        name: 'install.bat',
        check: () => fs.existsSync('install.bat')
      },
      {
        name: 'install.sh',
        check: () => fs.existsSync('install.sh')
      }
    ]
  },
  {
    category: '📁 RÉPERTOIRES',
    items: [
      {
        name: 'sessions/',
        check: () => fs.existsSync('sessions')
      },
      {
        name: 'logs/',
        check: () => fs.existsSync('logs')
      },
      {
        name: 'backups/',
        check: () => fs.existsSync('backups')
      }
    ]
  },
  {
    category: '🔗 DÉPENDANCES ESSENTIELLES',
    items: [
      {
        name: '@whiskeysockets/baileys',
        check: () => {
          const pkg = require('./package.json');
          return pkg.dependencies['@whiskeysockets/baileys'] ? 'OK' : false;
        }
      },
      {
        name: 'mongoose',
        check: () => {
          const pkg = require('./package.json');
          return pkg.dependencies['mongoose'] ? 'OK' : false;
        }
      },
      {
        name: 'dotenv',
        check: () => {
          const pkg = require('./package.json');
          return pkg.dependencies['dotenv'] ? 'OK' : false;
        }
      },
      {
        name: 'axios',
        check: () => {
          const pkg = require('./package.json');
          return pkg.dependencies['axios'] ? 'OK' : false;
        }
      }
    ]
  }
];

let totalPassed = 0;
let totalFailed = 0;

checks.forEach(category => {
  console.log(`\n${BLUE}${category.category}${RESET}`);
  console.log(`${CYAN}${'─'.repeat(50)}${RESET}`);

  category.items.forEach(item => {
    try {
      const result = item.check();
      
      if (result === false) {
        console.log(`${RED}✗${RESET} ${item.name.padEnd(35)} ${RED}MANQUANT${RESET}`);
        totalFailed++;
      } else if (result === 0 || result === '0/25') {
        console.log(`${RED}✗${RESET} ${item.name.padEnd(35)} ${RED}0 trouvé${RESET}`);
        totalFailed++;
      } else {
        console.log(`${GREEN}✓${RESET} ${item.name.padEnd(35)} ${GREEN}OK${RESET}${typeof result === 'string' && result !== 'OK' ? ` (${result})` : ''}`);
        totalPassed++;
      }
    } catch (error) {
      console.log(`${RED}✗${RESET} ${item.name.padEnd(35)} ${RED}ERREUR${RESET}`);
      totalFailed++;
    }
  });
});

console.log(`\n${CYAN}${'═'.repeat(50)}${RESET}`);
console.log(`\n📊 ${BLUE}RÉSULTATS${RESET}\n`);
console.log(`${GREEN}✓ Passés: ${totalPassed}${RESET}`);
console.log(`${RED}✗ Échoués: ${totalFailed}${RESET}`);

const percentage = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
console.log(`📈 Complétude: ${percentage}%\n`);

if (totalFailed === 0) {
  console.log(`${GREEN}${'═'.repeat(50)}${RESET}`);
  console.log(`${GREEN}🎉 CONFIGURATION PARFAITE!${RESET}`);
  console.log(`${GREEN}✅ Le bot est prêt pour les groupes WhatsApp${RESET}`);
  console.log(`${GREEN}${'═'.repeat(50)}${RESET}\n`);
  console.log(`${YELLOW}Prochaines étapes:${RESET}`);
  console.log(`  1. Éditer .env avec votre PHONE_NUMBER et MONGODB_URI`);
  console.log(`  2. Exécuter: npm start`);
  console.log(`  3. Scanner le QR code`);
  console.log(`  4. Ajouter le bot à un groupe`);
  console.log(`  5. Envoyer: !help\n`);
  process.exit(0);
} else {
  console.log(`${RED}${'═'.repeat(50)}${RESET}`);
  console.log(`${RED}⚠️  DES CORRECTIONS SONT NÉCESSAIRES${RESET}`);
  console.log(`${RED}${'═'.repeat(50)}${RESET}\n`);
  console.log(`${YELLOW}Exécutez: install.bat (Windows) ou ./install.sh (Linux/Mac)${RESET}\n`);
  process.exit(1);
}
