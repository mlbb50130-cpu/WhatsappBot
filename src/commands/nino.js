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

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      const assetPath = path.join(__dirname, '../asset/NINO Nakano');
      
      if (!fs.existsSync(assetPath)) {
        await sock.sendMessage(senderJid, {
          text: '❌ Dossier NINO non trouvé!'
        });
        return;
      }

      const files = fs.readdirSync(assetPath).filter(file => 
        file.match(/\.(jpg|jpeg|png|gif)$/i)
      );

      if (files.length === 0) {
        await sock.sendMessage(senderJid, {
          text: '❌ Aucune image trouvée dans le dossier NINO!'
        });
        return;
      }

      const selectedFile = ImageRotationSystem.getNextImage(user, 'nino', files);
      await user.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);

      const xpMessage = isGroup ? ' (+15 XP)' : '';
      const caption = isGroup
        ? MessageFormatter.elegantBox('🎯 NINO NAKANO 🎯', [{ label: '✨ Récompense', value: '+15 XP' }])
        : MessageFormatter.elegantBox('🎯 NINO NAKANO 🎯', [{ label: '📺 Type', value: 'Personnage' }]);
      
      await sock.sendMessage(senderJid, {
        image: fs.readFileSync(imagePath),
        caption: caption
      });

      // Award XP in groups only
      if (isGroup) {
        const User = require('../models/User');
        const participantJid = message.key.participant || senderJid;
        const userDoc = await User.findOne({ jid: participantJid });
        
        if (userDoc) {
          userDoc.xp += 15;
          await userDoc.save();
        }
      }

    } catch (error) {
      console.error('Error in nino command:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors du chargement de l\'image!'
      });
    }
  }
};
