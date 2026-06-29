const fs = require('fs');
const path = require('path');
const Group = require('../models/Group');
const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

const QUIZZES_PATH = path.join(__dirname, '../data/quizzes.json');
const DAILY_LIMIT = 10;
const TIME_LIMIT_MS = 30000;

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeQuiz(quiz, index) {
  const id = Number(quiz.id ?? index + 1);
  const correct = Number(quiz.correct);

  if (!Number.isInteger(id) || id <= 0) return null;
  if (!Array.isArray(quiz.options) || quiz.options.length !== 4) return null;
  if (!Number.isInteger(correct) || correct < 0 || correct >= quiz.options.length) return null;
  if (!quiz.question) return null;

  return {
    id,
    category: quiz.category || 'general',
    type: quiz.type || 'anime',
    question: String(quiz.question),
    options: quiz.options.map((option) => String(option)),
    correct,
    reward: Number.isFinite(Number(quiz.reward)) ? Number(quiz.reward) : 100,
  };
}

function sendQuizMessage(sock, jid, reply, content) {
  const payload = MessageFormatter.createMessageWithImage(content);
  return reply ? reply(payload) : sock.sendMessage(jid, payload);
}

function sendText(sock, jid, reply, text) {
  return reply ? reply({ text }) : sock.sendMessage(jid, { text });
}

