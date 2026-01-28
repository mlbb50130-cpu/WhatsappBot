const axios = require('axios');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function sanitizeQuestions(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((q) => {
      const question = typeof q.question === 'string' ? q.question.trim() : '';
      const options = Array.isArray(q.options) ? q.options.map(o => String(o).trim()) : [];
      const correct = Number.isInteger(q.correct) ? q.correct : -1;
      let reward = Number.isInteger(q.reward) ? q.reward : 25;
      if (reward < 10) reward = 10;
      if (reward > 50) reward = 50;
      return { question, options, correct, reward };
    })
    .filter(q => q.question && q.options.length === 4 && q.correct >= 0 && q.correct <= 3);
}

async function generateAnimeQuizQuestions(count = 5, topic = 'anime et manga (difficile)') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY manquant');
  }

  const prompt = `Génère ${count} questions de quiz difficiles sur ${topic}.\n` +
    `Chaque question doit avoir 4 options. Retourne uniquement un JSON array d'objets: ` +
    `[{"question":"...","options":["A","B","C","D"],"correct":0-3,"reward":20-30}].`;

  const response = await axios.post(
    `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Tu es un générateur de quiz anime/manga. Réponds en JSON strict.\n${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  let parsed = [];
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // Try to extract JSON array from text
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      parsed = JSON.parse(match[0]);
    }
  }

  return sanitizeQuestions(parsed);
}

module.exports = {
  generateAnimeQuizQuestions
};
