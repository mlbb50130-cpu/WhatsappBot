const PermissionManager = require('../utils/permissions');
const { setTtl, getTtlLabel } = require('../utils/fileHosting');
const MessageFormatter = require('../utils/messageFormatter');

// Convertit une chaine comme "30m", "2h", "1j" en millisecondes.
// Unites: s (secondes), m (minutes), h (heures), j/d (jours).
function parseDuration(str) {
  const match = String(str || '').toLowerCase().match(/^(\d+)(s|m|h|j|d)?$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = match[2] || 'h';
  const factors = { s: 1000, m: 60000, h: 3600000, j: 86400000, d: 86400000 };
  return n * (factors[unit] || 3600000);
}

module.exports = {
  name: 'setfilettl',
  aliases: ['filettl'],
  description: 'Definit la duree de vie des fichiers heberges (proprietaire seulement)',
  category: 'BOT',
  usage: '!setfilettl <duree>   ex: 30m  2h  24h  1j\n!filettl              → voir la valeur actuelle',
  adminOnly: false,
  groupOnly: false,
  cooldown: 0,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));

    if (!PermissionManager.isAdmin(senderJid)) {
      await send({ text: MessageFormatter.warning('Commande reservee au proprietaire du bot.') });
      return;
    }

    // Pas d'argument → affiche la valeur actuelle
    if (args.length === 0) {
      await send({ text: MessageFormatter.info(`Duree de vie actuelle des fichiers heberges: *${getTtlLabel()}*`) });
      return;
    }

    const ms = parseDuration(args[0]);
    const MIN_MS = 60 * 1000;        // 1 minute
    const MAX_MS = 7 * 86400 * 1000; // 7 jours

    if (!ms || ms < MIN_MS || ms > MAX_MS) {
      await send({ text: MessageFormatter.warning('Format invalide. Exemples: `30m`, `2h`, `24h`, `1j`\nMinimum: 1min  |  Maximum: 7j') });
      return;
    }

    setTtl(ms);
    await send({ text: MessageFormatter.success(`Duree de vie des fichiers definie a *${getTtlLabel()}*.\nLes nouveaux fichiers seront supprimes apres ce delai.`) });
  },
};
