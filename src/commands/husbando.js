const fs = require('fs');
const path = require('path');
const { getAssetBuffer } = require('../utils/assets');

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
      const imageBuffer = getAssetBuffer('Husbando', randomFile);

      if (!imageBuffer) {
        await sock.sendMessage(senderJid, {
          text: '❌ Erreur lors du chargement de l\'image'
        });
        return;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: isGroup ? '😍 *Un beau Husbando!*\n\n➕ 5 XP ✨' : '😍 *Un beau Husbando!*\n\n'
      });

      if (isGroup) if (isGroup) user.xp += 5; // Seulement en groupe // Seulement en groupe
      await user.save();

    } catch (error) {
      console.error('Error fetching husbando:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération de l\'image. Réessaie!'
      });
    }
  }
};
