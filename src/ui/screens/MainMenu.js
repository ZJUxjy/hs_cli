/**
 * 主菜单界面 - 简化版
 */

const blessed = require('blessed');

class MainMenu {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.container = null;
  }

  show() {
    // 创建主容器
    this.container = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 50,
      height: 15,
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black', border: { fg: 'cyan' } }
    });

    // 标题 - 使用单独的text元素，不使用tags
    const title = blessed.text({
      parent: this.container,
      top: 1,
      left: 'center',
      content: '=== 炉石传说 CLI ===',
      style: { fg: 'cyan', bold: true }
    });

    // 菜单项
    const menuItems = ['新游戏', '继续游戏', '设置', '退出'];
    this.menuItems = menuItems;
    this.selectedIndex = 0;

    // 菜单显示
    this.menuBox = blessed.box({
      parent: this.container,
      top: 4,
      left: 0,
      width: '100%',
      height: menuItems.length + 2,
      content: this.getMenuDisplay()
    });

    // 底部提示
    const hint = blessed.text({
      parent: this.container,
      bottom: 1,
      left: 'center',
      content: '上下选择  Enter确认  Esc退出',
      style: { fg: 'gray' }
    });

    // 绑定键盘
    this.screen.key('up', () => this.navigate(-1));
    this.screen.key('down', () => this.navigate(1));
    this.screen.key('enter', () => this.select());
    this.screen.key('escape', () => process.exit(0));

    this.screen.render();
  }

  getMenuDisplay() {
    return this.menuItems.map((item, i) => {
      const prefix = i === this.selectedIndex ? '> ' : '  ';
      const suffix = i === this.selectedIndex ? ' <' : '  ';
      return prefix + item + suffix;
    }).join('\n');
  }

  navigate(direction) {
    this.selectedIndex = (this.selectedIndex + direction + this.menuItems.length) % this.menuItems.length;
    this.menuBox.setContent(this.getMenuDisplay());
    this.screen.render();
  }

  select() {
    switch (this.selectedIndex) {
      case 0:
        this.startNewGame();
        break;
      case 1:
        this.continueGame();
        break;
      case 3:
        process.exit(0);
        break;
    }
  }

  startNewGame() {
    this.destroy();
    const ClassSelection = require('./ClassSelection');
    const classSelection = new ClassSelection(this.screen, this.parent);
    classSelection.show();
  }

  continueGame() {
    // TODO: 加载存档
    this.destroy();
    const ClassSelection = require('./ClassSelection');
    const classSelection = new ClassSelection(this.screen, this.parent);
    classSelection.show();
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

module.exports = MainMenu;
