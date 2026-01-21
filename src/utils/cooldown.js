const cooldowns = new Map();

class CooldownManager {
  static set(userId, commandName, durationMs) {
    const key = `${userId}-${commandName}`;
    const expiresAt = Date.now() + durationMs;
    cooldowns.set(key, expiresAt);
  }

  static get(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expiresAt = cooldowns.get(key);

    if (!expiresAt) return null;

    if (Date.now() > expiresAt) {
      cooldowns.delete(key);
      return null;
    }

    return expiresAt - Date.now();
  }

  static isOnCooldown(userId, commandName) {
    return this.get(userId, commandName) !== null;
  }

  static getRemainingTime(userId, commandName) {
    const remaining = this.get(userId, commandName);
    return remaining ? Math.ceil(remaining / 1000) : 0;
  }

  static clear(userId, commandName) {
    const key = `${userId}-${commandName}`;
    cooldowns.delete(key);
  }

  static clearAll() {
    cooldowns.clear();
  }
}

// Cleanup old cooldowns every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of cooldowns.entries()) {
    if (now > expiresAt) {
      cooldowns.delete(key);
    }
  }
}, 60000);

module.exports = CooldownManager;
