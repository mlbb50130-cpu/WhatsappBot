// Systeme de quetes a rotation.
// Chaque jour: 5 quetes tirees de DAILY_POOL. Chaque semaine: 3 de WEEKLY_POOL.
// Les objectifs reutilisent les stats deja suivies: messages, duels, quizCorrect,
// loots (hebdo), level (hebdo). Recompenses en XP + Gold.

const DAILY_COUNT = 5;
const WEEKLY_COUNT = 3;

const DAILY_POOL = [
  { id: 1, emoji: '💬', name: 'Bavard', stat: 'messages', goal: 30, reward: 150, gold: 80, description: 'Ecris 30 messages' },
  { id: 2, emoji: '🗣️', name: 'Pipelette', stat: 'messages', goal: 50, reward: 200, gold: 120, description: 'Ecris 50 messages' },
  { id: 3, emoji: '📢', name: 'Orateur', stat: 'messages', goal: 80, reward: 300, gold: 180, description: 'Ecris 80 messages' },
  { id: 4, emoji: '📣', name: 'Animateur du chat', stat: 'messages', goal: 120, reward: 420, gold: 260, description: 'Ecris 120 messages' },
  { id: 5, emoji: '🔥', name: 'Maitre du chat', stat: 'messages', goal: 200, reward: 600, gold: 400, description: 'Ecris 200 messages' },
  { id: 6, emoji: '⚔️', name: 'Bagarreur', stat: 'duels', goal: 1, reward: 120, gold: 60, description: 'Gagne 1 duel' },
  { id: 7, emoji: '🛡️', name: 'Guerrier', stat: 'duels', goal: 3, reward: 250, gold: 150, description: 'Gagne 3 duels' },
  { id: 8, emoji: '🏆', name: 'Champion d\'arene', stat: 'duels', goal: 5, reward: 400, gold: 250, description: 'Gagne 5 duels' },
  { id: 9, emoji: '👑', name: 'Invaincu', stat: 'duels', goal: 8, reward: 600, gold: 400, description: 'Gagne 8 duels' },
  { id: 10, emoji: '📚', name: 'Etudiant', stat: 'quizCorrect', goal: 3, reward: 150, gold: 80, description: 'Reussis 3 quiz' },
  { id: 11, emoji: '🎓', name: 'Quiz expert', stat: 'quizCorrect', goal: 5, reward: 250, gold: 150, description: 'Reussis 5 quiz' },
  { id: 12, emoji: '🧠', name: 'Cerveau otaku', stat: 'quizCorrect', goal: 8, reward: 350, gold: 220, description: 'Reussis 8 quiz' },
  { id: 13, emoji: '🌟', name: 'Genie du quiz', stat: 'quizCorrect', goal: 12, reward: 500, gold: 350, description: 'Reussis 12 quiz' },
];

const WEEKLY_POOL = [
  { id: 101, emoji: '💬', name: 'Voix de la semaine', stat: 'messages', goal: 300, reward: 800, gold: 500, description: 'Ecris 300 messages cette semaine' },
  { id: 102, emoji: '📣', name: 'Legende du chat', stat: 'messages', goal: 600, reward: 1500, gold: 1000, description: 'Ecris 600 messages cette semaine' },
  { id: 103, emoji: '⚔️', name: 'Gladiateur', stat: 'duels', goal: 15, reward: 1000, gold: 700, description: 'Gagne 15 duels cette semaine' },
  { id: 104, emoji: '👑', name: 'Seigneur de guerre', stat: 'duels', goal: 30, reward: 2000, gold: 1500, description: 'Gagne 30 duels cette semaine' },
  { id: 105, emoji: '📚', name: 'Erudit', stat: 'quizCorrect', goal: 25, reward: 1000, gold: 700, description: 'Reussis 25 quiz cette semaine' },
  { id: 106, emoji: '🧠', name: 'Maitre du savoir', stat: 'quizCorrect', goal: 50, reward: 1800, gold: 1200, description: 'Reussis 50 quiz cette semaine' },
  { id: 107, emoji: '💎', name: 'Looteur', stat: 'loots', goal: 10, reward: 800, gold: 500, description: 'Ouvre 10 loots cette semaine' },
  { id: 108, emoji: '💠', name: 'Chasseur de tresors', stat: 'loots', goal: 25, reward: 1500, gold: 1000, description: 'Ouvre 25 loots cette semaine' },
  { id: 109, emoji: '⭐', name: 'Ascension', stat: 'level', goal: 10, reward: 1000, gold: 700, description: 'Atteins le niveau 10' },
  { id: 110, emoji: '🌠', name: 'Elite', stat: 'level', goal: 20, reward: 2500, gold: 2000, description: 'Atteins le niveau 20' },
];

const DAILY_BY_ID = new Map(DAILY_POOL.map((q) => [q.id, q]));
const WEEKLY_BY_ID = new Map(WEEKLY_POOL.map((q) => [q.id, q]));

