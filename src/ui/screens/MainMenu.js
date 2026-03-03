/**
 * 主菜单界面
 */

const blessed = require('blessed');
const Logger = require('../../utils/logger');
const ProfileData = require('../../data/ProfileData');

class MainMenu {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.menu = null;
    this.currentCallback = null;
  }

  show() {
    // 创建主菜单容器
    this.menu = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 40,
      height: 'auto',
      border: {
        type: 'line',
        fg: 'cyan'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan'
        }
      }
    });

    // 标题
    const title = blessed.text({
      parent: this.menu,
      top: 1,
      left: 'center',
      content: '{bold}{cyan}炉石传说 CLI{/cyan}{/bold}',
      tags: true
    });

    // 菜单列表
    const list = blessed.list({
      parent: this.menu,
      top: 4,
      left: 2,
      width: '100%-4',
      height: 'shrink',
      items: [
        '  新游戏  ',
        '  继续游戏  ',
        '  设置  ',
        '  退出  '
      ],
      keys: true,
      mouse: true,
      style: {
        selected: {
          bg: 'cyan',
          fg: 'black'
        },
        item: {
          fg: 'white'
        }
      }
    });

    // 绑定选择事件
    list.on('select', (item, index) => {
      this.handleSelect(index);
    });

    // 绑定 Enter 键明确确认
    this.screen.key('enter', () => {
      if (this.menu) {
        const selected = list.getCurrentItem();
        const index = list.items.indexOf(selected);
        this.handleSelect(index);
      }
    });

    // 底部提示
    const hint = blessed.text({
      parent: this.menu,
      bottom: 1,
      left: 'center',
      content: '↑↓ 选择  Enter 确认  Esc 退出',
      tags: true,
      style: { fg: 'gray' }
    });

    this.menu.height = list.height + 9;
    this.screen.render();
  }

  handleSelect(index) {
    switch (index) {
      case 0:
        Logger.info('选择: 新游戏');
        this.startNewGame();
        break;
      case 1:
        Logger.info('选择: 继续游戏');
        this.continueGame();
        break;
      case 2:
        Logger.info('选择: 设置');
        // TODO: 跳转到设置
        break;
      case 3:
        Logger.info('选择: 退出');
        process.exit(0);
        break;
    }
  }

  startNewGame() {
    this.destroy();
    const ClassSelection = require('./ClassSelection');
    const classSelection = new ClassSelection(this.screen, this.parent);
    classSelection.show(() => {
      // 返回主菜单
      this.show();
    });
  }

  /**
   * 继续游戏 - 显示存档列表
   */
  continueGame() {
    // 获取默认profile
    let profile = ProfileData.loadProfile('default');
    if (!profile) {
      // 尝试找到第一个存在的profile
      const profiles = ProfileData.listProfiles();
      if (profiles.length > 0) {
        profile = ProfileData.loadProfile(profiles[0].id);
      }
    }

    if (!profile) {
      Logger.info('没有找到存档');
      this.show(); // 重新显示菜单
      return;
    }

    // 获取游戏存档列表
    const saves = ProfileData.listGameSaves(profile.id);

    if (saves.length === 0) {
      Logger.info('没有游戏存档');
      this.show();
      return;
    }

    // 显示存档选择界面
    this.showSaveSelection(profile.id, saves);
  }

  /**
   * 显示存档选择列表
   */
  showSaveSelection(profileId, saves) {
    this.destroy();

    // 创建选择菜单
    const selectMenu = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 60,
      height: Math.min(saves.length + 8, 20),
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black', border: { fg: 'cyan' } }
    });

    // 标题
    blessed.text({
      parent: selectMenu,
      top: 1,
      left: 'center',
      content: '{bold}{cyan}选择存档{/cyan}{/bold}',
      tags: true
    });

    // 存档列表
    const saveItems = saves.map((save, i) => {
      const heroNames = {
        mage: '法师', warrior: '战士', hunter: '猎人',
        paladin: '圣骑士', shaman: '萨满', priest: '牧师',
        rogue: '盗贼', druid: '德鲁伊'
      };
      const playerHero = heroNames[save.playerHero] || save.playerHero;
      const aiHero = heroNames[save.aiHero] || save.aiHero;
      const date = new Date(save.savedAt).toLocaleString('zh-CN');
      return ` 回合${save.turn} | 你:${playerHero} vs 敌方:${aiHero} | ${date}`;
    });

    const list = blessed.list({
      parent: selectMenu,
      top: 4,
      left: 2,
      width: '100%-4',
      height: saves.length + 2,
      items: saveItems,
      keys: true,
      mouse: true,
      style: {
        selected: { bg: 'cyan', fg: 'black' },
        item: { fg: 'white' }
      }
    });

    // 选择事件
    list.on('select', (item, index) => {
      this.loadGame(profileId, saves[index].id);
    });

    this.screen.key('enter', () => {
      const selected = list.getCurrentItem();
      const index = list.items.indexOf(selected);
      if (index >= 0) {
        this.loadGame(profileId, saves[index].id);
      }
    });

    // 返回
    this.screen.key('escape', () => {
      selectMenu.destroy();
      this.show();
    });

    this.screen.render();
  }

  /**
   * 加载游戏
   */
  loadGame(profileId, gameId) {
    const GameEngine = require('../../game/GameEngine');

    const gameEngine = new GameEngine();
    const loaded = gameEngine.loadFromSave(profileId, gameId);

    if (loaded) {
      this.destroy();
      const GameScreen = require('./GameScreen');
      const gameScreen = new GameScreen(this.screen, this.parent);
      gameScreen.showWithEngine(gameEngine);
    } else {
      Logger.error('加载失败');
      this.show();
    }
  }

  destroy() {
    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
  }
}

module.exports = MainMenu;
