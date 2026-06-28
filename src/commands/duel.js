const RandomUtils = require('../utils/random');
const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'duel',
  description: 'Défier un utilisateur en duel',
  category: 'COMBATS',
  usage: '!duel @user [nombre de duels]',
  adminOnly: false,
  groupOnly: true,
  cooldown: 15,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    // Parse mention
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length === 0) {
      if (reply) {
        await reply({ text: '❌ Utilisation: \`!duel @user [nombre]\`\nMentionne le joueur que tu veux affronter!\n\n💡 Exemple: !duel @user 5' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Utilisation: \`!duel @user [nombre]\`\nMentionne le joueur que tu veux affronter!\n\n💡 Exemple: !duel @user 5' });
      }
      return;
    }

    const opponentJid = mentions[0];

    if (opponentJid === participantJid) {
      if (reply) {
        await reply({ text: '❌ Tu ne peux pas te battre contre toi-même!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Tu ne peux pas te battre contre toi-même!' });
      }
      return;
    }

    // Get number of duels from args (default 1, max 10)
    let duelCount = 1;
    if (args[1]) {
      const parsed = parseInt(args[1]);
      if (!isNaN(parsed) && parsed > 0) {
        duelCount = Math.min(parsed, 10); // Max 10 duels per command
      }
    }

    // Get opponent data
    const User = require('../models/User');
    const opponent = await User.findOne({ jid: opponentJid });

    if (!opponent) {
      if (reply) {
        await reply({ text: '❌ Cet utilisateur n\'existe pas dans la base de données.' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Cet utilisateur n\'existe pas dans la base de données.' });
      }
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

    // Duel costs 20 chakra per duel
    const chakraCost = 20 * duelCount;
    
    if (user.chakra < chakraCost) {
      await sock.sendMessage(senderJid, {
        text: `❌ Chakra insuffisant!\n📊 Tu as besoin de ${chakraCost} chakra mais tu n'en as que ${user.chakra}/${maxChakra}`
      });
      return;
    }

    user.chakra -= chakraCost;

    // Execute multiple duels
    let duelResults = [];
    let totalWins = 0;
    let totalLosses = 0;
    let totalXpGained = 0;
    let totalDifference = 0;

    for (let i = 0; i < duelCount; i++) {
      // Create duel
      const attackerPower = (user.powerLevel || 100) + user.level * 10 + RandomUtils.range(10, 50);
      const defenderPower = (opponent.powerLevel || 100) + opponent.level * 10 + RandomUtils.range(10, 50);

      const winner = attackerPower > defenderPower ? 'attacker' : 'defender';
      const difference = Math.abs(attackerPower - defenderPower);
      totalDifference += difference;

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
        user.powerLevel = (user.powerLevel || 100) + 5;
        opponent.stats.losses += 1;
        totalWins++;
        totalXpGained += 30;
        
        // Update daily quest
        if (QuestSystem.needsDailyReset(user)) {
          QuestSystem.resetDailyQuests(user);
        }
        QuestSystem.updateDailyProgress(user, 'duels', 1);
        QuestSystem.updateWeeklyProgress(user, 'duels', 1);
      } else {
        user.stats.losses += 1;
        opponent.stats.wins += 1;
        opponent.xp += 30;
        opponent.powerLevel = (opponent.powerLevel || 100) + 5;
        totalLosses++;
        
        // Update daily quest for opponent
        if (QuestSystem.needsDailyReset(opponent)) {
          QuestSystem.resetDailyQuests(opponent);
        }
        QuestSystem.updateDailyProgress(opponent, 'duels', 1);
        QuestSystem.updateWeeklyProgress(opponent, 'duels', 1);
      }

      duelResults.push({
        duelNum: i + 1,
        winner,
        attackerPower,
        defenderPower,
        difference
      });
    }

    await user.save();
    await opponent.save();

    // Format results
    const result = [
      `⚔️ DUELS MULTIPLES ⚔️ (${duelCount})`,
      ``,
      `👥 COMBATTANTS:`,
      `${MessageFormatter.elegantBox('🔴 ATTAQUANT', [
        { label: '👤 Nom', value: user.username },
        { label: '🎖️ Niveau', value: user.level.toString() },
        { label: '⚡ Victoires', value: totalWins.toString() }
      ])}`,
      ``,
      `${MessageFormatter.elegantBox('🔵 DÉFENSEUR', [
        { label: '👤 Nom', value: opponent.username },
        { label: '🎖️ Niveau', value: opponent.level.toString() },
        { label: '⚡ Victoires', value: totalLosses.toString() }
      ])}`,
      ``,
      `${MessageFormatter.elegantBox('📊 RÉSUMÉ', [
        { label: '✅ Duels gagnés', value: totalWins.toString() },
        { label: '❌ Duels perdus', value: totalLosses.toString() },
        { label: '💫 XP gagnés', value: totalXpGained.toString() },
        { label: '📈 Différence totale', value: totalDifference.toString() },
        { label: '🔵 Chakra restant', value: `${user.chakra}/${maxChakra}` }
      ])}`
    ].join('\n');

    if (reply) {
        await reply({ text: result });
      } else {
        await sock.sendMessage(senderJid, { text: result });
      }
  }
};
