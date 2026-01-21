// Common link patterns
const LINK_PATTERNS = [
  /(https?:\/\/[^\s]+)/gi,
  /(www\.[^\s]+)/gi,
  /([a-zA-Z0-9-]+\.[a-z]+[^\s]*)/gi,
];

class AntiLinkManager {
  static hasLink(text) {
    if (!text || typeof text !== 'string') return false;

    for (const pattern of LINK_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  static extractLinks(text) {
    if (!text || typeof text !== 'string') return [];

    const links = [];
    for (const pattern of LINK_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        links.push(...matches);
      }
    }
    return [...new Set(links)]; // Remove duplicates
  }

  static removeLinks(text) {
    if (!text || typeof text !== 'string') return text;

    let cleaned = text;
    for (const pattern of LINK_PATTERNS) {
      cleaned = cleaned.replace(pattern, '[LIEN SUPPRIMÉ]');
    }
    return cleaned;
  }
}

module.exports = AntiLinkManager;
