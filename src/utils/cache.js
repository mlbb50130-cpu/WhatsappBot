// 🎨 Gestionnaire de cache pour les APIs
const crypto = require('crypto');

class CacheManager {
  constructor(ttl = 3600000, maxSize = 1000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.timestamps = new Map();
    
    // Cleanup toutes les 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 600000);
  }

  /**
   * Ajoute un élément au cache
   */
  set(key, value, ttl = this.ttl) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.timestamps.entries())
        .sort((a, b) => a[1] - b[1])[0][0];
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  /**
   * Récupère un élément du cache
   */
  get(key) {
    const expiresAt = this.timestamps.get(key);
    
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Vérifie si une clé existe
   */
  has(key) {
    return this.get(key) !== null && this.get(key) !== undefined;
  }

  /**
   * Supprime une clé
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Vide le cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Supprime les éléments expirés
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, expiresAt] of this.timestamps) {
      if (now > expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });

  }

  /**
   * Retourne les stats du cache
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: `${Math.round((this.cache.size / this.maxSize) * 100)}%`,
      ttl: this.ttl
    };
  }

  /**
   * Génère une clé de cache pour une API call
   */
  static generateKey(endpoint, params = {}) {
    const str = `${endpoint}:${JSON.stringify(params)}`;
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Destructeur
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

module.exports = CacheManager;
