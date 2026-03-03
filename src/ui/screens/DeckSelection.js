// src/ui/screens/DeckSelection.js
const blessed = require('blessed');
const DeckBuilder = require('../../data/DeckBuilder');

class DeckSelection {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.container = null;
    this.decks = [];
    this.selectedIndex = 0;
  }

  show(callback) {
    this.callback = callback;
    this.screen.currentScreen = 'deckSelection';
    this.decks = DeckBuilder.list();

    this.container = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 60,
      height: 15,
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black', border: { fg: 'cyan' } }
    });

    blessed.text({
      parent: this.container,
      top: 1,
      left: 'center',
      content: '=== 选择卡组 ===',
      style: { fg: 'yellow', bold: true }
    });

    this.listBox = blessed.box({
      parent: this.container,
      top: 3,
      left: 0,
      width: '100%',
      height: 8,
      content: this.getListDisplay()
    });

    blessed.text({
      parent: this.container,
      bottom: 1,
      left: 'center',
      content: '上下选择  Enter确认  N新建  D删除  Esc返回',
      style: { fg: 'gray' }
    });

    this.bindKeys();
    this.screen.render();
  }

  getListDisplay() {
    if (this.decks.length === 0) return '暂无卡组，按N创建';
    return this.decks.map((d, i) => {
      const prefix = i === this.selectedIndex ? '> ' : '  ';
      return `${prefix}${d.name} (${d.hero})`;
    }).join('\n');
  }

  bindKeys() {
    const self = this;
    this.screen.key('up', () => {
      if (self.screen.currentScreen === 'deckSelection') {
        self.selectedIndex = (self.selectedIndex - 1 + self.decks.length) % self.decks.length;
        self.listBox.setContent(self.getListDisplay());
        self.screen.render();
      }
    });
    this.screen.key('down', () => {
      if (self.screen.currentScreen === 'deckSelection') {
        self.selectedIndex = (self.selectedIndex + 1) % self.decks.length;
        self.listBox.setContent(self.getListDisplay());
        self.screen.render();
      }
    });
    this.screen.key('enter', () => {
      if (self.screen.currentScreen === 'deckSelection' && self.decks[self.selectedIndex]) {
        self.callback(self.decks[self.selectedIndex]);
      }
    });
    this.screen.key('escape', () => self.back());
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

module.exports = DeckSelection;
