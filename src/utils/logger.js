/**
 * 日志工具
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

const Logger = {
  info(message, ...args) {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`, ...args);
  },

  error(message, ...args) {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`, ...args);
  },

  warn(message, ...args) {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`, ...args);
  },

  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(`${colors.gray}[DEBUG]${colors.reset} ${message}`, ...args);
    }
  },

  success(message, ...args) {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`, ...args);
  },

  // 带颜色的日志
  colored(color, message, ...args) {
    console.log(`${colors[color] || ''}${message}${colors.reset}`, ...args);
  }
};

module.exports = Logger;
