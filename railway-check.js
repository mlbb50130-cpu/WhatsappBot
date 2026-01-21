#!/usr/bin/env node

/**
 * 🚂 Vérificateur Pre-Deployment Railway
 * 
 * Vérifie que tout est correct avant de déployer sur Railway
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

function log(message, color = 'RESET') {
  console.log(`${COLORS[color]}${message}${COLORS.RESET}`);
}

function checkFile(filepath, name) {
  if (fs.existsSync(filepath)) {
    log(`✅ ${name}`, 'GREEN');
    return true;
  } else {
    log(`❌ ${name} MANQUANT`, 'RED');
    return false;
  }
}

function checkPackageJson() {
  log('\n📦 Vérification package.json...', 'CYAN');
  
  const packagePath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  let valid = true;
  
  // Vérifier le script start
  if (!pkg.scripts || !pkg.scripts.start) {
    log('❌ Script "start" manquant', 'RED');
    valid = false;
  } else if (pkg.scripts.start !== 'node src/index.js') {
    log('⚠️  Script "start" anormal: ' + pkg.scripts.start, 'YELLOW');
  } else {
    log('✅ Script "start" correct', 'GREEN');
  }
  
  // Vérifier les dépendances essentielles
  const required = ['@whiskeysockets/baileys', 'mongoose', 'dotenv'];
  required.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log(`✅ Dépendance: ${dep}`, 'GREEN');
    } else {
      log(`❌ Dépendance manquante: ${dep}`, 'RED');
      valid = false;
    }
  });
  
  return valid;
}

function checkEnvironmentFiles() {
  log('\n🔐 Vérification fichiers d\'environnement...', 'CYAN');
  
  let valid = true;
  
  // Ne doit PAS avoir de .env
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    log('⚠️  .env existe (ne sera pas commité)', 'YELLOW');
  }
  
  // Doit avoir .env.example
  if (!checkFile(path.join(__dirname, '.env.example'), '.env.example')) {
    valid = false;
  }
  
  return valid;
}

function checkRailwayFiles() {
  log('\n🚂 Vérification fichiers Railway...', 'CYAN');
  
  let valid = true;
  
  valid = checkFile(path.join(__dirname, 'Procfile'), 'Procfile') && valid;
  valid = checkFile(path.join(__dirname, 'railway.json'), 'railway.json') && valid;
  valid = checkFile(path.join(__dirname, '.railwayignore'), '.railwayignore') && valid;
  
  return valid;
}

function checkSourceFiles() {
  log('\n📁 Vérification fichiers source...', 'CYAN');
  
  let valid = true;
  
  const files = [
    'src/index.js',
    'src/config.js',
    'src/database.js',
    'src/handler.js'
  ];
  
  files.forEach(file => {
    valid = checkFile(path.join(__dirname, file), file) && valid;
  });
  
  return valid;
}

function checkGitIgnore() {
  log('\n📋 Vérification .gitignore...', 'CYAN');
  
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    log('❌ .gitignore manquant', 'RED');
    return false;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  let valid = true;
  
  // Vérifier que les éléments importants sont ignorés
  const shouldIgnore = [
    'node_modules',
    '.env',
    'whatsapp_auth',
    'logs'
  ];
  
  shouldIgnore.forEach(item => {
    if (content.includes(item)) {
      log(`✅ ${item} dans .gitignore`, 'GREEN');
    } else {
      log(`⚠️  ${item} peut ne pas être ignoré`, 'YELLOW');
    }
  });
  
  return valid;
}

function checkDirectories() {
  log('\n📂 Vérification répertoires...', 'CYAN');
  
  const dirs = [
    'src',
    'src/commands',
    'src/config',
    'src/models',
    'src/utils'
  ];
  
  dirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, dir))) {
      log(`✅ ${dir}/`, 'GREEN');
    } else {
      log(`⚠️  ${dir}/ manquant`, 'YELLOW');
    }
  });
  
  return true;
}

function generateReport(results) {
  log('\n' + '='.repeat(50), 'BLUE');
  log('📊 RAPPORT DE VÉRIFICATION', 'BLUE');
  log('='.repeat(50), 'BLUE');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(v => v).length;
  const percentage = Math.round((passed / total) * 100);
  
  log(`\n✓ Vérifications réussies: ${passed}/${total}`, 'CYAN');
  log(`Pourcentage: ${percentage}%\n`, 'CYAN');
  
  if (percentage === 100) {
    log('🚀 PRÊT POUR RAILWAY!', 'GREEN');
    log('\nProchaines étapes:', 'CYAN');
    log('1. git add .', 'BLUE');
    log('2. git commit -m "Prepare for Railway deployment"', 'BLUE');
    log('3. git push origin main', 'BLUE');
    log('4. Va sur https://railway.app et déploie', 'BLUE');
    return true;
  } else if (percentage >= 80) {
    log('⚠️  ATTENTION: Quelques éléments manquent', 'YELLOW');
    return false;
  } else {
    log('❌ ERREUR: Configuration incomplète', 'RED');
    return false;
  }
}

// Main
async function main() {
  log('\n🚂 VÉRIFICATEUR PRE-DEPLOYMENT RAILWAY\n', 'BLUE');
  
  const results = {
    packageJson: checkPackageJson(),
    environmentFiles: checkEnvironmentFiles(),
    railwayFiles: checkRailwayFiles(),
    sourceFiles: checkSourceFiles(),
    gitIgnore: checkGitIgnore(),
    directories: checkDirectories()
  };
  
  const success = generateReport(results);
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  log('\n❌ Erreur: ' + err.message, 'RED');
  process.exit(1);
});
