const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'sukuna',
  description: 'Photo aléatoire de Sukuna',
  category: 'ASSETS',
  usage: '!sukuna',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

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
    const assetPath = path.join(__dirname, '../asset/Sukuna');

    try {
      if (!fs.existsSync(assetPath)) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Aucune photo trouvée!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Aucune photo trouvée!') });
      }
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Aucune photo trouvée!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Aucune photo trouvée!') });
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

      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'sukuna', files);
      await imageTracker.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        if (reply) {
        await reply({ text: MessageFormatter.error('Erreur lors du chargement!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur lors du chargement!') });
      }
        return;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? MessageFormatter.elegantBox('😿 𝔖𝔦𝔡𝔦𝔫𝔯 😿', [{ label: '✨ Récompense', value: allowXp ? '+2 XP' : '🚫 Limite atteinte (10/jour)' }]) : MessageFormatter.elegantBox('😿 𝔖𝔲𝔯𝔦𝔫𝔠 😿', [{ label: '📺 Type', value: 'Personnage' }])
      });

      if (isGroup && allowXp) {
        user.xp += 2;
      }

      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();
    } catch (error) {
      console.error('Error in sukuna command:', error.message);
      if (reply) {
        await reply({ text: MessageFormatter.error('Erreur!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur!') });
      }
    }
  }
};

