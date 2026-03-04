# 炉石传说 Web UI 拖拽交互设计

> **基于真实炉石传说操作方式**

## 1. 设计目标

将 Web UI 的交互方式从"点击选择"改为"拖拽"，与真实炉石传说一致：
- **出牌**：拖动手牌到战场区域
- **攻击**：拖拽己方随从到敌方随从或英雄

## 2. 现有代码分析

### 当前交互方式
| 功能 | 当前方式 |
|------|----------|
| 出牌 | 点击手牌选中 → 再次点击/按Enter打出 |
| 攻击 | 点击己方随从选中 → 点击敌方随从/英雄攻击 |

### 涉及文件
- `public/js/game.js` - 游戏UI控制器
- `public/css/game.css` - 游戏样式

## 3. 交互设计

### 3.1 出牌交互

```
操作流程：
1. 鼠标悬停在手牌上
2. 按住鼠标左键拖动
3. 拖动到战场区域（player-field）
4. 松开鼠标
5. 如果法力值足够，卡牌打出
```

**视觉反馈：**
- 拖动时显示卡牌跟随鼠标
- 战场区域高亮提示可释放
- 法力值不足时显示红色边框

### 3.2 攻击交互

```
操作流程：
1. 点击己方随从（选中，显示可攻击状态）
2. 按住鼠标左键拖动
3. 拖动到敌方随从或英雄区域
4. 松开鼠标
5. 攻击执行
```

**视觉反馈：**
- 己方随从选中时显示红色边框/攻击箭头
- 敌方随从/英雄悬停时高亮提示
- 有嘲讽随从时，非嘲讽目标显示灰色不可选

## 4. 技术实现

### 4.1 HTML5 Drag and Drop API

使用原生 HTML5 Drag and Drop 事件：
- `dragstart` - 开始拖拽
- `dragover` - 拖拽经过目标区域
- `drop` - 释放拖拽
- `dragenter` / `dragleave` - 进入/离开目标

### 4.2 数据结构

```javascript
// 拖拽状态
this.dragState = {
  type: 'card' | 'minion',  // 拖拽类型
  sourceIndex: number,       // 来源索引
  element: HTMLElement       // 拖拽元素
};
```

### 4.3 修改要点

#### 手牌拖拽
- 为每个手牌元素添加 `draggable="true"`
- 绑定 `dragstart` 事件记录卡牌信息
- 战场区域绑定 `dragover` 和 `drop` 事件

#### 随从攻击拖拽
- 己方随从添加 `draggable="true"`（仅当 canAttack 为 true 时）
- 敌方战场和英雄区域绑定目标事件
- 攻击时验证规则（嘲讽、冻结等）

## 5. 详细修改

### 5.1 game.js 修改

```javascript
// 新增拖拽状态
this.dragState = {
  type: null,        // 'card' | 'minion'
  sourceIndex: null,
  element: null
};

// 新增拖拽事件处理
bindDragEvents() {
  // 手牌拖拽
  this.bindHandDragEvents();

  // 随从拖拽攻击
  this.bindMinionDragEvents();
}

// 手牌拖拽
bindHandDragEvents() {
  const handCards = document.querySelectorAll('#player-hand .card');
  handCards.forEach((card, index) => {
    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
      this.dragState = { type: 'card', sourceIndex: index };
      e.dataTransfer.setData('text/plain', index);
    });
  });

  // 战场区域
  const playerField = document.getElementById('player-field');
  playerField.addEventListener('dragover', (e) => {
    e.preventDefault();
    playerField.classList.add('drag-over');
  });

  playerField.addEventListener('dragleave', () => {
    playerField.classList.remove('drag-over');
  });

  playerField.addEventListener('drop', (e) => {
    e.preventDefault();
    playerField.classList.remove('drag-over');
    if (this.dragState.type === 'card') {
      this.playCard(this.dragState.sourceIndex);
    }
  });
}

// 随从攻击拖拽
bindMinionDragEvents() {
  // 己方随从
  const playerMinions = document.querySelectorAll('#player-field .minion');
  playerMinions.forEach((minion, index) => {
    if (minion.dataset.canAttack === 'true') {
      minion.draggable = true;
      minion.addEventListener('dragstart', (e) => {
        this.dragState = { type: 'minion', sourceIndex: index };
      });
    }
  });

  // 敌方随从区域
  const enemyField = document.getElementById('enemy-field');
  enemyField.addEventListener('drop', (e) => {
    e.preventDefault();
    if (this.dragState.type === 'minion') {
      const targetIndex = parseInt(e.target.dataset.index);
      this.attackMinion(this.dragState.sourceIndex, targetIndex);
    }
  });

  // 敌方英雄
  const enemyHero = document.getElementById('enemy-hero');
  enemyHero.addEventListener('drop', (e) => {
    e.preventDefault();
    if (this.dragState.type === 'minion') {
      this.attackHero(this.dragState.sourceIndex);
    }
  });
}
```

### 5.2 CSS 修改

```css
/* 拖拽时的视觉反馈 */
.card.dragging {
  opacity: 0.5;
}

#player-field.drag-over,
#enemy-field.drag-over,
#enemy-hero.drag-over {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px dashed #ffd700;
}

.minion.dragging {
  opacity: 0.5;
}

.minion.can-attack {
  cursor: grab;
  box-shadow: 0 0 10px #ff4444;
}

.minion.drop-target {
  background-color: rgba(255, 0, 0, 0.3);
}
```

## 6. 验证规则

### 6.1 出牌验证
- 法力值是否足够
- 战场是否已满（7个随从）
- 是否是有效的卡牌类型

### 6.2 攻击验证
- 随从是否可攻击（未沉睡、未冻结、未攻击过）
- 是否有嘲讽随从阻挡
- 目标是否有效

## 7. 兼容性考虑

- 移动端触摸事件需要额外处理（touchstart/touchmove/touchend）
- 桌面浏览器使用标准 Drag and Drop API
- 保留原有点击交互作为降级方案
