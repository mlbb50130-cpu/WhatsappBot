// COMMANDE: !build <type> - Builds recommandées
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'build',
  aliases: ['builds', 'items'],
  category: 'Gaming',
  description: 'Builds optimisées pour chaque type',
  usage: '!build <type>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args, user, isGroup) {
    const from = message.key.remoteJid;
    const senderJid = message.key.participant || from;

    if (!args[0]) {
      const buildTypes = Object.keys(mlbbData.builds).join(', ');
      return sock.sendMessage(from, {
        text: `❌ Spécifie un type de build!\n\n*Types disponibles:*\n${buildTypes}`
      });
    }

    const buildKey = args.join('_').toLowerCase();
    const build = mlbbData.builds[buildKey];

    if (!build) {
      return sock.sendMessage(from, {
        text: `❌ Build "${args.join(' ')}" non trouvée!\n\nTypes: ${Object.keys(mlbbData.builds).join(', ')}`
      });
    }

    const buildInfo = `
╔════════════════════════════════════╗
║     🛠️ ${build.name.toUpperCase()} 🛠️      ║
╚════════════════════════════════════╝

*📦 ITEMS (DANS L'ORDRE):*
${build.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

✅ *AVANTAGES*
${build.advantages.map(a => `├ ${a}`).join('\n')}

⚠️ *INCONVÉNIENTS*
${build.disadvantages.map(d => `├ ${d}`).join('\n')}

💡 *CONSEIL DE BUILD*
• Adapte selon l'ennemi et la composition
• Les boots dépendent de la situation
• La dernière item peut être flexible
• Vise toujours l'efficacité en combat

*🎯 BUILDS DISPONIBLES:*
${Object.keys(mlbbData.builds).join(' • ')}
`;

    return sock.sendMessage(from, { text: buildInfo });
  }
};
