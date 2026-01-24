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
    
    // Old pattern
    const oldPattern = `      // Get group data if in group for group-level image rotation
      let imageTracker = user;
      if (isGroup) {
        try {
          let group = await Group.findOne({ groupJid: senderJid });
          if (!group) {
            group = new Group({
              groupJid: senderJid,
              groupName: groupData?.groupName || 'Unknown'
            });
            await group.save();
          }
          imageTracker = group;
        } catch (error) {
          console.log('Note: Using user-level image tracking for this command');
          imageTracker = user;
        }
      }`;
    
    // New pattern with DM support
    const newPattern = `      // Get group data if in group for group-level image rotation
      // Even in DM, we use user tracking for rotation
      let imageTracker = user;
      if (isGroup) {
        try {
          let group = await Group.findOne({ groupJid: senderJid });
          if (!group) {
            group = new Group({
              groupJid: senderJid,
              groupName: groupData?.groupName || 'Unknown'
            });
            await group.save();
          }
          imageTracker = group;
        } catch (error) {
          console.log('Note: Using user-level image tracking for this command');
          imageTracker = user;
        }
      } else {
        // In DM, always use user for image rotation
        imageTracker = user;
      }`;
    
    if (content.includes(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${cmdName}.js`);
    } else {
      console.log(`✗ Pattern not found in ${cmdName}.js`);
    }
  } else {
    console.log(`✗ File not found: ${cmdName}.js`);
  }
}

console.log('\n✅ All asset commands updated!');
