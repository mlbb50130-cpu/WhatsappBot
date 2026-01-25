const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'hentaivd',
  description: 'Vidéos hentai (2x/jour en groupe, 300 XP)',
  category: 'IMAGES',
  usage: '!hentaivd',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Check daily limit in groups (2 times per day)
      if (isGroup) {
        const now = new Date();
        const today = now.toDateString();
        
        // Initialize hentaivd counter if not exists
        if (!user.hentaivdUsedToday) {
          user.hentaivdUsedToday = { date: today, count: 0 };
        }
        
        // Reset counter if new day
        if (user.hentaivdUsedToday.date !== today) {
          user.hentaivdUsedToday = { date: today, count: 0 };
        }
        
        // Check if limit reached (2 times per day)
        if (user.hentaivdUsedToday.count >= 2) {
          const nextDay = new Date(now);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          const timeUntilReset = Math.ceil((nextDay - now) / (1000 * 60 * 60));
          
          await sock.sendMessage(senderJid, {
            text: `❌ Tu as utilisé !hentaivd 2 fois aujourd'hui!\n⏰ Reviens demain (dans ${timeUntilReset}h)`
          });
          return;
        }
      }

      // Get all image/video files from HentaiVD folder
      const assetPath = path.join(__dirname, '../asset/HentaiVD');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(file)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour HentaiVD.'
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

      // Get next available image (no duplicates today)
      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'hentaivd', files);
      await imageTracker.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Send image with caption
      let caption = '🔥 *HentaiVD* 🔥';
      if (isGroup) {
        caption += '\n\n➕ 300 XP ✨';
        user.xp += 300;
        user.hentaivdUsedToday.count += 1;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Save user changes
      await user.save();

    } catch (error) {
      console.error(`[HENTAIVD] Error: ${error.message}`);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du chargement de l\'image.'
      });
    }
  }
};
