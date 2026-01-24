const DAILY_QUESTS = [
  { id: 1, emoji: '💬', name: 'Bavard du jour', goal: 50, description: 'Écris 50 messages', reward: 200, stat: 'messages' },
  { id: 2, emoji: '⚔️', name: 'Guerrier du jour', goal: 3, description: 'Gagne 3 duels', reward: 300, stat: 'duels' },
  { id: 3, emoji: '📚', name: 'Quiz expert', goal: 5, description: 'Réponds correctement à 5 quiz', reward: 250, stat: 'quizCorrect' }
];

const WEEKLY_QUESTS = [
  { id: 101, emoji: '💎', name: 'Looteur chanceux', goal: 10, description: 'Ouvre 10 loots', reward: 500, stat: 'loots' },
  { id: 102, emoji: '🏆', name: 'Champion', goal: 10, description: 'Atteins le niveau 10', reward: 1000, stat: 'level' }
];

class QuestSystem {
  static getDailyQuests() {
    return DAILY_QUESTS;
  }

  static getWeeklyQuests() {
    return WEEKLY_QUESTS;
  }

  // Check if daily quests need reset (24h)
  static needsDailyReset(user) {
    if (!user.dailyQuests || !user.dailyQuests.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(user.dailyQuests.lastReset).getTime();
    return (now - lastReset) >= (24 * 60 * 60 * 1000);
  }

  // Check if weekly quests need reset (7 jours)
  static needsWeeklyReset(user) {
    if (!user.weeklyQuests || !user.weeklyQuests.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(user.weeklyQuests.lastReset).getTime();
    return (now - lastReset) >= (7 * 24 * 60 * 60 * 1000);
  }

  // Reset daily quests
  static resetDailyQuests(user) {
    user.dailyQuests = {
      lastReset: new Date(),
      progress: {
        messages: 0,
        duels: 0,
        quizCorrect: 0
      },
      completed: []
    };
  }

  // Reset weekly quests
  static resetWeeklyQuests(user) {
    user.weeklyQuests = {
      lastReset: new Date(),
      progress: {
        loots: 0,
        level: user.level || 1
      },
      completed: []
    };
  }

  // Update daily quest progress
  static updateDailyProgress(user, stat, amount = 1) {
    if (!user.dailyQuests) {
      this.resetDailyQuests(user);
    }

    if (user.dailyQuests.progress[stat] !== undefined) {
      user.dailyQuests.progress[stat] += amount;
    }

    this.checkDailyQuestCompletion(user);
  }

  // Update weekly quest progress
  static updateWeeklyProgress(user, stat, amount = 1) {
    if (!user.weeklyQuests) {
      this.resetWeeklyQuests(user);
    }

    if (stat === 'level') {
      user.weeklyQuests.progress[stat] = amount; // Set directly for level
    } else if (user.weeklyQuests.progress[stat] !== undefined) {
      user.weeklyQuests.progress[stat] += amount;
    }

    this.checkWeeklyQuestCompletion(user);
  }

  // Check if daily quests are completed
  static checkDailyQuestCompletion(user) {
    if (!user.dailyQuests) return;

    DAILY_QUESTS.forEach(quest => {
      if (!user.dailyQuests.completed.includes(quest.id)) {
        if (user.dailyQuests.progress[quest.stat] >= quest.goal) {
          user.dailyQuests.completed.push(quest.id);
        }
      }
    });
  }

  // Check if weekly quests are completed
  static checkWeeklyQuestCompletion(user) {
    if (!user.weeklyQuests) return;

    WEEKLY_QUESTS.forEach(quest => {
      if (!user.weeklyQuests.completed.includes(quest.id)) {
        if (user.weeklyQuests.progress[quest.stat] >= quest.goal) {
          user.weeklyQuests.completed.push(quest.id);
        }
      }
    });
  }

  // Get quest reward total
  static getDailyReward(user) {
    if (!user.dailyQuests || !user.dailyQuests.completed) return 0;
    return user.dailyQuests.completed.reduce((total, questId) => {
      const quest = DAILY_QUESTS.find(q => q.id === questId);
      return total + (quest ? quest.reward : 0);
    }, 0);
  }

  static getWeeklyReward(user) {
    if (!user.weeklyQuests || !user.weeklyQuests.completed) return 0;
    return user.weeklyQuests.completed.reduce((total, questId) => {
      const quest = WEEKLY_QUESTS.find(q => q.id === questId);
      return total + (quest ? quest.reward : 0);
    }, 0);
  }
}

module.exports = QuestSystem;
