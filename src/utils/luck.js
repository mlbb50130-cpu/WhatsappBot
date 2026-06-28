// Systeme de chance ACTIF.
// !chance pose un buff de chance (0-100%) pendant 30 minutes. Ce buff influence
// loot / roulette / surprise tant qu'il est actif. Sans buff actif: chance neutre (50).

const BUFF_DURATION_MS = 30 * 60 * 1000;
const NEUTRAL = 50;

function isBuffActive(user) {
  return !!(user.luckBuff && user.luckBuff.expiresAt && new Date(user.luckBuff.expiresAt).getTime() > Date.now());
}

function minutesLeft(user) {
  if (!isBuffActive(user)) return 0;
  return Math.max(1, Math.ceil((new Date(user.luckBuff.expiresAt).getTime() - Date.now()) / 60000));
}

// Chance effective 0..100 (buff actif sinon neutre).
function getActiveLuck(user) {
  return isBuffActive(user) ? Math.max(0, Math.min(100, user.luckBuff.percent || 0)) : NEUTRAL;
}

// Tire un nouveau buff (1-100%) valable 30 min. Mute user (l'appelant sauvegarde).
function applyBuff(user) {
  const percent = Math.floor(Math.random() * 100) + 1;
  user.luckBuff = { percent, expiresAt: new Date(Date.now() + BUFF_DURATION_MS) };
  return percent;
}

function luckFactor(user) {
  return getActiveLuck(user) / 100;
}

// Multiplicateur de poids de loot par rarete selon la chance active.
function lootRarityMultiplier(rarity, user) {
  const f = luckFactor(user);
  switch (rarity) {
    case 'exotic':
    case 'legendary': return 1 + 1.5 * f;
    case 'epic': return 1 + 1.0 * f;
    case 'rare': return 1 + 0.5 * f;
    case 'common':
    default: return 1 - 0.5 * f;
  }
}

// Probabilite de victoire (0.20 a 0.80) centree sur 0.5 a chance neutre.
function winProbability(user) {
  const luck = getActiveLuck(user);
  return Math.max(0.2, Math.min(0.8, 0.5 + (luck - 50) / 200));
}

module.exports = {
  BUFF_DURATION_MS,
  isBuffActive,
  minutesLeft,
  getActiveLuck,
  applyBuff,
  luckFactor,
  lootRarityMultiplier,
  winProbability,
};
