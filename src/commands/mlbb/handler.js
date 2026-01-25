// HANDLER pour sous-commandes MLBB
// Ce fichier route les sous-commandes vers les bons modules
const fs = require('fs');
const path = require('path');

const mlbbProfile = require('../../models/MLBBProfile');

class MLBBHandler {
  async handleMLBB(sock, message, args) {
    const from = message.key.remoteJid;
    const senderJid = message.key.participant || from;
    const senderName = message.pushName || 'Joueur';

    const subcommand = args[0]?.toLowerCase();

    // Charger les modules de profil
    if (subcommand === 'set' || subcommand === 'me' || subcommand === 'reset') {
      const profileModule = require('./mlbb-profile');
      return profileModule.execute(sock, message, args.slice(1), null, subcommand);
    }

    // Par défaut: afficher le menu d'aide
    const mlbbModule = require('./mlbb');
    return mlbbModule.execute(sock, message, args);
  }
}

module.exports = new MLBBHandler();
