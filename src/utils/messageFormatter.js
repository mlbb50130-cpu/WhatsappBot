/**
 * Centralized WhatsApp message formatting for TetsuBot.
 *
 * WhatsApp does not allow a bot to set a real font size. This formatter keeps
 * messages visually smaller by using plain text, short headings and compact
 * lists instead of decorative boxes or gothic Unicode text.
 */
class MessageFormatter {
  static STYLES = {
    BOLD: '*',
    ITALIC: '_',
    MONO: '`',
    STRIKETHROUGH: '~',
  };

  static EMOJIS = {
    SUCCESS: 'OK',
    ERROR: 'Erreur',
    WARNING: 'Attention',
    INFO: 'Info',
    STAR: '*',
    FIRE: '*',
    CROWN: '*',
    DIAMOND: '*',
    GIFT: '*',
    ARROW: '>',
    CHECK: 'OK',
    CROSS: 'X',
  };

  static FANCY_CHARS = {
    H_THICK: '-',
    H_THIN: '-',
    V_THICK: '|',
    V_THIN: '|',
    TL_THICK: '+',
    TR_THICK: '+',
    BL_THICK: '+',
    BR_THICK: '+',
    TL_THIN: '+',
    TR_THIN: '+',
    BL_THIN: '+',
    BR_THIN: '+',
    T_JUNCTION: '+',
    B_JUNCTION: '+',
    L_JUNCTION: '+',
    R_JUNCTION: '+',
    CROSS: '+',
    BULLET: '-',
    FILLED: '#',
    EMPTY: '-',
  };

  static _theme = 'default';

  static repairEncoding(text = '') {
    const value = String(text ?? '');
    if (!/[\u00c3\u00c2\u00e2\u00f0\u00ef\u00bf\u00bd]/.test(value)) return value;

    try {
      const repaired = Buffer.from(value, 'latin1').toString('utf8');
      const currentBad = (value.match(/\uFFFD/g) || []).length;
      const repairedBad = (repaired.match(/\uFFFD/g) || []).length;
      return repairedBad <= currentBad ? repaired : value;
    } catch {
      return value;
    }
  }

  static isDecorativeLine(line = '') {
    const value = String(line ?? '').trim();
    if (value.length < 6) return false;

    const stripped = value.replace(/[╔╗╚╝╦╩╠╣║═─━┌┐└┘|+\-=*_~\s]/g, '');
    if (stripped.length === 0) return true;

    return value.replace(/[^\p{L}\p{N}]/gu, '').length === 0;
  }

