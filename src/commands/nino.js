const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/messageFormatter');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

module.exports = {
  name: 'nino',
  description: 'Envoyer une image aléatoire de NINO Nakano',
  category: 'IMAGES',
  usage: '!nino',
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

    try {
      const assetPath = path.join(__dirname, '../asset/NINO Nakano');
      
      if (!fs.existsSync(assetPath)) {
        if (reply) {
        await reply({ text: '❌ Dossier NINO non trouvé!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Dossier NINO non trouvé!' });
      }
        return;
      }

      const files = fs.readdirSync(assetPath).filter(file => 
        file.match(/\.(jpg|jpeg|png|gif)$/i)
      );

      if (files.length === 0) {
        if (reply) {
        await reply({ text: '❌ Aucune image trouvée dans le dossier NINO!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Aucune image trouvée dans le dossier NINO!' });
      }
        return;
      }

      const selectedFile = ImageRotationSystem.getNextImage(user, 'nino', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);

      const xpMessage = isGroup ? ' (+50 XP)' : '';
      const caption = isGroup
        ? MessageFormatter.elegantBox('🎯 𝔑�𝔫𝔬 𝔑𝔞𝔨𝔞𝔞𝔫𝔞 🎯', [{ label: '✨ Récompense', value: allowXp ? '+50 XP' : '🚫 Limite atteinte (10/jour)' }])
        : MessageFormatter.elegantBox('🎯 𝔑𝔦𝔯𝔞 𝔑𝔞𝔨𝔞𝔞𝔞𝔯𝔣 🎯', [{ label: '📺 Type', value: 'Personnage' }]);
      
      await sock.sendMessage(senderJid, {
        image: fs.readFileSync(imagePath),
        caption: caption
      });

      // Award XP in groups only if within limit
      if (isGroup && allowXp) {
        const User = require('../models/User');
        const participantJid = message.key.participant || senderJid;
        const userDoc = await User.findOne({ jid: participantJid });
        
        if (userDoc) {
          userDoc.xp += 50;
          await userDoc.save();
        }
      }

      // Increment usage counter for current user
      user.assetUsageToday.count += 1;
      await user.save();

    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur lors du chargement de l\'image!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement de l\'image!' });
      }
    }
  }
};
