const fs = require('fs');
const path = require('path');
const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
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

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    // Check daily limit for assets (10 images = XP limit)
    const today = new Date();
    if (!user.assetUsageToday) {
      user.assetUsageToday = { lastReset: today, count: 0 };
    }

    const lastReset = new Date(user.assetUsageToday.lastReset || 0);
    const isSameDay = lastReset.toDateString() === today.toDateString();
    if (!isSameDay) {
      user.assetUsageToday.lastReset = today;
      user.assetUsageToday.count = 0;
    }

    const allowXp = user.assetUsageToday.count < 10;

    try {
      // Get all image files from Vegito folder
      const assetPath = path.join(__dirname, '../asset/Vegito');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        if (reply) {
        await reply({ text: '❌ Aucune image disponible pour Vegito.' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Aucune image disponible pour Vegito.' });
      }
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
      }

      // Send image with caption
      const caption = isGroup 
        ? MessageFormatter.elegantBox('🔵 𝔉𝔢𝔦𝔢𝔥𝔯𝔞 🔵', [{ label: '✨ Récompense', value: allowXp ? '+15 XP' : '🚫 Limite atteinte (10/jour)' }])
        : MessageFormatter.elegantBox('🔵 𝔙𝔦𝔴𝔦𝔪𝔦𝔧𝔦 🔵', [{ label: '📺 Type', value: 'Personnage' }]);

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Add XP only if in group
      if (isGroup && allowXp) {
        user.xp += 15;
      }

      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();

    } catch (error) {
      console.error('Erreur commande vegito:', error);
      if (reply) {
        await reply({ text: `❌ Erreur lors du chargement de l\'image.` });
      } else {
        await sock.sendMessage(senderJid, { text: `❌ Erreur lors du chargement de l\'image.` });
      }
    }
  }
};
