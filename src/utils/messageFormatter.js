/**
 * 📝 Advanced Message Formatter Utility
 * Centralizes all message formatting for consistent styling across commands
 */

class MessageFormatter {
  // Color codes and styles
  static STYLES = {
    BOLD: '*',
    ITALIC: '_',
    MONO: '`',
    STRIKETHROUGH: '~',
  };

  static EMOJIS = {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    STAR: '⭐',
    FIRE: '🔥',
    CROWN: '👑',
    DIAMOND: '💎',
    GIFT: '🎁',
    ARROW: '➜',
    CHECK: '✓',
    CROSS: '✗',
  };

  // Unicode fancy characters
  static FANCY_CHARS = {
    H_THICK: '═',
    H_THIN: '─',
    V_THICK: '║',
    V_THIN: '│',
    TL_THICK: '╔',
    TR_THICK: '╗',
    BL_THICK: '╚',
    BR_THICK: '╝',
    TL_THIN: '┌',
    TR_THIN: '┐',
    BL_THIN: '└',
    BR_THIN: '┘',
    T_JUNCTION: '╦',
    B_JUNCTION: '╩',
    L_JUNCTION: '╠',
    R_JUNCTION: '╣',
    CROSS: '╬',
    BULLET: '▸',
    FILLED: '█',
    EMPTY: '░',
  };

