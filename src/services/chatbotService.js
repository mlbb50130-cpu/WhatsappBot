const config = require('../config');
const BotSettings = require('../models/BotSettings');
const MessageFormatter = require('../utils/messageFormatter');
const { getCharacter } = require('../data/botCharacters');

const conversations = new Map();
const missingKeyWarnings = new Map();

function cleanJid(jid = '') {
  const value = String(jid || '');
  const [local, domain] = value.split('@');
  if (!local || !domain) return value;
  return `${local.split(':')[0]}@${domain}`;
}

function jidDigits(jid = '') {
  return cleanJid(jid).split('@')[0].replace(/\D/g, '');
}

function getContextInfo(message) {
  const content = message?.message || {};
  const nodes = [
    content.extendedTextMessage,
    content.imageMessage,
    content.videoMessage,
    content.audioMessage,
    content.documentMessage,
    content.stickerMessage,
  ];

  return nodes.find((node) => node?.contextInfo)?.contextInfo || {};
}

function getMentionedJids(message) {
  const contextInfo = getContextInfo(message);
  return Array.isArray(contextInfo.mentionedJid) ? contextInfo.mentionedJid : [];
}

function getQuotedParticipant(message) {
  return getContextInfo(message).participant || '';
}

function getBotJids(sock) {
  const values = [
    sock?.user?.id,
    sock?.user?.lid,
    sock?.user?.jid,
  ].filter(Boolean);

  return values.map(cleanJid);
}

function isBotMentionedOrQuoted(sock, message) {
  const botJids = getBotJids(sock);
  const botDigits = botJids.map(jidDigits).filter(Boolean);
  const targets = [...getMentionedJids(message), getQuotedParticipant(message)].filter(Boolean);

  return targets.some((target) => {
    const cleanedTarget = cleanJid(target);
    const targetDigits = jidDigits(target);

    return botJids.includes(cleanedTarget) ||
      (targetDigits && botDigits.includes(targetDigits));
  });
}

function getApiKey() {
  const raw = config.GEMINI_API_KEY || '';
  const keys = raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  if (keys.length === 0) return '';
  return keys[Math.floor(Math.random() * keys.length)];
}

function buildSystemPrompt(character) {
  return [
    `Tu es ${config.BOT_NAME}, un bot WhatsApp otaku/RPG.`,
    `Tu reponds avec le style du personnage "${character.name}" : ${character.tone}.`,
    'Tu n es pas Atlas MD et tu ne pretends pas etre humain.',
    'Reponds en francais par defaut, sauf si l utilisateur parle une autre langue.',
    'Garde les reponses courtes, naturelles et utiles pour WhatsApp.',
    'Evite les longs paragraphes, les grosses listes et les emojis excessifs.',
    'Si une demande est dangereuse, illegale ou abusive, refuse brievement.',
  ].join('\n');
}

function getGeminiSdkConfig(character) {
  return {
    thinkingConfig: { thinkingBudget: 0 },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
    systemInstruction: [{ text: buildSystemPrompt(character) }],
  };
}

function getHistory(chatJid) {
  if (!conversations.has(chatJid)) {
    conversations.set(chatJid, []);
  }

  return conversations.get(chatJid);
}

function addToHistory(chatJid, role, text) {
  const history = getHistory(chatJid);
  history.push({ role, text: String(text || '').slice(0, 1200) });

  while (history.length > 8) {
    history.shift();
  }
}

function buildContents(chatJid, prompt) {
  const history = getHistory(chatJid).map((entry) => ({
    role: entry.role,
    parts: [{ text: entry.text }],
  }));

  return [
    ...history,
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];
}

async function generateReply(prompt, chatJid, character) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY manquant');
    error.code = 'MISSING_GEMINI_KEY';
    throw error;
  }

  let GoogleGenAI;
  try {
    ({ GoogleGenAI } = await import('@google/genai'));
  } catch (error) {
    const sdkError = new Error('@google/genai manquant. Lance npm install.');
    sdkError.code = 'MISSING_GENAI_SDK';
    throw sdkError;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = config.GEMINI_MODEL || 'gemini-flash-lite-latest';
  const result = await ai.models.generateContent({
    model,
    config: getGeminiSdkConfig(character),
    contents: buildContents(chatJid, prompt),
  });

  const text = String(result.text || '').trim();

  if (!text) {
    throw new Error('Reponse Gemini vide');
  }

  addToHistory(chatJid, 'user', prompt);
  addToHistory(chatJid, 'model', text);

  return MessageFormatter.limitText(MessageFormatter.compactText(text), 10, 900);
}

async function warnMissingKeyOnce(sock, jid, message) {
  const now = Date.now();
  const lastWarning = missingKeyWarnings.get(jid) || 0;
  if (now - lastWarning < 10 * 60 * 1000) return;

  missingKeyWarnings.set(jid, now);
  await sock.sendMessage(jid, {
    text: MessageFormatter.warning('Chatbot active, mais GEMINI_API_KEY est absent dans l environnement.'),
  }, { quoted: message });
}

async function getSettings() {
  return BotSettings.getGlobal();
}

async function setPmEnabled(enabled) {
  const settings = await BotSettings.getGlobal();
  settings.chatbot.pmEnabled = Boolean(enabled);
  await settings.save();
  return settings;
}

async function setSelectedCharacter(characterId) {
  const character = getCharacter(characterId);
  const settings = await BotSettings.getGlobal();
  settings.chatbot.selectedCharacter = character.id;
  await settings.save();
  return character;
}

async function handleIncomingMessage(sock, message, options = {}) {
  if (message.key?.fromMe) return false;

  const text = String(options.text || '').trim();
  if (!text) return false;

  const jid = message.key.remoteJid;
  const isGroup = Boolean(options.isGroup);
  const settings = await BotSettings.getGlobal();
  const character = getCharacter(settings.chatbot.selectedCharacter);

  if (isGroup) {
    const groupDoc = options.groupDoc;
    const groupActive = groupDoc?.isActive !== false;
    const groupChatbotEnabled = groupDoc?.features?.chatbot === true;

    if (!groupActive || !groupChatbotEnabled || !isBotMentionedOrQuoted(sock, message)) {
      return false;
    }
  } else if (!settings.chatbot.pmEnabled) {
    return false;
  }

  try {
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);
    const reply = await generateReply(text, jid, character);
    await sock.sendMessage(jid, { text: reply }, { quoted: message });
    await sock.sendPresenceUpdate('paused', jid).catch(() => null);
    return true;
  } catch (error) {
    await sock.sendPresenceUpdate('paused', jid).catch(() => null);

    if (error.code === 'MISSING_GEMINI_KEY') {
      await warnMissingKeyOnce(sock, jid, message);
      return true;
    }

    console.error('[CHATBOT] Error:', error.message);
    await sock.sendMessage(jid, {
      text: MessageFormatter.error('Le chatbot ne peut pas repondre pour le moment.'),
    }, { quoted: message });
    return true;
  }
}

module.exports = {
  getSettings,
  setPmEnabled,
  setSelectedCharacter,
  generateReply,
  handleIncomingMessage,
  isBotMentionedOrQuoted,
};
