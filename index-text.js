/**
 * 炉石传说 CLI - 简单文本版
 */

const readline = require('readline');
const GameEngine = require('./src/game/GameEngine');
const AIEngine = require('./src/game/AIEngine');
const CardEffect = require('./src/game/CardEffect');

class TextGame {
  constructor() {
    this.game = new GameEngine();
    this.ai = new AIEngine(this.game);
    this.cardEffect = new CardEffect(this.game);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.clear();
    console.log('========================================');
    console.log('       炉石传说 CLI - 文本版');
    console.log('========================================\n');

    // 选择职业
    console.log('请选择你的职业:');
    console.log('1. 法师');
    console.log('2. 战士');

    const answer = await this.question('> ');

    if (answer === '1') {
      this.playerClass = 'mage';
      console.log('你选择了: 法师\n');
    } else {
      this.playerClass = 'warrior';
      console.log('你选择了: 战士\n');
    }

    // 开始游戏
    this.game.startNewGame(this.playerClass, 'normal');
    this.printState();

    // 游戏循环
    await this.gameLoop();
  }

  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  printState() {
    const state = this.game.getGameState();
    const player = state.player;
    const ai = state.ai;

    console.log('\n' + '='.repeat(50));
    console.log(`回合: ${state.turn} | 当前: ${state.currentPlayer === 'player' ? '你的回合' : '敌方回合'}`);
    console.log('='.repeat(50));

    console.log(`\n敌方 (${ai.hero}): 生命 ${ai.health}/${ai.maxHealth} | 法力 ${ai.mana}/${ai.maxMana} | 随从 ${ai.field.length}/7`);
    console.log(`  手牌: ${ai.hand.length}张`);

    if (ai.field.length > 0) {
      console.log('  战场: ' + ai.field.map(m => `${m.name}[${m.attack}/${m.health}]`).join(', '));
    }

    console.log(`\n你 (${player.hero}): 生命 ${player.health}/${player.maxHealth} | 法力 ${player.mana}/${player.maxMana} | 随从 ${player.field.length}/7`);

    if (player.field.length > 0) {
      console.log('  战场: ' + player.field.map(m => `${m.name}[${m.attack}/${m.health}]${m.canAttack ? '*' : ''}`).join(', '));
    }

    console.log('\n手牌:');
    player.hand.forEach((c, i) => {
      const type = c.type === 'minion' ? `${c.effect?.attack || 0}/${c.effect?.health || 0}` : c.effect?.type || '';
      console.log(`  ${i + 1}. ${c.name} [${c.cost}] ${type} - ${c.description || ''}`);
    });

    console.log('\n行动: p 出牌  a 攻击  e 结束回合');
  }

