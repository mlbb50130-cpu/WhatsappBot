/**
 * 🧪 Test Suite - Admin Actions
 * Exécutez avec: node verify-admin-actions.js
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

class AdminActionsVerifier {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(status, message) {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
    console.log(`${icon} ${color}${message}${colors.reset}`);
    
    if (status === 'PASS') this.passed++;
    if (status === 'FAIL') this.failed++;
  }

  checkFileExists(filePath, description) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      this.log('PASS', `Found: ${description}`);
      return true;
    } else {
      this.log('FAIL', `Missing: ${description} (${filePath})`);
      return false;
    }
  }

  checkFileContent(filePath, searchString, description) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      this.log('FAIL', `Cannot check content - file not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(searchString)) {
      this.log('PASS', `${description}`);
      return true;
    } else {
      this.log('FAIL', `${description} - content not found`);
      return false;
    }
  }

  checkDirectory(dirPath, description) {
    const fullPath = path.join(__dirname, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      this.log('PASS', `Found directory: ${description}`);
      return true;
    } else {
      this.log('FAIL', `Missing directory: ${description} (${dirPath})`);
      return false;
    }
  }

  run() {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}🧪 TetsuBot Admin Actions Verification${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

    // 1. Check Core Files
    console.log(`${colors.cyan}📁 Checking Core Files...${colors.reset}`);
    this.checkFileExists('src/utils/adminActions.js', 'AdminActionsManager');
    this.checkFileExists('src/utils/permissionManagerV2.js', 'PermissionManagerV2');
    this.checkFileExists('src/config/adminConfig.js', 'Admin Configuration');

    // 2. Check Command Files
    console.log(`\n${colors.cyan}🎮 Checking Command Files...${colors.reset}`);
    this.checkFileExists('src/commands/admin/kick.js', 'Kick Command');
    this.checkFileExists('src/commands/admin/warn.js', 'Warn Command');
    this.checkFileExists('src/commands/admin/promote.js', 'Promote Command');
    this.checkFileExists('src/commands/admin/demote.js', 'Demote Command');
    this.checkFileExists('src/commands/admin/mute.js', 'Mute Command');
    this.checkFileExists('src/commands/admin/unmute.js', 'Unmute Command');
    this.checkFileExists('src/commands/admin/lock.js', 'Lock Command');
    this.checkFileExists('src/commands/admin/unlock.js', 'Unlock Command');
    this.checkFileExists('src/commands/admin/groupinfo.js', 'GroupInfo Command');
    this.checkFileExists('src/commands/admin/admins.js', 'Admins Command');

    // 3. Check Documentation
    console.log(`\n${colors.cyan}📚 Checking Documentation...${colors.reset}`);
    this.checkFileExists('ADMIN_ACTIONS_GUIDE.md', 'Admin Actions Guide');
    this.checkFileExists('DEPLOY_ADMIN_ACTIONS.md', 'Deployment Guide');

    // 4. Check AdminActionsManager Content
    console.log(`\n${colors.cyan}🛡️ Checking AdminActionsManager Methods...${colors.reset}`);
    this.checkFileContent('src/utils/adminActions.js', 'kickUser', 'kickUser method');
    this.checkFileContent('src/utils/adminActions.js', 'promoteUser', 'promoteUser method');
    this.checkFileContent('src/utils/adminActions.js', 'demoteUser', 'demoteUser method');
    this.checkFileContent('src/utils/adminActions.js', 'muteGroup', 'muteGroup method');
    this.checkFileContent('src/utils/adminActions.js', 'unmuteGroup', 'unmuteGroup method');
    this.checkFileContent('src/utils/adminActions.js', 'lockGroup', 'lockGroup method');
    this.checkFileContent('src/utils/adminActions.js', 'unlockGroup', 'unlockGroup method');
    this.checkFileContent('src/utils/adminActions.js', 'isBotAdmin', 'isBotAdmin method');

    // 5. Check Command Implementations
    console.log(`\n${colors.cyan}⚡ Checking Command Implementations...${colors.reset}`);
    this.checkFileContent('src/commands/admin/kick.js', 'AdminActionsManager.kickUser', 'Kick uses AdminActionsManager');
    this.checkFileContent('src/commands/admin/warn.js', 'AdminActionsManager.kickUser', 'Warn uses AdminActionsManager');
    this.checkFileContent('src/commands/admin/promote.js', 'AdminActionsManager.promoteUser', 'Promote uses AdminActionsManager');
    this.checkFileContent('src/commands/admin/demote.js', 'AdminActionsManager.demoteUser', 'Demote uses AdminActionsManager');

    // 6. Check Configuration
    console.log(`\n${colors.cyan}⚙️ Checking Configuration...${colors.reset}`);
    this.checkFileContent('src/config/adminConfig.js', 'MAX_WARNINGS', 'Max warnings config');
    this.checkFileContent('src/config/adminConfig.js', 'PERMISSIONS', 'Permissions config');
    this.checkFileContent('src/config/adminConfig.js', 'SECURITY', 'Security config');

    // 7. Check Dependencies
    console.log(`\n${colors.cyan}📦 Checking Dependencies...${colors.reset}`);
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    if (packageJson.dependencies['@whiskeysockets/baileys']) {
      this.log('PASS', 'Baileys is installed');
    } else {
      this.log('FAIL', 'Baileys is not installed');
    }

    if (packageJson.dependencies['mongoose']) {
      this.log('PASS', 'Mongoose is installed');
    } else {
      this.log('FAIL', 'Mongoose is not installed');
    }

    // 8. Summary
    console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}📊 Summary${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Total: ${this.passed + this.failed}${colors.reset}`);

    if (this.failed === 0) {
      console.log(`\n${colors.green}🎉 All checks passed! Admin actions are ready to use.${colors.reset}`);
      console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
      console.log(`1. Make the bot administrator in the WhatsApp group`);
      console.log(`2. Start the bot with: npm run dev`);
      console.log(`3. Test with: !kick @user, !warn @user, etc.`);
      console.log(`\nRead ADMIN_ACTIONS_GUIDE.md for complete documentation.`);
    } else {
      console.log(`\n${colors.red}⚠️ Some checks failed. Please review the errors above.${colors.reset}`);
      console.log(`\nMissing files should be created or restored from the repository.`);
    }

    console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
  }
}

// Run verification
const verifier = new AdminActionsVerifier();
verifier.run();

// Exit with appropriate code
process.exit(verifier.failed > 0 ? 1 : 0);
