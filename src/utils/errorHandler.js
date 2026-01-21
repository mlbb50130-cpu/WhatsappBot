// 🔐 Gestionnaire d'erreurs et logging avancé
const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.ensureLogDir();
    this.logFile = path.join(logDir, `tetsubot-${new Date().toISOString().split('T')[0]}.log`);
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log simple
   */
  log(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.getPrefix(level);
    
    let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (error) {
      logMessage += `\n${error.stack || error}`;
    }

    console.log(`${prefix} ${logMessage}`);
    this.writeToFile(logMessage);
  }

  /**
   * Log info
   */
  info(message) {
    this.log('info', message);
  }

  /**
   * Log warning
   */
  warn(message) {
    this.log('warn', message);
  }

  /**
   * Log error
   */
  error(message, error = null) {
    this.log('error', message, error);
  }

  /**
   * Log debug
   */
  debug(message) {
    if (process.env.LOG_LEVEL === 'debug') {
      this.log('debug', message);
    }
  }

  /**
   * Log une commande
   */
  logCommand(commandName, userId, success, error = null) {
    const message = `Command: ${commandName} | User: ${userId} | Status: ${success ? 'SUCCESS' : 'FAILED'}`;
    this.log(success ? 'info' : 'error', message, error);
  }

  /**
   * Log une API call
   */
  logAPI(endpoint, method, statusCode, duration) {
    const message = `API: ${method} ${endpoint} | Status: ${statusCode} | Duration: ${duration}ms`;
    this.log('info', message);
  }

  /**
   * Log erreur database
   */
  logDatabase(operation, error) {
    this.error(`Database Error - ${operation}`, error);
  }

  /**
   * Écrit dans le fichier log
   */
  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Nettoie les anciens fichiers logs
   */
  cleanup(keepDays = 7) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const cutoff = now - (keepDays * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoff) {
          fs.unlinkSync(filePath);
          console.log(`[Logger] Deleted old log: ${file}`);
        }
      });
    } catch (err) {
      this.error('Log cleanup failed', err);
    }
  }

  /**
   * Retourne le prefix emoji selon le level
   */
  getPrefix(level) {
    const prefixes = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍',
      'success': '✅'
    };
    return prefixes[level] || '📝';
  }

  /**
   * Parse une erreur et retourne le message propre
   */
  static parseError(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return JSON.stringify(error);
  }
}

module.exports = ErrorHandler;