function pickRandomIds(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length)).map((q) => q.id);
}

class QuestSystem {
  static getDailyPool() { return DAILY_POOL; }
  static getWeeklyPool() { return WEEKLY_POOL; }

  // Quetes actives = celles assignees a l'utilisateur (resolues depuis le pool)
  static getActiveDailyQuests(user) {
    const ids = user.dailyQuests?.assigned || [];
    return ids.map((id) => DAILY_BY_ID.get(id)).filter(Boolean);
  }

  static getActiveWeeklyQuests(user) {
    const ids = user.weeklyQuests?.assigned || [];
    return ids.map((id) => WEEKLY_BY_ID.get(id)).filter(Boolean);
  }

  static needsDailyReset(user) {
    if (!user.dailyQuests || !user.dailyQuests.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(user.dailyQuests.lastReset).getTime();
    return (now - lastReset) >= (24 * 60 * 60 * 1000);
  }

  static needsWeeklyReset(user) {
    if (!user.weeklyQuests || !user.weeklyQuests.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(user.weeklyQuests.lastReset).getTime();
    return (now - lastReset) >= (7 * 24 * 60 * 60 * 1000);
  }

  static resetDailyQuests(user) {
    user.dailyQuests = {
      lastReset: new Date(),
      assigned: pickRandomIds(DAILY_POOL, DAILY_COUNT),
      progress: { messages: 0, duels: 0, quizCorrect: 0 },
      completed: [],
      validated: [],
    };
  }

  static resetWeeklyQuests(user) {
    user.weeklyQuests = {
      lastReset: new Date(),
      assigned: pickRandomIds(WEEKLY_POOL, WEEKLY_COUNT),
      progress: { messages: 0, duels: 0, quizCorrect: 0, loots: 0, level: user.level || 1 },
      completed: [],
      validated: [],
    };
  }

  // Assigne des quetes si aucune (migration des anciens comptes). Retourne true si change.
  static ensureDailyAssigned(user) {
    if (!user.dailyQuests) { this.resetDailyQuests(user); return true; }
    if (!Array.isArray(user.dailyQuests.assigned) || user.dailyQuests.assigned.length === 0) {
      user.dailyQuests.assigned = pickRandomIds(DAILY_POOL, DAILY_COUNT);
      return true;
    }
    return false;
  }

  static ensureWeeklyAssigned(user) {
    if (!user.weeklyQuests) { this.resetWeeklyQuests(user); return true; }
    if (!Array.isArray(user.weeklyQuests.assigned) || user.weeklyQuests.assigned.length === 0) {
      user.weeklyQuests.assigned = pickRandomIds(WEEKLY_POOL, WEEKLY_COUNT);
      return true;
    }
    return false;
  }

  static updateDailyProgress(user, stat, amount = 1) {
    if (!user.dailyQuests) this.resetDailyQuests(user);
    if (user.dailyQuests.progress[stat] !== undefined) {
      user.dailyQuests.progress[stat] += amount;
    }
    this.checkDailyQuestCompletion(user);
  }

  static updateWeeklyProgress(user, stat, amount = 1) {
    if (!user.weeklyQuests) this.resetWeeklyQuests(user);
    if (stat === 'level') {
      user.weeklyQuests.progress.level = amount; // valeur absolue
    } else if (user.weeklyQuests.progress[stat] !== undefined) {
      user.weeklyQuests.progress[stat] += amount;
    }
    this.checkWeeklyQuestCompletion(user);
  }

  static checkDailyQuestCompletion(user) {
    if (!user.dailyQuests) return;
    this.getActiveDailyQuests(user).forEach((quest) => {
      if (!user.dailyQuests.completed.includes(quest.id)
          && (user.dailyQuests.progress[quest.stat] || 0) >= quest.goal) {
        user.dailyQuests.completed.push(quest.id);
      }
    });
  }

  static checkWeeklyQuestCompletion(user) {
    if (!user.weeklyQuests) return;
    this.getActiveWeeklyQuests(user).forEach((quest) => {
      if (!user.weeklyQuests.completed.includes(quest.id)
          && (user.weeklyQuests.progress[quest.stat] || 0) >= quest.goal) {
        user.weeklyQuests.completed.push(quest.id);
      }
    });
  }

  static getDailyReward(user) {
    return this.getActiveDailyQuests(user)
      .filter((q) => (user.dailyQuests.completed || []).includes(q.id))
      .reduce((acc, q) => ({ xp: acc.xp + q.reward, gold: acc.gold + q.gold }), { xp: 0, gold: 0 });
  }

  static getWeeklyReward(user) {
    return this.getActiveWeeklyQuests(user)
      .filter((q) => (user.weeklyQuests.completed || []).includes(q.id))
      .reduce((acc, q) => ({ xp: acc.xp + q.reward, gold: acc.gold + q.gold }), { xp: 0, gold: 0 });
  }
}

module.exports = QuestSystem;
