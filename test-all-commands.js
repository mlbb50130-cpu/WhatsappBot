const path = require('path');
const fs = require('fs');

const commandsPath = path.join(__dirname, 'src/commands');

let totalLoaded = 0;
let totalFailed = 0;
const failedCommands = [];

function loadDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      loadDir(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const command = require(filePath);
        if (command.name) {
          console.log(`✅ ${command.name.padEnd(20)} (${file})`);
          totalLoaded++;
        } else {
          console.log(`⚠️  ${file.padEnd(20)} - No name property`);
        }
      } catch(e) {
        console.log(`❌ ${file.padEnd(20)} - ${e.message.split('\n')[0]}`);
        totalFailed++;
        failedCommands.push({ file, error: e.message.split('\n')[0] });
      }
    }
  }
}

console.log('\n📋 Loading all commands:\n');
loadDir(commandsPath);

console.log(`\n\n📊 Results:`);
console.log(`✅ Loaded: ${totalLoaded}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`📦 Total files: ${totalLoaded + totalFailed}`);

if (failedCommands.length > 0) {
  console.log(`\n\n Failed commands:`);
  failedCommands.forEach(cmd => {
    console.log(`  - ${cmd.file}: ${cmd.error}`);
  });
}
