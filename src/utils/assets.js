// Utility to generate asset URLs
function getAssetUrl(folderName, fileName, isLocal = false) {
  if (isLocal || process.env.NODE_ENV === 'development') {
    // Local development - use file:// protocol
    const path = require('path');
    return `file://${path.join(__dirname, '../asset', folderName, fileName)}`;
  }
  
  // Production (Railway) - use HTTP URL
  const baseUrl = process.env.BOT_URL || 'http://localhost:3000';
  return `${baseUrl}/assets/${folderName}/${fileName}`;
}

module.exports = { getAssetUrl };
