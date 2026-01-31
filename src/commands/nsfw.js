const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'nsfw',
  description: 'Photo aléatoire de NSFW',
  category: 'ASSETS',
  usage: '!nsfw',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const assetPath = path.join(__dirname, '../asset/NSFW');

    try {
      if (isGroup) {
        const groupDoc = await Group.findOne({ groupJid: senderJid }).catch(() => null);
        if (groupDoc?.permissions?.allowHentai === false) {
          if (reply) {
        await reply({ text: '❌ Les commandes NSFW ne sont pas autorisées dans ce groupe!\n\n💬 Demande à un admin d\'utiliser: !allowhentai on' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Les commandes NSFW ne sont pas autorisées dans ce groupe!\n\n💬 Demande à un admin d\'utiliser: !allowhentai on' });
      }
          return;
        }
      }

      if (!fs.existsSync(assetPath)) {
        if (reply) {
        await reply({ text: '❌ Aucune photo trouvée!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
      }
        return;
      }

      const files = fs.readdirSync(assetPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (files.length === 0) {
        if (reply) {
        await reply({ text: '❌ Aucune photo trouvée!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Aucune photo trouvée!' });
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

      const selectedFile = ImageRotationSystem.getNextImage(imageTracker, 'nsfw', files);
      await imageTracker.save(); // Save image rotation tracking
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!imageBuffer) {
        if (reply) {
        await reply({ text: '❌ Erreur lors du chargement!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement!' });
      }
        return;
      }

      if (isGroup) {
        user.xp += 2;
        await user.save();
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '🔥 *NSFW*\n\n➕ 2 XP ✨' : '🔥 *NSFW*\n\n'
      });
    } catch (error) {
      console.error('Error in nsfw command:', error.message);
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};

