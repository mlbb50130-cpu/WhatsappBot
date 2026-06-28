// Logique de combat centralisee: chakra + puissance.
// Source unique pour duel.js, chakra.js, powerlevel.js.

const CHAKRA_RESET_MS = 24 * 60 * 60 * 1000;
const POWER_MIN = 50; // plancher du rating de combat

function getMaxChakra(user) {
  return 100 + (((user && user.level) || 1) - 1) * 10;
}

// Reinitialise le chakra a plein si 24h ecoulees / non initialise, et le borne.
// Mute l'objet user. Retourne true si une modification a eu lieu.
function refreshChakra(user) {
  const max = getMaxChakra(user);
  let changed = false;

  if (user.maxChakra !== max) { user.maxChakra = max; changed = true; }

  if (user.chakra === undefined || user.chakra === null) {
    user.chakra = max;
    user.lastChakraReset = new Date();
    changed = true;
  } else if (!user.lastChakraReset) {
    user.lastChakraReset = new Date();
    changed = true;
  } else {
    const elapsed = Date.now() - new Date(user.lastChakraReset).getTime();
    if (elapsed >= CHAKRA_RESET_MS) {
      user.chakra = max;
      user.lastChakraReset = new Date();
      changed = true;
    }
  }

  // Bornage
  if (user.chakra > max) { user.chakra = max; changed = true; }
  if (user.chakra < 0) { user.chakra = 0; changed = true; }

  return changed;
}

function hoursUntilReset(user) {
  if (!user.lastChakraReset) return 24;
  const elapsed = Date.now() - new Date(user.lastChakraReset).getTime();
  return Math.max(0, Math.ceil((CHAKRA_RESET_MS - elapsed) / (1000 * 60 * 60)));
}

// Rating de combat brut (independant du chakra).
function basePower(user) {
  return Math.max(POWER_MIN, (user.powerLevel || 100) + ((user.level || 1) * 10));
}

// Ratio de chakra 0..1.
function chakraRatio(user) {
  const max = getMaxChakra(user);
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, (user.chakra || 0) / max));
}

// Puissance effective en combat: le chakra module jusqu'a +/-15%.
function combatPower(user) {
  return basePower(user) * (0.85 + 0.15 * chakraRatio(user));
}

// Probabilite que A batte B, proportionnelle a la puissance (upsets possibles).
function winProbability(attacker, defender) {
  const a = combatPower(attacker);
  const b = combatPower(defender);
  const total = a + b;
  if (total <= 0) return 0.5;
  return a / total;
}

// Ajustement type ELO: gain inversement proportionnel a la probabilite de gagner.
// Battre un plus fort rapporte gros; battre un plus faible rapporte peu.
function ratingDelta(winnerProb, K = 24) {
  return Math.max(1, Math.round(K * (1 - winnerProb)));
}

module.exports = {
  POWER_MIN,
  getMaxChakra,
  refreshChakra,
  hoursUntilReset,
  basePower,
  chakraRatio,
  combatPower,
  winProbability,
  ratingDelta,
};
