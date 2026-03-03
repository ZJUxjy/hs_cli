/**
 * 炉石传说 CLI 游戏入口
 */

const blessed = require('blessed');
const MainMenu = require('./src/ui/screens/MainMenu');

// 全局错误捕获
process.on('uncaughtException', (err) => {
  console.error('\n=== 未捕获的错误 ===');
  console.error(err.stack || err.message);
  process.stdout.write('\x1b[?25h');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=== 未处理的 Promise 拒绝 ===');
  console.error(reason);
});

// 创建主屏幕
const screen = blessed.screen({
  smartCSR: true,
  title: '炉石传说 CLI',
  fullUnicode: true
});

// 追踪当前屏幕类型
screen.currentScreen = 'menu';

// 解绑所有键盘事件（除了全局的C-c）
screen.unbindAllKeys = function() {
  // blessed没有直接提供解绑所有按键的方法
  // 我们通过重新创建screen来清除所有事件
  // 但这会影响性能，所以我们用另一种方式
  // 创建一个按键历史记录来跟踪应该处理的事件
  this._keyListeners = {};
};

// 创建程序主容器
const program = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  tags: true
});

screen.append(program);

// 全局快捷键 - 退出
screen.key(['C-c'], () => {
  process.stdout.write('\x1b[?25h'); // 恢复光标
  process.exit(0);
});

// 退出时恢复光标
process.on('exit', () => {
  process.stdout.write('\x1b[?25h');
});

// 启动主菜单
const mainMenu = new MainMenu(screen, program);
mainMenu.show();

// 渲染循环
screen.render();

console.log('炉石传说 CLI 已启动');
