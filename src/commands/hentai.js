const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'hentai',
  description: 'Images hentai (2x/jour en groupe, 300 XP)',
  category: 'HENTAI',
  usage: '!hentai',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Check if hentai is allowed in this group
      if (isGroup) {
        try {
          let group = await Group.findOne({ groupJid: senderJid });
          if (group && group.permissions && group.permissions.allowHentai === false) {
            await sock.sendMessage(senderJid, {
              text: '❌ Les commandes hentai ne sont pas autorisées dans ce groupe!\n\n💬 Demande à un admin d\'utiliser: !allowhentai on'
            });
            return;
          }
        } catch (error) {
          console.log('Note: Could not check group hentai settings');
        }
      }

      // Get all image files from Hentai folder
      const assetPath = path.join(__dirname, '../asset/Hentai');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour Hentai.'
        });
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
      } else {
        // In DM, always use user for image rotation
        imageTracker = user;
      }

      // Get next available image with daily limit (2x per day, no duplicates)
      // First check daily limit manually
      const now = new Date();
      
      if (!imageTracker.dailyImages) {
        ImageRotationSystem.initializeDailyImages(imageTracker);
      }
      
      if (!imageTracker.dailyImages.dailyLimits) {
        imageTracker.dailyImages.dailyLimits = {
          hentai: { usedToday: 0, lastReset: new Date() },
          hentaivd: { usedToday: 0, lastReset: new Date() }
        };
      }
      
      const hentaiLimit = imageTracker.dailyImages.dailyLimits.hentai;
      
      // Reset if 24 hours have passed
      if (ImageRotationSystem.needsDailyReset(hentaiLimit.lastReset)) {
        hentaiLimit.usedToday = 0;
        hentaiLimit.lastReset = new Date();
      }
      
      // Check limit
      if (hentaiLimit.usedToday >= 2) {
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        const timeUntilReset = Math.ceil((nextDay - now) / (1000 * 60 * 60));
        
        await sock.sendMessage(senderJid, {
          text: `❌ Tu as utilisé !hentai 2 fois aujourd'hui!\n⏰ Reviens demain (dans ${timeUntilReset}h)`
        });
        return;
      }
      
      // Get next image without duplicates
      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'hentai', files);
      
      if (!selectedFile) {
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        const timeUntilReset = Math.ceil((nextDay - now) / (1000 * 60 * 60));
        
        await sock.sendMessage(senderJid, {
          text: `❌ Tu as utilisé !hentai 2 fois aujourd'hui!\n⏰ Reviens demain (dans ${timeUntilReset}h)`
        });
        return;
      }
      
      // Increment counter
      hentaiLimit.usedToday++;
      
      // Save tracking changes
      try {
        await imageTracker.save();
      } catch (saveError) {
        console.log('Note: Could not save image tracking for this context');
      }
      
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Send image with caption
      let caption = '🔥 *Hentai* 🔥';
      if (isGroup) {
        caption += '\n\n➕ 300 XP ✨';
        user.xp += 300;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Save user changes
      await user.save();

    } catch (error) {
      console.error(`[HENTAI] Error: ${error.message}`);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du chargement de l\'image.'
      });
    }
  }
};