  /**
   * Normalize fancy Unicode text
   */
  static normalizeTitle(text = '') {
    const map = {
      '𝔄': 'A', '𝔅': 'B', '𝔆': 'C', '𝔇': 'D', '𝔈': 'E', '𝔉': 'F', '𝔊': 'G',
      '𝔋': 'H', '𝔌': 'I', '𝔍': 'J', '𝔎': 'K', '𝔏': 'L', '𝔐': 'M', '𝔑': 'N',
      '𝔒': 'O', '𝔓': 'P', '𝔔': 'Q', '𝔕': 'R', '𝔖': 'S', '𝔗': 'T', '𝔘': 'U',
      '𝔙': 'V', '𝔚': 'W', '𝔛': 'X', '𝔜': 'Y', '𝔝': 'Z',
      '𝔞': 'a', '𝔟': 'b', '𝔠': 'c', '𝔡': 'd', '𝔢': 'e', '𝔣': 'f', '𝔤': 'g',
      '𝔥': 'h', '𝔦': 'i', '𝔧': 'j', '𝔨': 'k', '𝔩': 'l', '𝔪': 'm', '𝔫': 'n',
      '𝔬': 'o', '𝔭': 'p', '𝔮': 'q', '𝔯': 'r', '𝔰': 's', '𝔱': 't', '𝔲': 'u',
      '𝔳': 'v', '𝔴': 'w', '𝔵': 'x', '𝔶': 'y', '𝔷': 'z',
      'ℭ': 'C', 'ℌ': 'H', 'ℑ': 'I', 'ℜ': 'R', 'ℨ': 'Z'
    };
    return String(text).replace(/[𝔄𝔅𝔆𝔇𝔈𝔉𝔊𝔋𝔌𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔𝔕𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷ℭℌℑℜℨ]/g, (ch) => map[ch] || ch);
  }
  /**
   * Create a fancy box with thick borders
   * @param {string} title - Title text
   * @param {Array<{label: string, value: string}>} items - Content items
   * @param {number} width - Box width (default: 50)
   * @returns {string} Formatted box
   */
  static createBox(title = '', items = [], width = 50) {
    const C = this.FANCY_CHARS;
    const top = `${C.TL_THICK}${C.H_THICK.repeat(width - 2)}${C.TR_THICK}`;
    const bottom = `${C.BL_THICK}${C.H_THICK.repeat(width - 2)}${C.BR_THICK}`;

    let content = top + '\n';

    if (title) {
      const titleStr = ` ${this.normalizeTitle(title)} `;
      const padding = Math.max(0, width - titleStr.length - 2);
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      content += `${C.V_THICK}${' '.repeat(leftPad)}${titleStr}${' '.repeat(rightPad)}${C.V_THICK}\n`;
      content += `${C.L_JUNCTION}${C.H_THICK.repeat(width - 2)}${C.R_JUNCTION}\n`;
    }

    if (items.length > 0) {
      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const line = `${C.BULLET} ${item.label}: ${item.value}`;
        const padding = Math.max(0, width - line.length - 2);
        content += `${C.V_THICK}${line}${' '.repeat(padding)}${C.V_THICK}\n`;
      });
    }

    content += bottom;
    return content;
  }

  /**
   * Create error message
   * @param {string} message - Error message
   * @returns {string} Formatted error
   */
  static error(message) {
    return `❌ *ERREUR*\n\n${message}`;
  }

  /**
   * Create success message
   * @param {string} message - Success message
   * @returns {string} Formatted success
   */
  static success(message) {
    return `✅ *SUCCÈS*\n\n${message}`;
  }

  /**
   * Create warning message
   * @param {string} message - Warning message
   * @returns {string} Formatted warning
   */
  static warning(message) {
    return `⚠️ *ATTENTION*\n\n${message}`;
  }

  /**
   * Create info message
   * @param {string} message - Info message
   * @returns {string} Formatted info
   */
  static info(message) {
    return `ℹ️ *INFORMATION*\n\n${message}`;
  }

  /**
   * Create a progress bar
   * @param {number} current - Current value
   * @param {number} max - Maximum value
   * @param {number} length - Bar length
   * @returns {string} Progress bar
   */
  static progressBar(current, max, length = 15) {
    const percentage = Math.min((current / max) * 100, 100);
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(percentage);
    
    return `${bar} ${percent}%`;
  }

  /**
   * Create a divider line
   * @param {string} char - Character to use (default: ─)
   * @param {number} length - Length (default: 40)
   * @returns {string} Divider
   */
  static divider(char = '─', length = 40) {
    return char.repeat(length);
  }

  /**
   * Create a status message
   * @param {boolean} success - Success status
   * @param {string} message - Message content
   * @returns {string} Status message
   */
  static status(success, message) {
    const emoji = success ? this.EMOJIS.SUCCESS : this.EMOJIS.ERROR;
    const status = success ? '*✅ SUCCÈS*' : '*❌ ERREUR*';
    return `${emoji} ${status}\n${message}`;
  }

  /**
   * Create a formatted list
   * @param {Array<string>} items - List items
   * @param {string} type - 'bullet' (default), 'number', or 'arrow'
   * @returns {string} Formatted list
   */
  static list(items = [], type = 'bullet') {
    const bullets = {
      'bullet': '▸',
      'number': (i) => `${i + 1}.`,
      'arrow': '➜',
      'star': '⭐',
      'check': '✓'
    };

    const bullet = bullets[type] || bullets.bullet;
    return items.map((item, i) => {
      const prefix = typeof bullet === 'function' ? bullet(i) : bullet;
      return `${prefix} ${item}`;
    }).join('\n');
  }

  /**
   * Create a title with decorations
   * @param {string} text - Title text
   * @param {string} style - 'thick', 'thin', 'star', 'equal'
   * @returns {string} Decorated title
   */
  static title(text, style = 'thick') {
    const styles = {
      'thick': { top: '═', bottom: '═', char: '═' },
      'thin': { top: '─', bottom: '─', char: '─' },
      'star': { top: '★', bottom: '★', char: '★' },
      'equal': { top: '=', bottom: '=', char: '=' }
    };

    const s = styles[style] || styles.thick;
    const line = s.char.repeat(Math.max(text.length + 4, 30));
    return `${line}\n  ${text}\n${line}`;
  }

  /**
   * Create an ASCII table
   * @param {Array<string>} headers - Column headers
   * @param {Array<Array<string>>} rows - Table rows
   * @returns {string} Formatted table
   */
  static table(headers, rows) {
    if (!headers || headers.length === 0) return '';

    // Calculate column widths
    const widths = headers.map((h, i) => {
      let maxWidth = h.length;
      rows.forEach(row => {
        if (row[i]) maxWidth = Math.max(maxWidth, String(row[i]).length);
      });
      return maxWidth + 2;
    });

    // Build header
    const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('│');
    const separator = widths.map(w => '─'.repeat(w)).join('┼');

    // Build rows
    const dataRows = rows.map(row => {
      return row.map((cell, i) => String(cell || '').padEnd(widths[i])).join('│');
    });

    return `┌${separator.replace(/┼/g, '┬')}┐\n│${headerRow}│\n├${separator}┤\n${dataRows.map(r => `│${r}│`).join('\n')}\n└${separator.replace(/┼/g, '┴')}┘`;
  }

  /**
   * Create a list item
   * @param {string} icon - Icon/emoji
   * @param {string} label - Label text
   * @param {string} value - Value (optional)
   * @returns {string} List item
   */
  static listItem(icon, label, value = '') {
    return `${icon} ${label}${value ? ': ' + value : ''}`;
  }

  /**
   * Create a command help box
   * @param {string} command - Command name
   * @param {string} description - Description
   * @param {string} usage - Usage example
   * @param {Array<string>} examples - Usage examples
   * @returns {string} Help message
   */
  static commandHelp(command, description, usage, examples = []) {
    let content = `\n*📖 COMMANDE*: \`!${command}\`\n`;
    content += `*📝 DESCRIPTION*: ${description}\n`;
    content += `*💻 USAGE*: \`${usage}\`\n`;
    
    if (examples.length > 0) {
      content += `\n*📚 EXEMPLES*\n`;
      examples.forEach((ex, i) => {
        content += `  ${i + 1}. \`${ex}\`\n`;
      });
    }
    
    return content;
  }

  /**
   * Create a statistic display
   * @param {string} icon - Icon
   * @param {string} label - Label
   * @param {string|number} value - Value
   * @param {string} suffix - Optional suffix
   * @returns {string} Stat line
   */
  static stat(icon, label, value, suffix = '') {
    return `${icon} *${label}*: \`${value}\`${suffix}`;
  }

  /**
   * Create a menu item
   * @param {string} emoji - Emoji
   * @param {string} text - Text
   * @param {string} command - Optional command
   * @returns {string} Menu item
   */
  static menuItem(emoji, text, command = '') {
    return command ? `${emoji} ${text}\n   \`${command}\`` : `${emoji} ${text}`;
  }

  /**
   * Create elegant box (modern style)
   * @param {string} title - Title with emoji
   * @param {Array<{label: string, value: string}>} items - Items array
   * @returns {string} Elegant formatted box
   */
  static elegantBox(title = '', items = []) {
    const safeTitle = this.normalizeTitle(title);
    let content = `╭─ ${safeTitle} ─╮\n`;

    if (items.length > 0) {
      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const line = `├ ${item.label}: ${item.value}`;
        content += line + '\n';
      });
      content = content.slice(0, -1) + '\n';
    }

    content += `╰${'─'.repeat(Math.max(safeTitle.length + 5, 20))}╯`;
    return content;
  }

  /**
   * Create an elegant section with star bullets
   * @param {string} title - Section title
   * @param {Array<string>} items - Items to display
   * @returns {string} Formatted elegant section
   */
  static elegantSection(title, items = []) {
    const safeTitle = this.normalizeTitle(title);
    const lines = items.map((item, index) => {
      return `├ ☆ ${item}`;
    });
    
    const content = lines.join('\n');
    const borderLength = Math.max(safeTitle.length + 6, 30);
    
    return `╭───⟪ ${safeTitle} ⟫───╮\n${content}\n╰${'─'.repeat(borderLength)}╯`;
  }

  /**
   * Get a random image from LAKERSWaifu or NSFW theme folders
   * @returns {Buffer|null} Image buffer or null if no image found
   */
  static getRandomThemeImage(themeName = null) {
    const fs = require('fs');
    const path = require('path');

    try {
      const requestedTheme = (themeName && themeName !== 'default')
        ? themeName
        : (this._theme && this._theme !== 'default')
          ? this._theme
          : 'LAKERSWaifu';

      const assetDir = path.join(__dirname, '../asset');
      const folders = fs.readdirSync(assetDir).filter(f => {
        try {
          return fs.statSync(path.join(assetDir, f)).isDirectory();
        } catch {
          return false;
        }
      });

      const match = folders.find(f => f.toLowerCase() === requestedTheme.toLowerCase());
      const resolvedFolder = match || 'LAKERSWaifu';
      const themeDir = path.join(assetDir, resolvedFolder);
      
      if (!fs.existsSync(themeDir)) {
        console.warn(`Theme directory not found: ${themeDir}`);
        return null;
      }

      const images = fs.readdirSync(themeDir)
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map(file => path.join(themeDir, file));

      if (images.length === 0) return null;

      const randomImage = images[Math.floor(Math.random() * images.length)];
      return fs.readFileSync(randomImage);
    } catch (error) {
      console.error('Error getting theme image:', error.message);
      return null;
    }
  }

  /**
   * Create a message object with image and caption
   * @param {string} caption - Message caption
   * @returns {Object} Message object with image or just text
   */
  static createMessageWithImage(caption) {
    const image = this.getRandomThemeImage();
    
    if (image) {
      return {
        image: image,
        caption: caption
      };
    } else {
      return {
        text: caption
      };
    }
  }

  /**
   * Set current theme for image selection
   * @param {string} themeName
   */
  static setTheme(themeName) {
    this._theme = themeName || 'default';
  }

  /**
   * Create a reply function that automatically quotes messages
   * @param {object} sock - Socket connection
   * @param {object} message - Original message to reply to
   * @returns {function} Reply function
   */
  static createReplyFunction(sock, message) {
    const jid = message.key.remoteJid;
    const messageKey = message.key;
    
    return async (content, options = {}) => {
      try {
        if (typeof content === 'string') {
          // Pour du texte simple, ajouter quoted dans les options
          return await sock.sendMessage(jid, { 
            text: content,
            ...options
          }, { 
            quoted: message,
            ...options
          });
        } else if (typeof content === 'object') {
          // Pour du contenu complexe (image, etc)
          return await sock.sendMessage(jid, content, { 
            quoted: message,
            ...options
          });
        }
      } catch (error) {
        console.error('[REPLY] Error sending reply:', error.message);
        // Fallback: send without reply if error
        try {
          if (typeof content === 'string') {
            return await sock.sendMessage(jid, { text: content });
          } else if (typeof content === 'object') {
            return await sock.sendMessage(jid, content);
          }
        } catch (fallbackError) {
          console.error('[REPLY] Fallback also failed:', fallbackError.message);
          return null;
        }
      }
    };
  }
}

MessageFormatter._theme = 'default';

module.exports = MessageFormatter;
