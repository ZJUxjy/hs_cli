const fs = require('fs');
const path = require('path');

class I18n {
  constructor() {
    this.currentLocale = 'zh';
    this.translations = {};
    this.supportedLocales = ['zh', 'en', 'ja', 'ko'];
    this.fallbackLocale = 'en';
  }

  // 初始化 - 加载语言文件
  async init(locale = 'zh') {
    if (!this.supportedLocales.includes(locale)) {
      locale = this.fallbackLocale;
    }
    this.currentLocale = locale;
    await this.loadLocale(locale);
    return this;
  }

  // 加载指定语言文件
  async loadLocale(locale) {
    const filePath = path.join(__dirname, 'locales', `${locale}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.translations = JSON.parse(content);
    } catch (err) {
      console.error(`Failed to load locale ${locale}:`, err);
      if (locale !== this.fallbackLocale) {
        await this.loadLocale(this.fallbackLocale);
      }
    }
  }

  // 切换语言
  async setLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      return false;
    }
    await this.loadLocale(locale);
    this.currentLocale = locale;
    return true;
  }

  // 翻译函数 t('key.subkey', {param: value})
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 尝试回退语言
        return this.tFromFallback(keys, params);
      }
    }

    if (typeof value === 'string') {
      // 替换参数
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return key; // 未找到返回 key
  }

  // 从回退语言获取翻译
  tFromFallback(keys, params) {
    const filePath = path.join(__dirname, 'locales', `${this.fallbackLocale}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fallback = JSON.parse(content);
      let value = fallback;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return keys.join('.');
        }
      }

      return typeof value === 'string' ? value : keys.join('.');
    } catch {
      return keys.join('.');
    }
  }

  // 获取当前语言
  getLocale() {
    return this.currentLocale;
  }

  // 获取支持的语言列表
  getSupportedLocales() {
    return this.supportedLocales;
  }
}

module.exports = new I18n();
