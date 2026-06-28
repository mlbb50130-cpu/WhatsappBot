const QuestSystem = require('../utils/questSystem');
const MessageFormatter = require('../utils/messageFormatter');
const Combat = require('../utils/combat');
const User = require('../models/User');

const CHAKRA_PER_DUEL = 20;
const XP_WIN = 30;
const XP_LOSS = 8;

module.exports = {
  name: 'duel',
  description: 'Defier un utilisateur en duel',
  category: 'COMBATS',
  usage: '!duel @user [nombre de duels]',
  adminOnly: false,
  groupOnly: true,
  cooldown: 15,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length === 0) {
      await send({ text: '❌ Utilisation: `!duel @user [nombre]`\nMentionne le joueur a affronter. Ex: !duel @user 5' });
      return;
    }

    const opponentJid = mentions[0];
    if (opponentJid === participantJid) {
      await send({ text: '❌ Tu ne peux pas te battre contre toi-meme!' });
      return;
    }

    let duelCount = 1;
    if (args[1]) {
      const parsed = parseInt(args[1], 10);
      if (!isNaN(parsed) && parsed > 0) duelCount = Math.min(parsed, 10);
    }

    const opponent = await User.findOne({ jid: opponentJid });
    if (!opponent) {
      await send({ text: '❌ Cet utilisateur n\'existe pas dans la base de donnees.' });
      return;
    }

    // Chakra (rafraichi via la logique centralisee)
    Combat.refreshChakra(user);
    Combat.refreshChakra(opponent);
    const maxChakra = Combat.getMaxChakra(user);
    const chakraCost = CHAKRA_PER_DUEL * duelCount;

    if ((user.chakra || 0) < chakraCost) {
      await user.save();
      await send({
        text: `❌ Chakra insuffisant!\n📊 Besoin de ${chakraCost}, tu as ${user.chakra}/${maxChakra}\n⏰ Reset dans ${Combat.hoursUntilReset(user)}h`,
      });
      return;
    }

    // On paie le chakra: combattre draine -> baisse la puissance effective
    user.chakra -= chakraCost;

    // Resets de quetes une seule fois
    if (QuestSystem.needsDailyReset(user)) QuestSystem.resetDailyQuests(user);
    if (QuestSystem.needsWeeklyReset(user)) QuestSystem.resetWeeklyQuests(user);
    if (QuestSystem.needsDailyReset(opponent)) QuestSystem.resetDailyQuests(opponent);
    if (QuestSystem.needsWeeklyReset(opponent)) QuestSystem.resetWeeklyQuests(opponent);

    const firstWinProb = Combat.winProbability(user, opponent);
    const powerBefore = user.powerLevel || 100;

    let totalWins = 0;
    let totalLosses = 0;
    let totalXp = 0;

    for (let i = 0; i < duelCount; i++) {
      const winProb = Combat.winProbability(user, opponent);
      const attackerWins = Math.random() < winProb;

      user.stats.duels += 1;
      opponent.stats.duels += 1;

      if (attackerWins) {
        const delta = Combat.ratingDelta(winProb); // peu si favori, beaucoup si upset
        user.powerLevel = (user.powerLevel || 100) + delta;
        opponent.powerLevel = Math.max(Combat.POWER_MIN, (opponent.powerLevel || 100) - delta);
        user.stats.wins += 1;
        opponent.stats.losses += 1;
        user.xp += XP_WIN;
        opponent.xp += XP_LOSS;
        totalWins += 1;
        totalXp += XP_WIN;
        QuestSystem.updateDailyProgress(user, 'duels', 1);
        QuestSystem.updateWeeklyProgress(user, 'duels', 1);
      } else {
        const delta = Combat.ratingDelta(1 - winProb);
        opponent.powerLevel = (opponent.powerLevel || 100) + delta;
        user.powerLevel = Math.max(Combat.POWER_MIN, (user.powerLevel || 100) - delta);
        opponent.stats.wins += 1;
        user.stats.losses += 1;
        opponent.xp += XP_WIN;
        user.xp += XP_LOSS;
        totalLosses += 1;
        totalXp += XP_LOSS;
        QuestSystem.updateDailyProgress(opponent, 'duels', 1);
        QuestSystem.updateWeeklyProgress(opponent, 'duels', 1);
      }
    }

    await user.save();
    await opponent.save();

    const powerChange = (user.powerLevel || 100) - powerBefore;
    const powerChangeStr = `${powerChange >= 0 ? '+' : ''}${powerChange}`;

    const result = [
      `⚔️ DUEL ⚔️ (${duelCount})`,
      ``,
      MessageFormatter.elegantBox('🔴 ATTAQUANT', [
        { label: '👤 Nom', value: user.username },
        { label: '🎖️ Niveau', value: String(user.level) },
        { label: '⚡ Puissance', value: String(Math.round(Combat.combatPower(user))) },
      ]),
      MessageFormatter.elegantBox('🔵 DEFENSEUR', [
        { label: '👤 Nom', value: opponent.username },
        { label: '🎖️ Niveau', value: String(opponent.level) },
        { label: '⚡ Puissance', value: String(Math.round(Combat.combatPower(opponent))) },
      ]),
      MessageFormatter.elegantBox('📊 RESULTAT', [
        { label: '🎯 Chance de victoire', value: `${Math.round(firstWinProb * 100)}%` },
        { label: '✅ Gagnes', value: String(totalWins) },
        { label: '❌ Perdus', value: String(totalLosses) },
        { label: '💫 XP', value: `+${totalXp}` },
        { label: '🏅 Power', value: `${powerChangeStr} (${user.powerLevel})` },
        { label: '🔵 Chakra', value: `${user.chakra}/${maxChakra}` },
      ]),
    ].join('\n');

    await send({ text: result });
  },
};
