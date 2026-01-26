const fs = require('fs');
const path = require('path');
const Group = require('../../models/Group');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'theme',
  description: 'Changer le theme du groupe (Admin only)',
  category: 'ADMIN',
  usage: '!theme LAKERSWaifu',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Vérifier si un theme a été spécifié
      if (args.length === 0) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.warning('❌ Veuillez spécifier un theme!\n\n📝 Usage: `!theme LAKERSWaifu`')
        });
        return;
      }

      const themeName = args[0].toLowerCase();
      
      // Vérifier que le dossier du theme existe
      const themeDir = path.join(__dirname, '../../asset', themeName);
      
      if (!fs.existsSync(themeDir)) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error(`Le theme "${themeName}" n'existe pas!`)
        });
        return;
      }

      // Récupérer toutes les images du dossier
      const images = fs.readdirSync(themeDir)
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map(file => path.join(themeDir, file));

      if (images.length === 0) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error(`Aucune image trouvée dans le theme "${themeName}"!`)
        });
        return;
      }

      // Choisir une image aléatoire
      const randomImage = images[Math.floor(Math.random() * images.length)];

      // Lire l'image depuis le disque
      const imageBuffer = fs.readFileSync(randomImage);

      // Envoyer l'image avec un message
      const caption = `🎨 *Theme changé!*\n\n✨ Theme actuel: \`${themeName}\`\n👑 Changé par: @${user.jid.split('@')[0]}\n\n🖼️ Voici un aperçu du theme!`;
      
      await sock.sendMessage(senderJid, {
        image: imageBuffer,
        caption: caption,
        mentions: [user.jid]
      });

      // Sauvegarder le theme dans la base de données du groupe
      await Group.findOneAndUpdate(
        { groupJid: senderJid },
        { 
          $set: { 
            theme: themeName,
            themeChangedAt: new Date(),
            themeChangedBy: user.jid
          } 
        },
        { upsert: true }
      );

      console.log(`🎨 Theme "${themeName}" appliqué au groupe ${senderJid}`);

    } catch (error) {
      console.error('Error in theme command:', error.message);
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error(`Erreur: ${error.message}`)
      });
    }
  }
};
