/**
 * 炉石传说 RL API 服务器
 */

const GameEngine = require('./src/game/GameEngine');
const RLServer = require('./src/network/RLServer');

async function main() {
  const game = new GameEngine();
  const server = new RLServer(game, 3000);

  const actualPort = await server.start();

  console.log('\n========================================');
  console.log('       炉石传说 RL API 服务器');
  console.log('========================================');
  console.log(`服务器地址: http://localhost:${actualPort}`);
  console.log('\n可用端点:');
  console.log(`  POST   /reset            - 开始新游戏`);
  console.log(`  POST   /step             - 执行动作`);
  console.log(`  GET    /action_space     - 获取动作空间`);
  console.log(`  GET    /observation_space - 获取状态空间`);
  console.log(`  GET    /game_state       - 获取当前游戏状态`);
  console.log('========================================\n');
}

main().catch(console.error);
