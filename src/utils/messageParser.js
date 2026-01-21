/**
 * 📝 Message Parser - Extract mentions and arguments from messages
 */

class MessageParser {
  /**
   * Extract all @mentions from a message
   */
  static extractMentions(message) {
    try {
      // Try extendedTextMessage mentions (most common)
      const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentions.length > 0) {
        return mentions;
      }

      // Try quoted message (reply to message)
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        const quotedJid = message.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedJid) {
          return [quotedJid];
        }
      }

      return [];
    } catch (error) {
      console.error('Error extracting mentions:', error.message);
      return [];
    }
  }

  /**
   * Parse arguments, excluding @mentions
   */
  static parseArgs(messageText, prefix) {
    try {
      const withoutPrefix = messageText.slice(prefix.length).trim();
      const args = withoutPrefix.split(/\s+/);
      
      // Remove command name (first arg)
      args.shift();
      
      // Filter out mentions (they start with @)
      return args.filter(arg => !arg.startsWith('@'));
    } catch (error) {
      console.error('Error parsing args:', error.message);
      return [];
    }
  }

  /**
   * Get first mention from message
   */
  static getFirstMention(message) {
    const mentions = this.extractMentions(message);
    return mentions.length > 0 ? mentions[0] : null;
  }

  /**
   * Check if message has mentions
   */
  static hasMentions(message) {
    return this.extractMentions(message).length > 0;
  }

  /**
   * Extract reason text (everything after first mention)
   */
  static extractReason(messageText, prefix) {
    try {
      const withoutPrefix = messageText.slice(prefix.length).trim();
      const args = withoutPrefix.split(/\s+/);
      
      // Remove command and first @mention
      args.shift(); // command
      if (args[0]?.startsWith('@')) {
        args.shift(); // @mention
      }
      
      return args.join(' ') || 'Aucune raison spécifiée';
    } catch (error) {
      console.error('Error extracting reason:', error.message);
      return 'Aucune raison spécifiée';
    }
  }

  /**
   * Get username from mention JID
   */
  static formatJid(jid) {
    if (!jid) return 'Utilisateur';
    return jid.split('@')[0];
  }
}

module.exports = MessageParser;
