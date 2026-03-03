/**
 * 主菜单界面
 */

const blessed = require('blessed');
const Logger = require('../../utils/logger');

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
      content: '{gray}↑↓ 选择  Enter 确认  Esc 退出{/gray}',
      tags: true
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
        // TODO: 跳转到继续游戏
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

  destroy() {
    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
  }
}

module.exports = MainMenu;
