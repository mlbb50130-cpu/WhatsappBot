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
    console.log(`📦 [CACHE] Métadonnées du groupe ${groupJid} (fraîches)`);
    return cached.data;
  }

  // Retry avec délai exponentiel
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      console.log(`🔄 Fetching metadata for ${groupJid} (attempt ${attempt + 1})`);
      const metadata = await sock.groupMetadata(groupJid);
      
      // Mettre en cache
      cache.set(groupJid, {
        data: metadata,
        timestamp: Date.now()
      });
      
      console.log(`✅ Métadonnées récupérées et mises en cache pour ${groupJid}`);
      return metadata;
    } catch (error) {
      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        console.warn(`⚠️  Tentative ${attempt + 1} échouée, retry dans ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`❌ Impossible de récupérer les métadonnées après ${attempt + 1} tentatives: ${error.message}`);
        
        // En cas d'erreur, retourner les données en cache même expirées si disponibles
        if (cached) {
          console.log(`📦 Utilisation des métadonnées en cache (expirées) comme fallback`);
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
  console.log(`🗑️  Cache invalidé pour ${groupJid}`);
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
    console.log(`🧹 ${count} entrées expirées supprimées du cache`);
  }
}

// Nettoyer le cache toutes les heures
setInterval(cleanupExpiredCache, 60 * 60 * 1000);

module.exports = {
  getGroupMetadataWithCache,
  invalidateGroupCache,
  cleanupExpiredCache
};
