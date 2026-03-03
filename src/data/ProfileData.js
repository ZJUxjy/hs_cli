/**
 * 玩家存档管理
 */

const fs = require('fs');
const path = require('path');

class ProfileData {
  constructor() {
    this.profilesDir = path.join(__dirname, '../../data/profiles');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.profilesDir)) {
      fs.mkdirSync(this.profilesDir, { recursive: true });
    }
  }

  /**
   * 列出所有存档
   * @returns {array}
   */
  listProfiles() {
    this.ensureDir();
    const files = fs.readdirSync(this.profilesDir);
    return files.filter(f => f.endsWith('.json')).map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.profilesDir, f), 'utf8'));
        return { 
          id: data.id, 
          name: data.name, 
          updatedAt: data.updatedAt,
          stats: data.stats
        };
      } catch (err) {
        return null;
      }
    }).filter(p => p !== null);
  }

  /**
   * 加载存档
   * @param {string} id 
   * @returns {object|null}
   */
  loadProfile(id) {
    const filePath = path.join(this.profilesDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('加载存档失败:', err);
      return null;
    }
  }

  /**
   * 保存存档
   * @param {object} profile 
   */
  saveProfile(profile) {
    profile.updatedAt = new Date().toISOString();
    const filePath = path.join(this.profilesDir, `${profile.id}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
    } catch (err) {
      console.error('保存存档失败:', err);
    }
  }

  /**
   * 创建新存档
   * @param {string} name 
   * @returns {object}
   */
  createProfile(name) {
    const id = 'profile_' + Date.now();
    const profile = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { totalGames: 0, wins: 0, losses: 0 },
      decks: [],
      settings: { difficulty: 'normal' }
    };
    this.saveProfile(profile);
    return profile;
  }

  /**
   * 删除存档
   * @param {string} id 
   * @returns {boolean}
   */
  deleteProfile(id) {
    const filePath = path.join(this.profilesDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error('删除存档失败:', err);
      return false;
    }
  }
}

module.exports = new ProfileData();
