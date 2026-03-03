/**
 * 职业选择界面 - 简化版
 */

const blessed = require('blessed');
const ConfigData = require('../../data/ConfigData');

class ClassSelection {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.container = null;
    this.classes = [];
    this.selectedIndex = 0;
    this.callback = null;
  }

  show(callback) {
    this.callback = callback;
    this.screen.currentScreen = 'classSelection';

    // 加载职业配置
    const classes = ConfigData.getAllClasses();
    this.classes = Object.values(classes).filter(c => c.id);

    // 创建容器
    this.container = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 70,
      height: 20,
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black', border: { fg: 'cyan' } }
    });

    // 标题
    blessed.text({
      parent: this.container,
      top: 1,
      left: 'center',
      content: '=== 选择你的英雄 ===',
      style: { fg: 'yellow', bold: true }
    });

    // 职业列表
    this.listBox = blessed.box({
      parent: this.container,
      top: 3,
      left: 0,
      width: '100%',
      height: this.classes.length + 2,
      content: this.getListDisplay()
    });

    // 提示
    blessed.text({
      parent: this.container,
      bottom: 1,
      left: 'center',
      content: '上下选择  Enter确认  Esc返回',
      style: { fg: 'gray' }
    });

    // 键盘绑定
    const self = this;
    console.log('[ClassSelection] Binding keys, currentScreen:', this.screen.currentScreen);

    this.screen.key('up', () => {
      console.log('[ClassSelection] UP pressed, currentScreen:', self.screen.currentScreen);
      if (self.screen.currentScreen === 'classSelection') self.navigate(-1);
    });
    this.screen.key('down', () => {
      console.log('[ClassSelection] DOWN pressed, currentScreen:', self.screen.currentScreen);
      if (self.screen.currentScreen === 'classSelection') self.navigate(1);
    });
    this.screen.key('enter', () => {
      console.log('[ClassSelection] ENTER pressed, currentScreen:', self.screen.currentScreen);
      if (self.screen.currentScreen === 'classSelection') self.confirm();
    });
    this.screen.key('escape', () => {
      console.log('[ClassSelection] ESC pressed, currentScreen:', self.screen.currentScreen);
      if (self.screen.currentScreen === 'classSelection') self.back();
    });

    this.screen.render();
  }

  getListDisplay() {
    return this.classes.map((cls, i) => {
      const prefix = i === this.selectedIndex ? '> ' : '  ';
      const power = cls.heroPower?.name || '无';
      return `${prefix}${cls.name} (技能: ${power})`;
    }).join('\n');
  }

  navigate(direction) {
    this.selectedIndex = (this.selectedIndex + direction + this.classes.length) % this.classes.length;
    this.listBox.setContent(this.getListDisplay());
    this.screen.render();
  }

  confirm() {
    console.log('[ClassSelection] confirm called, selectedIndex:', this.selectedIndex);
    console.log('[ClassSelection] classes length:', this.classes.length);

    const selected = this.classes[this.selectedIndex];
    console.log('[ClassSelection] selected:', selected);

    if (!selected) {
      console.error('[ClassSelection] No class selected!');
      return;
    }

    console.log('[ClassSelection] Destroying container...');
    this.destroy();

    console.log('[ClassSelection] Starting GameScreen with class:', selected.id);
    // 开始游戏
    const GameScreen = require('./GameScreen');
    const gameScreen = new GameScreen(this.screen, this.parent);
    gameScreen.show(selected.id, 'normal');
    console.log('[ClassSelection] GameScreen.show() returned');
  }

  back() {
    this.destroy();
    const MainMenu = require('./MainMenu');
    const menu = new MainMenu(this.screen, this.parent);
    menu.show();
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

module.exports = ClassSelection;
