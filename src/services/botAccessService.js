const config = require('../config');
const BotSettings = require('../models/BotSettings');
const {
  cleanJid,
  jidDigits,
  jidMatches,
  uniqueJids,
} = require('../utils/jid');

function digits(jid = '') {
  return jidDigits(jid);
}

function normalizeJid(value = '') {
  return cleanJid(value);
}

function isOwner(jid = '') {
  const candidates = uniqueJids(jid);
  if (candidates.length === 0) return false;
  return (config.ADMIN_JIDS || []).some((owner) => jidMatches(owner, candidates));
}

async function isModerator(jid = '') {
  if (isOwner(jid)) return true;
  const settings = await BotSettings.getGlobal();
  const moderators = Array.isArray(settings.moderators) ? settings.moderators : [];
  const candidates = uniqueJids(jid);
  return moderators.some((mod) => jidMatches(mod, candidates));
}

async function canUseBot(jid = '', botJid = '') {
  const settings = await BotSettings.getGlobal();
  if (settings.botMode === 'public') return true;
  if (settings.botMode === 'private') return isModerator(jid);
  if (settings.botMode === 'self') {
    return isOwner(jid) || (botJid && jidMatches(jid, botJid));
  }
  return true;
}

async function addModerator(jid) {
  const normalized = normalizeJid(jid);
  if (!normalized) throw new Error('JID invalide');
  const settings = await BotSettings.getGlobal();
  if (!Array.isArray(settings.moderators)) settings.moderators = [];
  if (!settings.moderators.some((mod) => jidMatches(mod, normalized))) {
    settings.moderators.push(normalized);
    await settings.save();
  }
  return settings;
}

async function removeModerator(jid) {
  const normalized = normalizeJid(jid);
  const settings = await BotSettings.getGlobal();
  const moderators = Array.isArray(settings.moderators) ? settings.moderators : [];
  settings.moderators = moderators.filter((mod) => !jidMatches(mod, normalized));
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
