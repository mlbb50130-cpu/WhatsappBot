const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'yoruichi',
  description: 'Photo aléatoire de Yoruichi',
  category: 'IMAGES',
  usage: '!yoruichi',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
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
    const assetPath = path.join(__dirname, '../asset/Yoruichi');

    try {
      if (!fs.existsSync(assetPath)) {
        await sock.sendMessage(senderJid, { 
          text: '❌ Dossier des images Yoruichi non trouvé!' 
        });
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        await sock.sendMessage(senderJid, { 
          text: '❌ Aucune image trouvée dans le dossier Yoruichi!' 
        });
        return;
      }

      const selectedFile = ImageRotationSystem.getNextImage(user, 'yoruichi', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
        return;
      }

      // Add XP only if in group
      if (isGroup && allowXp) {
        user.xp += 15;
      }

      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? MessageFormatter.elegantBox('💜 𝔜𝔬𝔞𝔠𝔦𝔧𝔦 💜', [{ label: '✨ Récompense', value: allowXp ? '+15 XP' : '🚫 Limite atteinte (10/jour)' }]) : MessageFormatter.elegantBox('💜 𝔜𝔞𝔰𝔞𝔰𝔠𝔞𝔞 💜', [{ label: '📺 Type', value: 'Personnage' }])
      });
    } catch (error) {
      console.error('Error in yoruichi command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement de l\'image!' });
    }
  }
};
