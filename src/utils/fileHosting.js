const fs = require('fs');
const config = require('../config');

let currentTtlMs = config.FILE_HOSTING_TTL_MS;

// Retourne l'URL de base publique du serveur.
// Priorite: PUBLIC_URL (env) > RAILWAY_PUBLIC_DOMAIN > localhost
function getPublicBaseUrl() {
  const pub = process.env.PUBLIC_URL;
  if (pub) return pub.replace(/\/$/, '');

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railway) return `https://${railway.replace(/\/$/, '')}`;

  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

function getFileUrl(fileName) {
  return `${getPublicBaseUrl()}/files/${encodeURIComponent(fileName)}`;
}

function scheduleFileDeletion(filePath) {
  setTimeout(() => {
    fs.unlink(filePath, () => {});
  }, currentTtlMs);
}

function setTtl(ms) {
  currentTtlMs = ms;
}

function getTtl() {
  return currentTtlMs;
}

function getTtlLabel() {
  const totalSec = Math.floor(currentTtlMs / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) return `${totalMin}min`;
  const totalH = Math.floor(totalMin / 60);
  if (totalH < 24) return `${totalH}h`;
  return `${Math.floor(totalH / 24)}j`;
}

module.exports = { getFileUrl, scheduleFileDeletion, setTtl, getTtl, getTtlLabel };
