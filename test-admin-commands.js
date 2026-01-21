const path = require('path');
const fs = require('fs');

const adminPath = path.join(__dirname, 'src/commands/admin');
const files = fs.readdirSync(adminPath).filter(f => f.endsWith('.js'));

console.log(`\nTesting ${files.length} admin command files:\n`);

let loaded = 0;
let failed = 0;

files.forEach(file => {
  try {
    const fullPath = path.join(adminPath, file);
    require(fullPath);
    console.log(`✅ ${file}`);
    loaded++;
  } catch(e) {
    console.log(`❌ ${file}: ${e.message.split('\n')[0]}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${loaded} loaded, ${failed} failed`);