  static compactText(text = '') {
    const value = this.repairEncoding(String(text ?? ''))
      .normalize('NFKC')
      .replace(/\uFFFD/g, '')
      .replace(/\*\*/g, '*');

    const compactLines = [];
    let previousBlank = false;

    value.split(/\r?\n/).forEach((rawLine) => {
      let line = rawLine.trimEnd();
      if (this.isDecorativeLine(line)) return;

      line = line
        .replace(/^[╔╗╚╝╦╩╠╣║|]\s*/, '')
        .replace(/\s*[╔╗╚╝╦╩╠╣║|]$/, '')
        .replace(/^\?+\s*/, '')
        .replace(/\s*\?+$/, '')
        .replace(/^[•·]\s*/, '- ')
        .replace(/^\s*[-*]\s+[-*]\s+/, '- ')
        .replace(/[ \t]{2,}/g, ' ')
        .trimEnd();

      if (!line.trim()) {
        if (!previousBlank && compactLines.length > 0) {
          compactLines.push('');
          previousBlank = true;
        }
        return;
      }

      compactLines.push(line);
      previousBlank = false;
    });

    return compactLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  static limitText(text = '', maxLines = 22, maxChars = 1600) {
    let value = String(text ?? '');

    if (value.length > maxChars) {
      value = `${value.slice(0, maxChars).trimEnd()}\n_Suite: utilise une commande plus precise._`;
    }

    const lines = value.split('\n');
    if (lines.length > maxLines) {
      value = [
        ...lines.slice(0, maxLines),
        '_Message reduit. Utilise !help ou !menu pour le detail._',
      ].join('\n');
    }

    return value;
  }

  static normalizeTitle(text = '') {
    return this.compactText(text).replace(/\s+/g, ' ').trim();
  }

  static cleanText(text = '') {
    return this.compactText(text).trim();
  }

  static valueToText(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (Array.isArray(value)) return value.map((item) => this.cleanText(item)).join(', ');
    return this.cleanText(value);
  }

  static header(title = '', subtitle = '') {
    const safeTitle = this.normalizeTitle(title);
    const safeSubtitle = this.cleanText(subtitle);
    const lines = [];

    if (safeTitle) lines.push(`*${safeTitle}*`);
    if (safeSubtitle) lines.push(`_${safeSubtitle}_`);

    return lines.join('\n');
  }

  static panel({ title = '', subtitle = '', fields = [], body = [], footer = '' } = {}) {
    const lines = [];
    const safeHeader = this.header(title, subtitle);

    if (safeHeader) lines.push(safeHeader);

    fields
      .filter(Boolean)
      .forEach((field) => {
        const label = this.cleanText(field.label || field.name || '');
        const value = this.valueToText(field.value);
        lines.push(label ? `- *${label}:* ${value}` : `- ${value}`);
      });

    body
      .filter((item) => item !== null && item !== undefined)
      .forEach((item) => {
        const safeItem = this.cleanText(item);
        lines.push(safeItem ? `- ${safeItem}` : '');
      });

    const safeFooter = this.cleanText(footer);
    if (safeFooter) {
      if (lines.length > 0) lines.push('');
      lines.push(`_${safeFooter}_`);
    }

    return lines.join('\n');
  }

  static createBox(title = '', items = []) {
    return this.elegantBox(title, items);
  }

  static error(message) {
    return this.panel({
      title: 'Erreur',
      body: [message],
    });
  }

  static success(message) {
    return this.panel({
      title: 'OK',
      body: [message],
    });
  }

  static warning(message) {
    return this.panel({
      title: 'Attention',
      body: [message],
    });
  }

  static info(message) {
    return this.panel({
      title: 'Info',
      body: [message],
    });
  }

  static progressBar(current, max, length = 10) {
    const safeMax = Number(max) > 0 ? Number(max) : 1;
    const safeCurrent = Math.max(0, Number(current) || 0);
    const barLength = Math.min(Math.max(Number(length) || 10, 6), 10);
    const percentage = Math.min((safeCurrent / safeMax) * 100, 100);
    const filled = Math.round((percentage / 100) * barLength);
    const empty = Math.max(0, barLength - filled);
    const bar = '#'.repeat(filled) + '-'.repeat(empty);

    return `[${bar}] ${Math.round(percentage)}%`;
  }

  static divider(char = '-', length = 24) {
    const safeChar = String(char || '-').slice(0, 1);
    return safeChar.repeat(Math.min(Math.max(1, length), 24));
  }

  static status(success, message) {
    return success ? this.success(message) : this.error(message);
  }

  static list(items = [], type = 'bullet') {
    return items.map((item, index) => {
      const safeItem = this.cleanText(item);
      if (type === 'number') return `${index + 1}. ${safeItem}`;
      if (type === 'arrow') return `> ${safeItem}`;
      if (type === 'star') return `* ${safeItem}`;
      if (type === 'check') return `OK ${safeItem}`;
      return `- ${safeItem}`;
    }).join('\n');
  }

  static title(text, style = 'simple') {
    const safeTitle = this.normalizeTitle(text);
    if (!safeTitle) return '';

    if (style === 'line') {
      return `*${safeTitle}*\n${this.divider('-', Math.min(24, Math.max(12, safeTitle.length)))}`;
    }

    return `*${safeTitle}*`;
  }

  static table(headers = [], rows = []) {
    if (!headers || headers.length === 0) return '';

    const safeHeaders = headers.map((header) => this.cleanText(header));
    const safeRows = rows.map((row) => row.map((cell) => this.cleanText(cell)));
    const widths = safeHeaders.map((header, columnIndex) => {
      const maxRowWidth = safeRows.reduce((max, row) => {
        return Math.max(max, String(row[columnIndex] || '').length);
      }, header.length);
      return Math.min(maxRowWidth, 18);
    });

    const formatCell = (cell, width) => {
      const value = String(cell || '');
      return value.length > width ? value.slice(0, width - 1).padEnd(width) : value.padEnd(width);
    };

    const formatRow = (row) => row
      .map((cell, index) => formatCell(cell, widths[index]))
      .join(' | ');

    return [
      formatRow(safeHeaders),
      ...safeRows.map(formatRow),
    ].join('\n');
  }

  static listItem(icon, label, value = '') {
    const safeIcon = this.cleanText(icon);
    const safeLabel = this.cleanText(label);
    const safeValue = this.valueToText(value);
    return value ? `${safeIcon} *${safeLabel}:* ${safeValue}` : `${safeIcon} ${safeLabel}`;
  }

  static commandHelp(command, description, usage, examples = []) {
    const body = examples.length > 0
      ? [`Exemples: ${examples.slice(0, 2).join(' | ')}`]
      : [];

    return this.panel({
      title: `Aide: ${command}`,
      fields: [
        { label: 'Usage', value: usage },
        { label: 'Description', value: description },
      ],
      body,
    });
  }

  static stat(icon, label, value, suffix = '') {
    return this.listItem(icon, label, `\`${value}\`${suffix}`);
  }

  static menuItem(emoji, text, command = '') {
    const label = this.cleanText(text);
    const prefix = this.cleanText(emoji);
    const safeCommand = this.cleanText(command);
    return safeCommand ? `${prefix} ${label} (${safeCommand})` : `${prefix} ${label}`;
  }

  static elegantBox(title = '', items = []) {
    return this.panel({
      title,
      fields: items,
    });
  }

  static elegantSection(title, items = []) {
    return this.panel({
      title,
      body: items,
    });
  }

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
      const folders = fs.readdirSync(assetDir).filter((folder) => {
        try {
          return fs.statSync(path.join(assetDir, folder)).isDirectory();
        } catch {
          return false;
        }
      });

      const match = folders.find((folder) => folder.toLowerCase() === requestedTheme.toLowerCase());
      const resolvedFolder = match || 'LAKERSWaifu';
      const themeDir = path.join(assetDir, resolvedFolder);

      if (!fs.existsSync(themeDir)) {
        console.warn(`Theme directory not found: ${themeDir}`);
        return null;
      }

      const images = fs.readdirSync(themeDir)
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => path.join(themeDir, file));