module.exports = {
  name: 'quiz',
  description: 'Lancer un quiz otaku',
  category: 'QUIZ',
  usage: '!quiz [sujet]',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  getQuizzes() {
    try {
      const data = fs.readFileSync(QUIZZES_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const seenIds = new Set();
      return parsed
        .map(normalizeQuiz)
        .filter((quiz) => {
          if (!quiz || seenIds.has(quiz.id)) return false;
          seenIds.add(quiz.id);
          return true;
        });
    } catch {
      return [];
    }
  },

  buildFilter(args = [], baseFilter = {}) {
    const query = normalizeText(args.join(' '));
    return {
      type: baseFilter.type ? normalizeText(baseFilter.type) : '',
      category: baseFilter.category ? normalizeText(baseFilter.category) : '',
      query,
    };
  },

  filterQuizzes(quizzes, filter) {
    return quizzes.filter((quiz) => {
      const type = normalizeText(quiz.type);
      const category = normalizeText(quiz.category);
      const question = normalizeText(quiz.question);

      if (filter.type && type !== filter.type) return false;
      if (filter.category && category !== filter.category) return false;
      if (!filter.query) return true;

      return type.includes(filter.query)
        || category.includes(filter.query)
        || question.includes(filter.query);
    });
  },

  async getGroup(senderJid, groupData) {
    const groupName = groupData?.subject || groupData?.groupName || groupData?.name || senderJid;

    const group = await Group.findOneAndUpdate(
      { groupJid: senderJid },
      { $setOnInsert: { groupJid: senderJid, groupName } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    if (!group.quizStats) {
      group.quizStats = {};
    }

    group.quizStats.count = Number(group.quizStats.count || 0);
    group.quizStats.seenIds = Array.isArray(group.quizStats.seenIds) ? group.quizStats.seenIds : [];
    group.quizStats.resets = Number(group.quizStats.resets || 0);
    group.quizStats.lastReset = group.quizStats.lastReset || new Date();

    return group;
  },

  async pickQuizForGroup(senderJid, groupData, pool) {
    const group = await this.getGroup(senderJid, groupData);
    const poolIds = new Set(pool.map((quiz) => quiz.id));
    let seenIds = new Set((group.quizStats.seenIds || []).map(Number));
    let available = pool.filter((quiz) => !seenIds.has(quiz.id));
    let resetPool = false;

    if (available.length === 0) {
      group.quizStats.seenIds = (group.quizStats.seenIds || [])
        .map(Number)
        .filter((id) => !poolIds.has(id));
      group.quizStats.resets += 1;
      group.quizStats.lastReset = new Date();
      seenIds = new Set(group.quizStats.seenIds);
      available = pool.filter((quiz) => !seenIds.has(quiz.id));
      resetPool = true;
    }

    const quiz = RandomUtils.choice(available);
    if (!quiz) return null;

    if (!group.quizStats.seenIds.map(Number).includes(quiz.id)) {
      group.quizStats.seenIds.push(quiz.id);
    }
    group.quizStats.count += 1;
    group.markModified('quizStats');
    await group.save();

    return {
      quiz,
      resetPool,
      count: group.quizStats.count,
    };
  },

  async checkDailyLimit(sock, senderJid, reply, user) {
    const today = new Date();
    if (!user.quizUsageToday) {
      user.quizUsageToday = { lastReset: today, count: 0 };
    }

    const lastReset = new Date(user.quizUsageToday.lastReset || 0);
    if (lastReset.toDateString() !== today.toDateString()) {
      user.quizUsageToday.lastReset = today;
      user.quizUsageToday.count = 0;
    }

    if (user.quizUsageToday.count >= DAILY_LIMIT) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning(`Limite atteinte: ${DAILY_LIMIT} quiz par jour.`));
      return false;
    }

    return true;
  },

  async launchQuiz(sock, message, args, user, isGroup, groupData, reply, baseFilter = {}) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    if (!isGroup) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning('Cette commande fonctionne uniquement en groupe.'));
      return;
    }

    if (!global.quizSessions) global.quizSessions = new Map();
    if (global.quizSessions.has(senderJid)) {
      await sendText(sock, senderJid, reply, MessageFormatter.warning('Un quiz est deja en cours dans ce groupe.'));
      return;
    }

    if (!(await this.checkDailyLimit(sock, senderJid, reply, user))) {
      await user.save();
      return;
    }

    const allQuizzes = this.getQuizzes();
    if (allQuizzes.length === 0) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Aucun quiz disponible.'));
      return;
    }

    const filter = this.buildFilter(args, baseFilter);
    const pool = this.filterQuizzes(allQuizzes, filter);
    if (pool.length === 0) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Aucun quiz ne correspond a ce sujet.'));
      return;
    }

    const picked = await this.pickQuizForGroup(senderJid, groupData, pool);
    if (!picked) {
      await sendText(sock, senderJid, reply, MessageFormatter.error('Impossible de choisir un quiz.'));
      return;
    }

    const { quiz, resetPool, count } = picked;
    const options = quiz.options
      .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
      .join('\n');

    const questionItems = [
      { label: 'Serie', value: quiz.category },
      { label: 'Question', value: quiz.question },
      { label: 'Options', value: options },
      { label: 'Temps', value: `${TIME_LIMIT_MS / 1000}s` },
      { label: 'Recompense', value: `+${quiz.reward} XP` },
    ];

    if (resetPool) {
      questionItems.push({ label: 'Pool', value: 'Reinitialise pour ce sujet' });
    }

    const title = baseFilter.title || 'QUIZ OTAKU';
    const quizMessage = MessageFormatter.elegantBox(title, questionItems);
    await sendQuizMessage(sock, senderJid, reply, quizMessage);

    user.quizUsageToday.count += 1;
    await user.save();

    global.quizSessions.set(senderJid, {
      quiz,
      quizId: quiz.id,
      timestamp: Date.now(),
      answered: new Map(),
      launchedBy: participantJid,
      launchedByName: user.username || 'Unknown',
      groupQuizCount: count,
    });

    setTimeout(() => {
      if (!global.quizSessions.has(senderJid)) return;

      const session = global.quizSessions.get(senderJid);
      if (session.quizId !== quiz.id) return;

      if (session.answered.size === 0) {
        sock.sendMessage(senderJid, {
          text: MessageFormatter.warning(`Temps ecoule! La bonne reponse etait: ${String.fromCharCode(65 + quiz.correct)}. ${quiz.options[quiz.correct]}`),
        });
      }

      global.quizSessions.delete(senderJid);
    }, TIME_LIMIT_MS);
  },

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    await this.launchQuiz(sock, message, args, user, isGroup, groupData, reply);
  },
};
