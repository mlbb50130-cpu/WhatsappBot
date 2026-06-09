const fs = require('fs');
const path = require('path');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const Access = require('../services/botAccessService');

function stripPrefix(value = '') {
  const text = String(value || '').trim();
  if (text.startsWith(config.PREFIX)) return text.slice(config.PREFIX.length);
  return text.replace(/^!/, '');
}

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, files);
    else if (item.name.endsWith('.js')) files.push(full);
  }
  return files;
}

module.exports = {
  name: 'getcmd',
  aliases: ['getplugin', 'cmdfile'],
  description: 'Envoyer le fichier source local d une commande',
  category: 'BOT',
  usage: '!getcmd <commande>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    if (!(await Access.isModerator(actor))) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Commande reservee au proprietaire ou aux moderateurs du bot.'),
      }, { quoted: message });
    }

    const needle = stripPrefix(args[0]).toLowerCase();
    if (!needle) {
      return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !getcmd <commande>') }, { quoted: message });
    }

    const commandDir = path.join(process.cwd(), 'src', 'commands');
    for (const file of walk(commandDir)) {
      try {
        delete require.cache[require.resolve(file)];
        const mod = require(file);
        const names = [mod.name, ...(mod.aliases || [])].filter(Boolean).map((name) => String(name).toLowerCase());
        if (names.includes(needle)) {
          return sock.sendMessage(jid, {
            document: fs.readFileSync(file),
            fileName: path.basename(file),
            mimetype: 'text/javascript',
          }, { quoted: message });
        }
      } catch {
        // Ignore broken command files.
      }
    }

    return sock.sendMessage(jid, { text: MessageFormatter.warning('Commande introuvable.') }, { quoted: message });
  },
};