      if (images.length === 0) return null;

      const randomImage = images[Math.floor(Math.random() * images.length)];
      return fs.readFileSync(randomImage);
    } catch (error) {
      console.error('Error getting theme image:', error.message);
      return null;
    }
  }

  static formatOutgoingContent(content) {
    if (typeof content === 'string') {
      return this.limitText(this.compactText(content));
    }

    if (!content || typeof content !== 'object') {
      return content;
    }

    const formatted = { ...content };
    if (typeof formatted.text === 'string') {
      formatted.text = this.limitText(this.compactText(formatted.text));
    }
    if (typeof formatted.caption === 'string') {
      formatted.caption = this.limitText(this.compactText(formatted.caption));
    }

    return formatted;
  }

  static createMessageWithImage(caption) {
    const image = this.getRandomThemeImage();
    const safeCaption = this.limitText(this.compactText(caption));

    if (image) {
      return {
        image,
        caption: safeCaption,
      };
    }

    return {
      text: safeCaption,
    };
  }

  static setTheme(themeName) {
    this._theme = themeName || 'default';
  }

  static createReplyFunction(sock, message) {
    const jid = message.key.remoteJid;

    return async (content, options = {}) => {
      try {
        if (typeof content === 'string') {
          return await sock.sendMessage(jid, {
            text: this.limitText(this.compactText(content)),
            ...options,
          }, {
            quoted: message,
            ...options,
          });
        }

        if (typeof content === 'object') {
          return await sock.sendMessage(jid, this.formatOutgoingContent(content), {
            quoted: message,
            ...options,
          });
        }
      } catch (error) {
        console.error('[REPLY] Error sending reply:', error.message);

        try {
          if (typeof content === 'string') {
            return await sock.sendMessage(jid, { text: this.limitText(this.compactText(content)) });
          }

          if (typeof content === 'object') {
            return await sock.sendMessage(jid, this.formatOutgoingContent(content));
          }
        } catch (fallbackError) {
          console.error('[REPLY] Fallback also failed:', fallbackError.message);
        }
      }

      return null;
    };
  }
}

module.exports = MessageFormatter;
