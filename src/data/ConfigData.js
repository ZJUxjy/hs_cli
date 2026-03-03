/**
 * 配置数据管理
 */

const fs = require('fs');
const path = require('path');

class ConfigData {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../../data/config.json');
    
    if (!fs.existsSync(configPath)) {
      console.warn('配置文件不存在，使用默认配置');
      this.config = this.getDefaultConfig();
      return;
    }

    try {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.error('加载配置失败:', err);
      this.config = this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      classes: {
        mage: { id: 'mage', name: '法师', startingHealth: 30 },
        warrior: { id: 'warrior', name: '战士', startingHealth: 30 }
      },
      game: {
        startingHandSize: 3,
        maxHandSize: 10,
        maxFieldSize: 7,
        startingDeckSize: 30
      }
    };
  }

  /**
   * 获取职业配置
   * @param {string} classId 
   * @returns {object|null}
   */
  getClass(classId) {
    return this.config.classes ? this.config.classes[classId] : null;
  }

  /**
   * 获取所有职业
   * @returns {object}
   */
  getAllClasses() {
    return this.config.classes || {};
  }

  /**
   * 获取游戏配置
   * @returns {object}
   */
  getGameConfig() {
    return this.config.game || this.getDefaultConfig().game;
  }
}

module.exports = new ConfigData();
