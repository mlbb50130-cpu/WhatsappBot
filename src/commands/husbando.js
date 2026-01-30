const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');

module.exports = {
  name: 'husbando',
  description: 'Image husbando aléatoire',
  category: 'IMAGES',
  usage: '!husbando',
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

    try {
      // Charger les images de Husbando depuis les assets
      const assetPath = path.join(__dirname, '../asset/Husbando');
      const files = fs.readdirSync(assetPath).filter(f => 
        f.startsWith('Husbando_') && (f.endsWith('.jpg') || f.endsWith('.png'))
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image disponible pour le moment'
        });
        return;
      }

      const randomFile = files[Math.floor(Math.random() * files.length)];
      const selectedFile = ImageRotationSystem.getNextImage(user, 'husbando', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, {
          text: '❌ Erreur lors du chargement de l\'image'
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? MessageFormatter.elegantBox('😍 𝔉𝔲𝔰𝔳𝔞𝔫𝔡𝔬 😍', [{ label: '✨ Récompense', value: allowXp ? '+5 XP' : '🚫 Limite atteinte (10/jour)' }]) : MessageFormatter.elegantBox('😍 𝔊𝔦𝔰𝔞𝔠𝔞𝔞𝔞𝔞 😍', [{ label: '📺 Type', value: 'Personnage' }])
      });

      if (isGroup && allowXp) {
        user.xp += 5;
      }

      // Increment usage counter
      user.assetUsageToday.count += 1;
      await user.save();

    } catch (error) {
      console.error('Error fetching husbando:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération de l\'image. Réessaie!'
      });
    }
  }
};
