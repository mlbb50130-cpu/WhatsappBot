const os = require('os');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const Access = require('../services/botAccessService');

function formatSeconds(total) {
  const seconds = Math.floor(Number(total) || 0);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [
    days ? `${days}j` : '',
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    `${secs}s`,
  ].filter(Boolean).join(' ');
}

function memoryMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getCommand(message) {
  const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  return text.trim().slice(config.PREFIX.length).split(/\s+/)[0].toLowerCase();
}

module.exports = {
  name: 'alive',
  aliases: ['uptime', 'runtime', 'status', 'sys', 'script', 'sc', 'support', 'supportgc', 'restart', 'reboot'],
  description: 'Commandes systeme Atlas: status, support, script, restart',
  category: 'BOT',
  usage: '!alive | !status | !support | !restart',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const command = getCommand(message);

    if (['restart', 'reboot'].includes(command)) {
      if (!Access.isOwner(actor)) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.error('Redemarrage reserve au proprietaire du bot.'),
        }, { quoted: message });
      }

      await sock.sendMessage(jid, {
        text: MessageFormatter.warning('Redemarrage du bot...'),
      }, { quoted: message });
      setTimeout(() => process.exit(0), 1200);
      return;
    }

    if (['support', 'supportgc'].includes(command)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({
          title: 'Support',
          body: [
            `Support non configure dans ${config.BOT_NAME}.`,
            'Ajoute SUPPORT_LINK dans .env si tu veux afficher un groupe.',
            process.env.SUPPORT_LINK || process.env.SUPPORT_GROUP || '-',
          ].filter(Boolean),
        }),
      }, { quoted: message });
    }

    if (['script', 'sc'].includes(command)) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({
          title: 'Script',
          fields: [
            { icon: '🤖', label: 'Bot', value: config.BOT_NAME },
            { icon: '📦', label: 'Version', value: config.BOT_VERSION },
            { icon: '🔗', label: 'Repo', value: process.env.REPO_URL || '-' },
          ],
        }),
      }, { quoted: message });
    }

    const mem = process.memoryUsage();
    const cpus = os.cpus();
    return sock.sendMessage(jid, {
      text: MessageFormatter.panel({
        title: 'Statut Système',
        fields: [
          { icon: '👤', label: 'Utilisateur', value: actor.split('@')[0] },
          { icon: '🤖', label: 'Statut du bot', value: 'En ligne ✅' },
          { icon: '🕐', label: 'Uptime bot', value: formatSeconds(process.uptime()) },
          { icon: '💻', label: 'Uptime système', value: formatSeconds(os.uptime()) },
          { icon: '⚙️', label: 'Runtime', value: `Node ${process.version}` },
          { icon: '🧩', label: 'Plateforme', value: `${os.platform()} ${os.arch()}` },
          { icon: '🧠', label: 'CPU', value: cpus?.[0]?.model || '-' },
          { icon: '📊', label: 'Mémoire heap', value: `${memoryMb(mem.heapUsed)} / ${memoryMb(mem.heapTotal)}` },
          { icon: '📌', label: 'Mémoire RSS', value: memoryMb(mem.rss) },
        ],
      }),
    }, { quoted: message });
  },
};
