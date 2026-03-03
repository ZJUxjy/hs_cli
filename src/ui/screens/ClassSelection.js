/**
 * 职业选择界面
 */

const blessed = require('blessed');
const Logger = require('../../utils/logger');
const ConfigData = require('../../data/ConfigData');
const GameScreen = require('./GameScreen');

class ClassSelection {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.container = null;
    this.classes = [];
    this.selectedIndex = 0;
    this.classBoxes = [];
    this.difficulty = 'normal';
    this.onBack = null;
  }

  /**
   * 显示职业选择界面
   */
  show(onBack) {
    this.onBack = onBack;
    this.classes = Object.entries(ConfigData.getAllClasses()).map(([id, config]) => ({
      id,
      name: config.name,
      heroPower: config.heroPower
    }));

    this.selectedIndex = 0;

    this.createUI();
    this.updateSelection();
  }

  /**
   * 创建 UI
   */
  createUI() {
    // 主容器
    this.container = blessed.box({
      parent: this.parent,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      tags: true
    });

    // 标题
    const title = blessed.text({
      parent: this.container,
      top: 2,
      left: 'center',
      content: '{bold}{yellow}选择你的英雄{/yellow}{/bold}',
      tags: true,
      style: { fg: 'white' }
    });

    // 职业卡片容器
    const cardContainer = blessed.box({
      parent: this.container,
      top: 6,
      left: 'center',
      width: '80%',
      height: 'auto',
      style: { fg: 'white', bg: 'black' }
    });

    // 为每个职业创建卡片
    this.classes.forEach((cls, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const cardWidth = 40;
      const cardHeight = 12;
      const gap = 2;

      const cardBox = blessed.box({
        parent: cardContainer,
        top: row * (cardHeight + gap),
        left: col * (cardWidth + gap),
        width: cardWidth,
        height: cardHeight,
        border: { type: 'line', fg: 'gray' },
        style: {
          fg: 'white',
          bg: 'black',
          border: { fg: 'gray' }
        }
      });

      // 职业名称
      const nameText = blessed.text({
        parent: cardBox,
        top: 1,
        left: 'center',
        content: `{bold}${cls.name}{/bold}`,
        tags: true
      });

      // 生命值
      const healthText = blessed.text({
        parent: cardBox,
        top: 3,
        left: 2,
        content: `生命: 30`
      });

      // 英雄技能
      const powerText = blessed.text({
        parent: cardBox,
        top: 5,
        left: 2,
        content: `技能: ${cls.heroPower?.name || '无'}`
      });

      // 技能描述
      const descText = blessed.text({
        parent: cardBox,
        top: 6,
        left: 2,
        content: cls.heroPower?.description || ''
      });

      // 快捷键提示
      const keyText = blessed.text({
        parent: cardBox,
        bottom: 1,
        left: 'center',
        content: `[${index + 1}] 选择`
      });

      this.classBoxes.push({
        box: cardBox,
        name: nameText,
        health: healthText,
        power: powerText,
        desc: descText,
        key: keyText
      });
    });

    // 底部提示
    const hint = blessed.text({
      parent: this.container,
      bottom: 3,
      left: 'center',
      content: '{gray}↑↓←→ 选择  Enter 确认  Esc 返回主菜单{/gray}',
      tags: true
    });

    // 绑定键盘事件
    this.bindKeys();
  }

  /**
   * 绑定键盘事件
   */
  bindKeys() {
    // 方向键选择
    this.screen.key(['up', 'down', 'left', 'right'], (ch) => {
      this.handleDirection(ch);
    });

    // 数字键选择
    for (let i = 1; i <= 9; i++) {
      this.screen.key(String(i), () => {
        if (i <= this.classes.length) {
          this.selectedIndex = i - 1;
          this.updateSelection();
        }
      });
    }

    // 回车确认
    this.screen.key('enter', () => {
      this.confirmSelection();
    });

    // Esc 返回
    this.screen.key('escape', () => {
      this.back();
    });
  }

  /**
   * 处理方向键
   */
  handleDirection(key) {
    const cols = 2;
    const len = this.classes.length;

    if (key === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - cols);
    } else if (key === 'down') {
      this.selectedIndex = Math.min(len - 1, this.selectedIndex + cols);
    } else if (key === 'left') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else if (key === 'right') {
      this.selectedIndex = Math.min(len - 1, this.selectedIndex + 1);
    }

    this.updateSelection();
  }

  /**
   * 更新选中状态
   */
  updateSelection() {
    this.classBoxes.forEach((item, index) => {
      if (index === this.selectedIndex) {
        const color = this.classes[index].id === 'mage' ? 'yellow' : 'red';
        item.box.style.border.fg = color;
        item.name.setContent(`{bold}{${color}}${this.classes[index].name}{/bold}`);
      } else {
        item.box.style.border.fg = 'gray';
        item.name.setContent(`{bold}${this.classes[index].name}{/bold}`);
      }
    });

    this.screen.render();
  }

  /**
   * 确认选择
   */
  confirmSelection() {
    const selectedClass = this.classes[this.selectedIndex];
    Logger.info(`选择职业: ${selectedClass.name}`);

    this.destroy();

    const gameScreen = new GameScreen(this.screen, this.parent);
    gameScreen.show(selectedClass.id, this.difficulty);
  }

  /**
   * 返回主菜单
   */
  back() {
    this.destroy();
    if (this.onBack) {
      this.onBack();
    }
  }

  /**
   * 销毁界面
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.classBoxes = [];
  }
}

module.exports = ClassSelection;
