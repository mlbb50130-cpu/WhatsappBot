const RandomUtils = require('../utils/random');
const MessageParser = require('../utils/messageParser');
const User = require('../models/User');

module.exports = {
  name: 'duel',
  description: 'Défier un utilisateur en duel (Max 5x par jour)',
  category: 'COMBATS',
  usage: '!duel @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 60,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    // Check 5x per day limit
    const now = Date.now();
    const today = new Date(now).toDateString();
    if (!user.duelsToday) user.duelsToday = { date: today, count: 0 };
    
    if (user.duelsToday.date !== today) {
      user.duelsToday = { date: today, count: 0 };
    }
    
    if (user.duelsToday.count >= 5) {
      await sock.sendMessage(senderJid, {
        text: '⚠️ Tu as atteint la limite de 5 duels par jour!\nReviens demain! 😴'
      });
      return;
    }

    // Extract mention using new parser
    const mentions = MessageParser.extractMentions(message);
    
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: \`!duel @user\`\nMentionne le joueur que tu veux affronter!'
      });
      return;
    }

    const opponentJid = mentions[0];

    if (opponentJid === participantJid) {
      await sock.sendMessage(senderJid, {
        text: '❌ Tu ne peux pas te battre contre toi-même!'
      });
      return;
    }

    // Get opponent data
    const User = require('../models/User');
    const opponent = await User.findOne({ jid: opponentJid });

    if (!opponent) {
      await sock.sendMessage(senderJid, {
        text: '❌ Cet utilisateur n\'existe pas dans la base de données.'
      });
      return;
    }

    // Create duel
    const attackerPower = user.level * 10 + RandomUtils.range(10, 50);
    const defenderPower = opponent.level * 10 + RandomUtils.range(10, 50);

    const winner = attackerPower > defenderPower ? 'attacker' : 'defender';
    const difference = Math.abs(attackerPower - defenderPower);

    // Update stats
    user.stats.duels += 1;
    user.duelsToday.count += 1;
    if (winner === 'attacker') {
      user.stats.wins += 1;
      user.xp += 30;
      opponent.stats.losses += 1;
    } else {
      user.stats.losses += 1;
      opponent.stats.wins += 1;
      opponent.xp += 30;
    }

    await user.save();
    await opponent.save();

    const result = `
╔════════════════════════════════════════╗
║             ⚔️ DUEL ⚔️                 ║
╚════════════════════════════════════════╝

*ATTAQUANT:*
  ├─ 👤 ${user.username}
  ├─ 🎖️ Niveau ${user.level}
  └─ ⚡ Puissance: ${attackerPower}

*VS*

*DÉFENSEUR:*
  ├─ 👤 ${opponent.username}
  ├─ 🎖️ Niveau ${opponent.level}
  └─ ⚡ Puissance: ${defenderPower}

════════════════════════════════════════

${winner === 'attacker' ? `🏆 ${user.username} GAGNE!\n+30 XP` : `🏆 ${opponent.username} GAGNE!\n+30 XP`}

Différence: ${difference} points
════════════════════════════════════════
`;

    await sock.sendMessage(senderJid, { text: result });
  }
};
