const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'voiranime',
  description: 'Récupérer un épisode d\'un anime',
  category: 'FUN',
  usage: '!voiranime <nom> <épisode>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const voiranimeMessage = MessageFormatter.elegantBox('⚠️ 𝔙𝔒𝔌𝔕𝔄𝔑𝔌𝔐𝔈 ⚠️', [
      { label: '🔗 Lien', value: 'https://www.voiranime.com' },
      { label: '🔍 Chercher', value: '!anime <nom>' }
    ]);
    
    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(voiranimeMessage));
  }
};

