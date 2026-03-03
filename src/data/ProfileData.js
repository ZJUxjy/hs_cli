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

  /**
   * 保存游戏进度
   * @param {string} profileId - 存档ID
   * @param {object} gameState - 游戏状态
   */
  saveGameState(profileId, gameState) {
    const profile = this.loadProfile(profileId);
    if (!profile) return false;

    if (!profile.games) profile.games = [];

    // 从 gameState.state 中获取游戏状态信息
    const state = gameState.state || gameState;
    const gameSave = {
      id: 'game_' + Date.now(),
      state: gameState,
      savedAt: new Date().toISOString(),
      turn: state.turn,
      playerHero: state.player?.hero,
      aiHero: state.ai?.hero
    };

    profile.games.push(gameSave);
    // 只保留最近5个游戏存档
    if (profile.games.length > 5) {
      profile.games = profile.games.slice(-5);
    }

    this.saveProfile(profile);
    return true;
  }

  /**
   * 加载游戏进度
   * @param {string} profileId - 存档ID
   * @param {string} gameId - 游戏ID
   */
  loadGameState(profileId, gameId) {
    const profile = this.loadProfile(profileId);
    if (!profile || !profile.games) return null;

    return profile.games.find(g => g.id === gameId) || null;
  }

  /**
   * 获取游戏存档列表
   * @param {string} profileId - 存档ID
   */
  listGameSaves(profileId) {
    const profile = this.loadProfile(profileId);
    if (!profile || !profile.games) return [];

    return profile.games.map(g => ({
      id: g.id,
      savedAt: g.savedAt,
      turn: g.turn,
      playerHero: g.playerHero,
      aiHero: g.aiHero
    })).reverse();
  }
}

module.exports = new ProfileData();
