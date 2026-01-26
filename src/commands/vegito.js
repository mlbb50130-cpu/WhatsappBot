const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'vegito',
  description: 'Photos de Vegito (Dragon Ball Z)',
  category: 'IMAGES',
  usage: '!vegito',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Get all image files from Vegito folder
      const assetPath = path.join(__dirname, '../asset/Vegito');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour Vegito.'
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

      // Get next available image (no duplicates)
      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'vegito', files);
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Save image rotation tracking
      try {
        await imageTracker.save();
      } catch (saveError) {
        console.log('Note: Could not save image tracking for this context');
      }

      // Send image with caption
      const caption = isGroup 
        ? MessageFormatter.elegantBox('🔵 VEGITO 🔵', [{ label: '✨ Récompense', value: '+15 XP' }])
        : MessageFormatter.elegantBox('🔵 VEGITO 🔵', [{ label: '📺 Type', value: 'Personnage' }]);

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
      console.error('Erreur commande vegito:', error);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur lors du chargement de l\'image.`
      });
    }
  }
};
