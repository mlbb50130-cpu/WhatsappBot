const config = require('../config');
const BotSettings = require('../models/BotSettings');

function digits(jid = '') {
  return String(jid).split('@')[0].replace(/\D/g, '');
}

function normalizeJid(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  const number = raw.replace(/\D/g, '');
  return number ? `${number}@s.whatsapp.net` : '';
}

function isOwner(jid = '') {
  const userDigits = digits(jid);
  return config.ADMIN_JIDS.some((owner) => {
    const ownerDigits = digits(owner);
    return owner === jid || (ownerDigits && ownerDigits === userDigits);
  });
}

async function isModerator(jid = '') {
  if (isOwner(jid)) return true;
  const settings = await BotSettings.getGlobal();
  const moderators = Array.isArray(settings.moderators) ? settings.moderators : [];
  const userDigits = digits(jid);
  return moderators.some((mod) => {
    const modDigits = digits(mod);
    return mod === jid || (modDigits && modDigits === userDigits);
  });
}

async function canUseBot(jid = '', botJid = '') {
  const settings = await BotSettings.getGlobal();
  if (settings.botMode === 'public') return true;
  if (settings.botMode === 'private') return isModerator(jid);
  if (settings.botMode === 'self') {
    return isOwner(jid) || (botJid && digits(jid) === digits(botJid));
  }
  return true;
}

async function addModerator(jid) {
  const normalized = normalizeJid(jid);
  if (!normalized) throw new Error('JID invalide');
  const settings = await BotSettings.getGlobal();
  if (!Array.isArray(settings.moderators)) settings.moderators = [];
  if (!settings.moderators.some((mod) => digits(mod) === digits(normalized))) {
    settings.moderators.push(normalized);
    await settings.save();
  }
  return settings;
}

async function removeModerator(jid) {
  const normalized = normalizeJid(jid);
  const settings = await BotSettings.getGlobal();
  const moderators = Array.isArray(settings.moderators) ? settings.moderators : [];
  settings.moderators = moderators.filter((mod) => digits(mod) !== digits(normalized));
  await settings.save();
  return settings;
}

async function setMode(mode) {
  const safeMode = String(mode || '').toLowerCase();
  if (!['public', 'private', 'self'].includes(safeMode)) {
    throw new Error('Mode invalide: public, private ou self.');
  }

  const settings = await BotSettings.getGlobal();
  settings.botMode = safeMode;
  await settings.save();
  return settings;
}

module.exports = {
  addModerator,
  canUseBot,
  digits,
  isModerator,
  isOwner,
  normalizeJid,
  removeModerator,
  setMode,
};
