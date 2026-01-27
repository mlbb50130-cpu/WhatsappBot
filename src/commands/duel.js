const RandomUtils = require('../utils/random');
const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'duel',
  description: 'Défier un utilisateur en duel',
  category: 'COMBATS',
  usage: '!duel @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 15,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
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

    // Reset chakra if 24h passed
    const now = new Date();
    const maxChakra = 100 + (user.level - 1) * 10;
    let needsChakraReset = false;
    let hoursDiff = 0;
    
    // Initialize maxChakra if not defined
    if (!user.maxChakra) {
      user.maxChakra = maxChakra;
    }
    
    // Check if chakra needs to be reset
    if (user.chakra === undefined || user.chakra === null) {
      user.chakra = maxChakra;
      user.lastChakraReset = now;
      needsChakraReset = true;
      hoursDiff = 0;
    } else if (!user.lastChakraReset) {
      user.lastChakraReset = now;
      needsChakraReset = true;
      hoursDiff = 0;
    } else {
      // Only reset if 24 hours have passed
      const lastReset = new Date(user.lastChakraReset);
      hoursDiff = (now - lastReset) / (1000 * 60 * 60);
      if (hoursDiff >= 24) {
        user.chakra = maxChakra;
        user.lastChakraReset = now;
        hoursDiff = 0; // Reset counter after reset
        needsChakraReset = true;
      }
    }
    
    // Only save if chakra was reset
    if (needsChakraReset) {
      await user.save();
    }

    if (user.chakra <= 0) {
      await sock.sendMessage(senderJid, {
        text: `❌ Ton chakra est épuisé (${user.chakra}/${maxChakra})!\n⏰ Il se réinitialisera en ${Math.ceil(24 - hoursDiff)}h`
      });
      return;
    }

    // Duel costs 20 chakra
    const chakraCost = 20;
    user.chakra -= chakraCost;

    // Create duel
    const attackerPower = (user.powerLevel || 100) + user.level * 10 + RandomUtils.range(10, 50);
    const defenderPower = (opponent.powerLevel || 100) + opponent.level * 10 + RandomUtils.range(10, 50);

    const winner = attackerPower > defenderPower ? 'attacker' : 'defender';
    const difference = Math.abs(attackerPower - defenderPower);

    // Update stats
    user.stats.duels += 1;
    
    // Update quest progress
    if (QuestSystem.needsDailyReset(user)) {
      QuestSystem.resetDailyQuests(user);
    }
    if (QuestSystem.needsWeeklyReset(user)) {
      QuestSystem.resetWeeklyQuests(user);
    }
    
    if (winner === 'attacker') {
      user.stats.wins += 1;
      user.xp += 30;
      user.powerLevel = (user.powerLevel || 100) + 5; // +5 power per win
      opponent.stats.losses += 1;
      
      // Update daily quest - gained a duel win
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }
      QuestSystem.updateDailyProgress(user, 'duels', 1);
    } else {
      user.stats.losses += 1;
      opponent.stats.wins += 1;
      opponent.xp += 30;
      opponent.powerLevel = (opponent.powerLevel || 100) + 5; // +5 power per win
      
      // Update daily quest for opponent
      if (QuestSystem.needsDailyReset(opponent)) {
        QuestSystem.resetDailyQuests(opponent);
      }
      QuestSystem.updateDailyProgress(opponent, 'duels', 1);
    }

    await user.save();
    await opponent.save();

    const result = [
      `⚔️ DUEL ⚔️`,
      ``,
      `👥 COMBATTANTS:`,
      `${MessageFormatter.elegantBox('🔴 𝔄𝔗𝔗𝔄𝔔𝔘𝔄𝔑𝔗', [
        { label: '👤 Nom', value: user.username },
        { label: '🎖️ Niveau', value: user.level.toString() },
        { label: '⚡ Puissance', value: attackerPower.toString() }
      ])}`,
      ``,
      `${MessageFormatter.elegantBox('🔵 𝔇É𝔉𝔈𝔑𝔖𝔈𝔘𝔕', [
        { label: '👤 Nom', value: opponent.username },
        { label: '🎖️ Niveau', value: opponent.level.toString() },
        { label: '⚡ Puissance', value: defenderPower.toString() }
      ])}`,
      ``,
      `${MessageFormatter.elegantBox(winner === 'attacker' ? '🏆 VICTOIRE!' : '💔 DÉFAITE!', [
        { label: '👤 Gagnant', value: winner === 'attacker' ? user.username : opponent.username },
        { label: '💫 Récompense', value: '+30 XP' },
        { label: '📊 Différence', value: `${difference} points` },
        { label: '🔵 Chakra', value: `${user.chakra}/${maxChakra}` }
      ])}`
    ].join('\n');

    await sock.sendMessage(senderJid, { text: result });
  }
};
