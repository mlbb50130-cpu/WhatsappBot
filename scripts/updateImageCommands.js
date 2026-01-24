const fs = require('fs');
const path = require('path');

// List of all image commands to update
const imageCommands = [
  'bleach', 'boahancook', 'deku', 'gojo', 'gokuui', 'jinwoo', 'livai', 
  'makima', 'mikunakano', 'nsfw', 'rengokudemon', 'sukuna', 'tengen', 
  'tsunade', 'yami', 'zerotwo'
];

const commandsPath = path.join(__dirname, '../src/commands');

for (const cmdName of imageCommands) {
  const filePath = path.join(commandsPath, `${cmdName}.js`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Group import if not already there
    if (!content.includes("const Group = require('../models/Group')")) {
      content = content.replace(
        "const ImageRotationSystem = require('../utils/imageRotation');",
        "const ImageRotationSystem = require('../utils/imageRotation');\nconst Group = require('../models/Group');"
      );
    }
    
    // Update the image tracker logic
    const oldPattern = `if (files.length === 0) {[^}]+}\n\n      // Get next available image[^}]+}\n      const selectedFile = ImageRotationSystem.getNextImage\\(user, '${cmdName}', files\\);\n      await user\\.save\\(\\); // Save image rotation tracking`;
    
    const newLogic = `if (files.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      // Get group data if in group for group-level image rotation
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
      }

      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, '${cmdName}', files);
      await imageTracker.save(); // Save image rotation tracking`;

    // More lenient replacement using a simpler approach
    if (content.includes("ImageRotationSystem.getNextImage(user,")) {
      content = content.replace(
        /const selectedFile = ImageRotationSystem\.getNextImage\(user, '([^']+)', files\);\s*await user\.save\(\); \/\/ Save image rotation tracking/g,
        `// Get group data if in group for group-level image rotation
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
      }

      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, '$1', files);
      await imageTracker.save(); // Save image rotation tracking`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${cmdName}.js`);
  }
}

console.log('\n✅ All image commands updated!');
