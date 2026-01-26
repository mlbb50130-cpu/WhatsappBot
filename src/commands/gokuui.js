const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'gokuui',
  description: 'Photo aléatoire de GokuUI',
  category: 'ASSETS',
  usage: '!gokuui',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/GokuUi');

    try {
      if (!fs.existsSync(assetPath)) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
        return;
      }

      // Get group data if in group for group-level image rotation
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
      }

      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'gokuui', files);
      await imageTracker.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      if (isGroup) {
        user.xp += 2;
        await user.save();
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? MessageFormatter.elegantBox('📋 GOKU UI 📋', [{ label: '✨ Récompense', value: '+2 XP' }]) : MessageFormatter.elegantBox('📋 GOKU UI 📋', [{ label: '📺 Type', value: 'Personnage' }])
      });
    } catch (error) {
      console.error('Error in gokuui command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
    }
  }
};

