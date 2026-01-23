// Utility to load asset files as buffer (for local files)
function getAssetBuffer(folderName, fileName) {
  const path = require('path');
  const fs = require('fs');
  
  const assetPath = path.join(__dirname, '../asset', folderName, fileName);
  
  if (!fs.existsSync(assetPath)) {
    console.error(`Asset not found: ${assetPath}`);
    return null;
  }
  
  return fs.readFileSync(assetPath);
}

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

module.exports = { getAssetUrl, getAssetBuffer };