  async gameLoop() {
    while (true) {
      const state = this.game.getGameState();

      if (state.phase === 'ended') {
        console.log(`\n游戏结束! ${state.winner === 'player' ? '你赢了!' : '你输了!'}`);
        this.rl.close();
        return;
      }

      if (state.currentPlayer === 'player') {
        const action = await this.question('\n请选择行动 > ');

        if (action === 'e') {
          console.log('\n回合结束...');
          this.game.switchTurn();
        } else if (action === 'p') {
          if (state.player.hand.length === 0) {
            console.log('\n手牌为空!');
          } else {
            const cardNum = await this.question('选择手牌编号 > ');
            const cardIndex = parseInt(cardNum) - 1;
            const card = state.player.hand[cardIndex];

            if (!card) {
              console.log('\n无效的手牌编号!');
            } else if (state.player.mana < card.cost) {
              console.log(`\n法力值不足! 需要 ${card.cost} 点，当前 ${state.player.mana} 点`);
            } else {
              // 获取目标类型
              const targetType = this.cardEffect.getTargetType(card);
              let target = null;

              if (targetType === 'single') {
                // 需要选择单体目标
                console.log('\n选择目标:');
                if (state.ai.field.length > 0) {
                  console.log('  0. 敌方英雄');
                  state.ai.field.forEach((m, i) => {
                    console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}]`);
                  });
                } else {
                  console.log('  0. 敌方英雄 (无随从)');
                }

                const targetNum = await this.question('选择目标编号 > ');
                const targetIndex = parseInt(targetNum);

                if (targetIndex === 0) {
                  target = state.ai;
                } else if (targetIndex > 0 && targetIndex <= state.ai.field.length) {
                  target = state.ai.field[targetIndex - 1];
                } else {
                  console.log('\n无效目标!');
                }
              } else if (targetType === 'hero') {
                // 给自己英雄加护甲/治疗
                target = state.player;
              }
              // targetType === 'none' 或 'all' 或 'random' 不需要目标

              // 打出卡牌
              this.game.removeCardFromHand(state.player, card);
              state.player.mana -= card.cost;

              if (card.type === 'minion') {
                this.game.summonMinion(state.player, card);
                console.log(`\n召唤了 ${card.name}`);
              } else {
                // 执行法术效果
                if (targetType === 'single' && !target) {
                  console.log('\n未选择目标，法术失效');
                } else {
                  this.cardEffect.execute(card, {
                    player: state.player,
                    target: target,
                    card: card
                  });
                  console.log(`\n施放了 ${card.name}`);
                }
              }
            }
          }
        } else if (action === 'a') {
          if (state.player.field.length === 0) {
            console.log('\n没有随从可以攻击!');
          } else {
            // 选择攻击随从
            console.log('\n选择攻击的随从:');
            state.player.field.forEach((m, i) => {
              const canAttack = m.canAttack && !m.hasAttacked && !m.sleeping && !m.frozen;
              console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}] ${canAttack ? '✓' : '✗'}`);
            });

            const minionNum = await this.question('选择随从编号 > ');
            const minionIndex = parseInt(minionNum) - 1;
            const attacker = state.player.field[minionIndex];

            if (!attacker) {
              console.log('\n无效的随从!');
            } else if (!attacker.canAttack || attacker.hasAttacked || attacker.sleeping || attacker.frozen) {
              console.log('\n该随从无法攻击!');
            } else {
              // 检查嘲讽
              const hasTaunt = state.ai.field.some(m => m.taunt);
              let validTargets = [];

              if (hasTaunt) {
                // 必须攻击嘲讽
                validTargets = state.ai.field.filter(m => m.taunt);
                console.log('\n敌方有嘲讽随从，必须攻击嘲讽!');
              } else {
                validTargets = [...state.ai.field];
              }

              // 选择目标
              console.log('\n选择目标:');
              console.log('  0. 敌方英雄');
              validTargets.forEach((m, i) => {
                console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}]`);
              });

              const targetNum = await this.question('选择目标编号 > ');
              const targetIndex = parseInt(targetNum);

              if (targetIndex === 0) {
                // 攻击英雄
                state.ai.health -= attacker.attack;
                attacker.hasAttacked = true;
                console.log(`\n${attacker.name} 攻击了敌方英雄!`);
              } else if (targetIndex > 0 && targetIndex <= validTargets.length) {
                const target = validTargets[targetIndex - 1];
                // 战斗：同时造成伤害
                target.health -= attacker.attack;
                attacker.health -= target.attack;
                attacker.hasAttacked = true;
                console.log(`\n${attacker.name} 攻击了 ${target.name}!`);
              } else {
                console.log('\n无效目标!');
              }
            }
          }
        }

        // 清理死亡随从
        this.game.removeDeadMinions();

        // 检查游戏结束
        if (this.game.checkGameEnd()) {
          state.phase = 'ended';
        }
      } else {
        console.log('\n敌方回合...');
        await this.ai.decide();

        // AI.decide() 内部已经调用了 switchTurn()，不需要再次调用

        // 清理死亡随从
        this.game.removeDeadMinions();
      }

      this.printState();
    }
  }
}

const game = new TextGame();
game.start().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
