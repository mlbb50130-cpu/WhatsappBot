/**
 * 📝 Message Formatter Utility
 * Centralizes all message formatting for consistent styling across commands
 */

class MessageFormatter {
  /**
   * Create a styled message box
   * @param {string} title - Title of the box
   * @param {string} content - Main content
   * @param {string} emoji - Optional emoji for title
   * @returns {string} Formatted message
   */
  static box(title, content, emoji = '📝') {
    return `╔════════════════════════════════════════╗
║ ${emoji} ${title.padEnd(35)} ║
╚════════════════════════════════════════╝

${content}`;
  }

  /**
   * Create an info section with lines
   * @param {string} title - Section title
   * @param {Array<{label: string, value: string}>} items - Items to display
   * @param {string} emoji - Optional emoji
   * @returns {string} Formatted section
   */
  static section(title, items, emoji = '📌') {
    let content = `\n*${emoji} ${title}*\n`;
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const prefix = isLast ? '└─' : '├─';
      content += `  ${prefix} ${item.label}: ${item.value}\n`;
    });
    return content;
  }

  /**
   * Create a simple titled box
   * @param {string} title - Title with emoji
   * @param {string} content - Content
   * @returns {string} Simple box
   */
  static simpleBox(title, content) {
    const maxLength = 40;
    const paddedTitle = title.padEnd(maxLength - 2).substring(0, maxLength - 2);
    return `╔${'═'.repeat(maxLength)}╗
║ ${paddedTitle} ║
╚${'═'.repeat(maxLength)}╝

${content}`;
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
   * Create an elegant styled box with star bullets
   * @param {string} title - Title with emoji
   * @param {Array<{label: string, value: string}>} items - Items to display
   * @returns {string} Formatted elegant box
   */
  static elegantBox(title, items = []) {
    const lines = items.map((item, index) => {
      return `├ ☆ ${item.label.padEnd(12)}: ${item.value}`;
    });
    
    const content = lines.join('\n');
    const borderLength = Math.max(title.length + 6, 30);
    
    return `╭${'─'.repeat(borderLength)}╮\n├ ☆ ${title}\n${content}\n╰${'─'.repeat(borderLength)}╯`;
  }

  /**
   * Create an elegant section with star bullets
   * @param {string} title - Section title
   * @param {Array<string>} items - Items to display
   * @returns {string} Formatted elegant section
   */
  static elegantSection(title, items = []) {
    const lines = items.map((item, index) => {
      return `├ ☆ ${item}`;
    });
    
    const content = lines.join('\n');
    const borderLength = Math.max(title.length + 6, 30);
    
    return `╭───⟪ ${title} ⟫───╮\n${content}\n╰${'─'.repeat(borderLength)}╯`;
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
}

MessageFormatter._theme = 'default';

module.exports = MessageFormatter;
