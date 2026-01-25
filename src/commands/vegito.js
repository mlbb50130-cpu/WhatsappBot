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
        } catch (err) {
          console.error('Error managing group:', err);
        }
      }

      // Use image rotation system to avoid duplicates in 24h
      const result = await ImageRotationSystem.getImageFromFolder(
        imageTracker,
        files,
        assetPath,
        'vegito'
      );

      if (!result.imagePath) {
        await sock.sendMessage(senderJid, {
          text: `❌ ${result.message || 'Impossible de charger l\'image.'}`
        });
        return;
      }

      // Send image
      const imageBuffer = fs.readFileSync(result.imagePath);
      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: `🔥 **VEGITO** - Dragon Ball Z\n\n${result.imagePath.split('/').pop()}\n\n✨ Image ${result.currentIndex}/${files.length}`
      }, { quoted: message });

    } catch (error) {
      console.error('Erreur commande vegito:', error);
      await sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message}`
      });
    }
  }
};
