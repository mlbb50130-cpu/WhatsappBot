// Systeme de chance partage.
// La chance du jour est DETERMINISTE (meme valeur toute la journee pour un user),
// pour que !chance affiche reellement ce qui influence loot/roulette/surprise.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Chance du jour: 0 a 100, stable pour un utilisateur sur la journee.
function getDailyLuck(user) {
  const d = new Date();
  const key = `${user?.jid || 'anon'}-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  return hashString(key) % 101;
}

// Facteur 0..1 derive de la chance.
function luckFactor(user) {
  return getDailyLuck(user) / 100;
}

// Multiplicateur de poids de loot par rarete selon la chance.
// Chance haute -> plus de rare/epic/legendary, moins de common.
function lootRarityMultiplier(rarity, user) {
  const f = luckFactor(user);
  switch (rarity) {
    case 'legendary': return 1 + 1.5 * f;
    case 'epic': return 1 + 1.0 * f;
    case 'rare': return 1 + 0.5 * f;
    case 'common':
    default: return 1 - 0.5 * f; // jusqu'a -50% a chance max
  }
}

// Probabilite de victoire (0.25 a 0.75) centree sur 0.5 a chance moyenne.
function winProbability(user) {
  const luck = getDailyLuck(user);
  return Math.max(0.2, Math.min(0.8, 0.5 + (luck - 50) / 200));
}

module.exports = {
  getDailyLuck,
  luckFactor,
  lootRarityMultiplier,
  winProbability,
};
