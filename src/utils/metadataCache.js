// 🔄 Cache système pour éviter le rate-limiting de WhatsApp
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAYS = [500, 1000, 2000]; // Progressive delay in ms

/**
 * Récupère les métadonnées du groupe avec cache et retry
 * @param {Object} sock - Socket WhatsApp
 * @param {String} groupJid - ID du groupe
 * @returns {Promise<Object|null>} Métadonnées du groupe ou null
 */
async function getGroupMetadataWithCache(sock, groupJid) {
  // Vérifier le cache
  const cached = cache.get(groupJid);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Retry avec délai exponentiel
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const metadata = await sock.groupMetadata(groupJid);
      
      // Mettre en cache
      cache.set(groupJid, {
        data: metadata,
        timestamp: Date.now()
      });
      
      return metadata;
    } catch (error) {
      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        
        // En cas d'erreur, retourner les données en cache même expirées si disponibles
        if (cached) {
          return cached.data;
        }
        
        return null;
      }
    }
  }
}

/**
 * Invalide le cache pour un groupe (après changement de paramètres)
 */
function invalidateGroupCache(groupJid) {
  cache.delete(groupJid);
}

/**
 * Nettoie le cache des entrées expirées
 */
function cleanupExpiredCache() {
  const now = Date.now();
  let count = 0;
  
  for (const [groupJid, data] of cache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      cache.delete(groupJid);
      count++;
    }
  }
  
  if (count > 0) {
  }
}

// Nettoyer le cache toutes les heures
setInterval(cleanupExpiredCache, 60 * 60 * 1000);

module.exports = {
  getGroupMetadataWithCache,
  invalidateGroupCache,
  cleanupExpiredCache
};
