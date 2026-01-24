const fs = require('fs');
const path = require('path');

const assetCommands = [
  'bleach', 'boahancook', 'deku', 'gojo', 'gokuui', 'husbando', 'jinwoo',
  'livai', 'madara', 'makima', 'miku', 'mikunakano', 'nino', 'nsfw',
  'rengokudemon', 'sukuna', 'tengen', 'tsunade', 'waifu', 'yami', 'yoruichi', 'zerotwo'
];

const commandsPath = path.join(__dirname, '../src/commands');

for (const cmdName of assetCommands) {
  const filePath = path.join(commandsPath, `${cmdName}.js`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix duplicate else blocks
    const duplicatePattern = `      } else {
        // In DM, always use user for image rotation
        imageTracker = user;
      } else {
        // In DM, always use user for image rotation
        imageTracker = user;
      }`;
    
    const fixedPattern = `      } else {
        // In DM, always use user for image rotation
        imageTracker = user;
      }`;
    
    if (content.includes(duplicatePattern)) {
      content = content.replace(duplicatePattern, fixedPattern);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed duplicate in ${cmdName}.js`);
    } else {
      console.log(`✓ ${cmdName}.js OK`);
    }
  }
}

console.log('\n✅ All duplicates fixed!');
