const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'naruto',
  description: 'Photos de Naruto Uzumaki',
  category: 'IMAGES',
  usage: '!naruto',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Get all image files from Naruto folder
      const assetPath = path.join(__dirname, '../asset/Naruto');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Aucune image disponible pour Naruto.')
        });
        return;
      }

      // Get group data if in group for group-level image rotation
      // Even in DM, we use user tracking for rotation
      let imageTracker = user;
      if (isGroup) {
        try {
          let group = await Group.findOne({ groupJid: senderJid });
          if (!group) {
            // Create group if doesn't exist
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

      // Get next available image (no duplicates today)
      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'naruto', files);
      await imageTracker.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Send image with caption
      const caption = isGroup 
        ? MessageFormatter.elegantBox('🗡️ NARUTO 🗡️', [{ label: '✨ Récompense', value: '+15 XP' }])
        : MessageFormatter.elegantBox('🗡️ NARUTO 🗡️', [{ label: '📺 Type', value: 'Personnage' }]);

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Add XP only if in group
      if (isGroup) {
        user.xp += 15;
        await user.save();
      }

    } catch (error) {
      console.error(`[NARUTO] Error: ${error.message}`);
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Erreur lors du chargement de l\'image.')
      });
    }
  }
};
