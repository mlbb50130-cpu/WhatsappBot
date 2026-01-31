const fs = require('fs');
const path = require('path');
const ImageRotationSystem = require('../utils/imageRotation');
const Group = require('../models/Group');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'hentai',
  description: 'Images hentai (2x/jour en groupe, 300 XP)',
  category: 'HENTAI',
  usage: '!hentai',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      // Check if hentai is allowed in this group
      if (isGroup) {
        const groupDoc = await Group.findOne({ groupJid: senderJid }).catch(() => null);
        if (groupDoc?.permissions?.allowHentai === false) {
          if (reply) {
        await reply({ text: '❌ Les commandes hentai ne sont pas autorisées dans ce groupe!\n\n💬 Demande à un admin d\'utiliser: !allowhentai on' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Les commandes hentai ne sont pas autorisées dans ce groupe!\n\n💬 Demande à un admin d\'utiliser: !allowhentai on' });
      }
          return;
        }
      }

      // Vérifier la limite quotidienne (2x par jour) - SEULEMENT EN GROUPE
      if (isGroup) {
        const now = new Date();
        
        // Initialiser si nécessaire
        if (!user.hentaiUsageToday) {
          user.hentaiUsageToday = {
            lastReset: new Date(),
            hentai: 0,
            hentaivd: 0
          };
        }
        
        // Vérifier si 24h se sont écoulées
        const lastReset = new Date(user.hentaiUsageToday.lastReset);
        const hoursDiff = (now - lastReset) / (1000 * 60 * 60);
        
        if (hoursDiff >= 24) {
          // Réinitialiser le compteur
          user.hentaiUsageToday.hentai = 0;
          user.hentaiUsageToday.hentaivd = 0;
          user.hentaiUsageToday.lastReset = new Date();
        }
        
        // Vérifier la limite
        if (user.hentaiUsageToday.hentai >= 2) {
          const nextDay = new Date(now);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          const timeUntilReset = Math.ceil((nextDay - now) / (1000 * 60 * 60));
          
          await sock.sendMessage(senderJid, {
            text: `❌ Tu as utilisé !hentai 2 fois aujourd'hui!\n⏰ Reviens demain (dans ${timeUntilReset}h)`
          });
          return;
        }
      }

      // Get all image files from Hentai folder
      const assetPath = path.join(__dirname, '../asset/Hentai');
      const files = fs.readdirSync(assetPath).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (files.length === 0) {
        if (reply) {
        await reply({ text: '❌ Aucune image disponible pour Hentai.' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Aucune image disponible pour Hentai.' });
      }
        return;
      }

      // Sélectionner une image aléatoire
      const selectedFile = files[Math.floor(Math.random() * files.length)];
      const imagePath = path.join(assetPath, selectedFile);
      const imageBuffer = fs.readFileSync(imagePath);

      // Incrémenter le compteur pour hentai
      user.hentaiUsageToday.hentai++;

      // Send image with caption
      let caption = '🔥 *Hentai* 🔥';
      if (isGroup) {
        caption += '\n\n➕ 300 XP ✨';
        user.xp += 300;
      }

      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption
      });

      // Save user changes
      await user.save();

    } catch (error) {
      console.error(`[HENTAI] Error: ${error.message}`);
      if (reply) {
        await reply({ text: '❌ Erreur lors du chargement de l\'image.' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur lors du chargement de l\'image.' });
      }
    }
  }
};
