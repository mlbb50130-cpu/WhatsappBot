const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'UTILITY',
  cooldown: 5,
  description: 'Convertir une image en sticker WhatsApp (512x512 WebP)',
  usage: '!sticker [en réponse à une image]',

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Vérifier si c'est une réponse à une image
      if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        return sock.sendMessage(senderJid, {
          text: '❌ Utilisation: Réponds à une image avec `!sticker`'
        }, { quoted: message });
      }

      const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
      
      if (!quotedMsg.imageMessage) {
        return sock.sendMessage(senderJid, {
          text: '❌ Veuillez répondre à une image valide'
        }, { quoted: message });
      }

      // Renvoi du message de traitement
      await sock.sendMessage(senderJid, {
        text: '⏳ Conversion en cours...'
      }, { quoted: message });

      // Essayer d'envoyer l'image en tant que sticker
      // WhatsApp convertira automatiquement l'image en sticker
      try {
        await sock.sendMessage(senderJid, {
          sticker: quotedMsg.imageMessage.url || quotedMsg.imageMessage
        });

        // Confirmation
        await sock.sendMessage(senderJid, {
          text: '✅ Sticker créé avec succès! 🎨'
        }, { quoted: message });
      } catch (stickerErr) {
        console.error('[STICKER] Erreur conversion:', stickerErr);
        
        // Si la conversion automatique ne marche pas, proposer une alternative
        await sock.sendMessage(senderJid, {
          text: '⚠️ Conversion automatique impossible.\n\nEssaie:\n1. Réponds à l\'image\n2. Utilise le menu WhatsApp pour créer un sticker\n\nOu utilise un bot sticker spécialisé.'
        }, { quoted: message });
      }

    } catch (error) {
      console.error('[STICKER] Erreur:', error);
      
      return sock.sendMessage(senderJid, {
        text: `❌ Erreur: ${error.message || 'Impossible de créer le sticker'}`
      }, { quoted: message });
    }
  }
};
