const axios = require('axios');
const MessageFormatter = require('../utils/messageFormatter');

const TRUTHS = [
  'Quelle est ta plus grande peur ?',
  'Quel est ton plus gros mensonge recent ?',
  'Quelle habitude bizarre tu caches aux autres ?',
  'Qui etait ton premier crush ?',
  'Quel message genant as-tu deja envoye par erreur ?',
  'Quel est ton plus grand regret ?',
  'Quelle appli supprimerais-tu si tu devais en garder seulement trois ?',
  'Quelle est la chose la plus immature que tu fais encore ?',
  'Quel secret personne ici ne connait ?',
  'Qui te fait le plus rire dans ce groupe ?',
];

const DARES = [
  'Envoie une note vocale avec une voix bizarre pendant 10 secondes.',
  'Ecris ton prochain message uniquement en rimes.',
  'Change ton statut WhatsApp avec une phrase choisie par le groupe.',
  'Fais 10 squats maintenant.',
  'Envoie le dernier emoji utilise dans ton clavier.',
  'Parle comme un robot pendant deux tours.',
  'Fais une declaration dramatique a un objet proche de toi.',
  'Envoie une photo avec la tete la plus bizarre possible.',
  'Appelle un ami et dis juste "mission accomplie".',
  'Laisse le groupe te donner un surnom pour la journee.',
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

module.exports = {
  name: 'truth',
  aliases: ['dare', 'coinflip', 'dice', 'fact'],
  description: 'Commandes fun Atlas: truth, dare, coinflip, dice, fact',
  category: 'FUN',
  usage: '!truth | !dare | !coinflip | !dice 6 | !fact',
  adminOnly: false,
  groupOnly: false,
  cooldown: 3,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim();
    const command = text.replace(/^[^\w]*!*/, '').split(/\s+/)[0].toLowerCase();

    try {
      if (command === 'truth') {
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({ title: 'Truth', body: [pick(TRUTHS)] }),
        }, { quoted: message });
      }

      if (command === 'dare') {
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({ title: 'Dare', body: [pick(DARES)] }),
        }, { quoted: message });
      }

      if (command === 'coinflip') {
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({ title: 'Coinflip', body: [Math.random() < 0.5 ? 'Pile' : 'Face'] }),
        }, { quoted: message });
      }

      if (command === 'dice') {
        const sides = Math.max(2, Math.min(parseInt(args[0], 10) || 6, 1000));
        const roll = Math.floor(Math.random() * sides) + 1;
        return sock.sendMessage(jid, {
          text: MessageFormatter.panel({
            title: 'Dice',
            fields: [
              { label: 'Faces', value: sides },
              { label: 'Resultat', value: roll },
            ],
          }),
        }, { quoted: message });
      }

      const { data } = await axios.get('https://nekos.life/api/v2/fact', { timeout: 15000 });
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({ title: 'Fact', body: [data?.fact || 'Aucun fact trouve.'] }),
      }, { quoted: message });
    } catch (error) {
      return await sock.sendMessage(jid, {
        text: MessageFormatter.publicError('Commande fun impossible', error),
      }, { quoted: message });
    }
  },
};
