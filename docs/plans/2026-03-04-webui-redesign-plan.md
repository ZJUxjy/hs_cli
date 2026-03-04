# Web UI 重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 重构 Web UI 界面，实现神秘奇幻风格，接近炉石官方视觉效果，支持响应式布局

**Architecture:** 全面重写 HTML 结构和 CSS 样式，使用纯 CSS 实现动画效果，保持 JS 逻辑不变，通过 CSS 变量实现设计系统

**Tech Stack:** HTML5, CSS3 (纯 CSS 动画), JavaScript (保持现有)

---

## 前置准备

### Task 0: 备份现有文件

**Files:**
- Read: `public/index.html`
- Read: `public/css/style.css`
- Read: `public/js/app.js`, `public/js/game.js`, `public/js/deck.js`

**Step 1: 备份现有文件**

```bash
cp public/index.html public/index.html.backup
cp public/css/style.css public/css/style.css.backup
cp public/js/app.js public/js/app.js.backup
cp public/js/game.js public/js/game.js.backup
cp public/js/deck.js public/js/deck.js.backup
```

**Step 2: Commit 备份**

```bash
git add public/*.backup
git commit -m "chore: backup existing web UI files before redesign

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第一阶段：设计系统基础

### Task 1: 创建 CSS 变量设计系统

**Files:**
- Create: `public/css/design-system.css`

**Step 1: 写入设计系统 CSS**

```css
/* design-system.css - 设计系统基础 */

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Quicksand:wght@400;500;600;700&family=MedievalSharp&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');

:root {
  /* ===== 颜色系统 ===== */

  /* 主色调 - 深邃神秘 */
  --bg-void: #0a0a14;
  --bg-deep: #12121f;
  --bg-mystic: #1a1a2e;
  --bg-surface: #252540;
  --bg-card: #2a2a4a;
  --bg-card-hover: #3a3a5a;

  /* 魔法光芒 */
  --magic-gold: #f0b634;
  --magic-gold-light: #ffd700;
  --magic-gold-dark: #c9941f;
  --magic-blue: #6b5bff;
  --magic-purple: #9b4ad9;
  --magic-cyan: #4ad9d9;

  /* 状态色 */
  --health: #e63946;
  --health-dark: #c62828;
  --attack: #f4a261;
  --attack-dark: #e07b39;
  --mana: #4a90d9;
  --mana-dark: #357abd;
  --armor: #8ecae6;

  /* 稀有度 */
  --rarity-common: #9ca3af;
  --rarity-rare: #3b82f6;
  --rarity-epic: #a855f7;
  --rarity-legendary: #f0b634;

  /* 边框 */
  --border-color: #4a4a6a;
  --border-light: rgba(255, 255, 255, 0.1);
  --border-gold: rgba(240, 182, 52, 0.5);

  /* 文字 */
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;

  /* ===== 字体系统 ===== */
  --font-display: 'Cinzel', 'Noto Serif SC', serif;
  --font-ui: 'Quicksand', 'Noto Sans SC', sans-serif;
  --font-magic: 'MedievalSharp', cursive;

  /* ===== 阴影与光效 ===== */
  --glow-gold: 0 0 20px rgba(240, 182, 52, 0.5);
  --glow-gold-strong: 0 0 30px rgba(240, 182, 52, 0.8);
  --glow-blue: 0 0 20px rgba(107, 91, 255, 0.5);
  --glow-legendary: 0 0 30px rgba(240, 182, 52, 0.8);
  --inset-mystic: inset 0 0 30px rgba(107, 91, 255, 0.1);

  /* ===== 间距系统 ===== */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* ===== 动画时间 ===== */
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ===== 基础重置 ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-ui);
  background: var(--bg-void);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.5;
}

/* ===== 魔法粒子背景 ===== */
.magic-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--magic-gold);
  border-radius: 50%;
  opacity: 0.3;
  animation: float-particle 8s infinite ease-in-out;
}

.particle:nth-child(2n) {
  background: var(--magic-blue);
  animation-duration: 10s;
  animation-delay: -2s;
}

.particle:nth-child(3n) {
  background: var(--magic-purple);
  animation-duration: 12s;
  animation-delay: -4s;
}

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  25% {
    transform: translateY(-30px) translateX(15px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) translateX(-10px);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-40px) translateX(5px);
    opacity: 0.5;
  }
}

/* ===== 通用动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(240, 182, 52, 0.4); }
  50% { box-shadow: 0 0 40px rgba(240, 182, 52, 0.8); }
}

@keyframes title-glow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(240, 182, 52, 0.5);
  }
  50% {
    text-shadow: 0 0 40px rgba(240, 182, 52, 0.8), 0 0 60px rgba(240, 182, 52, 0.4);
  }
}

/* ===== 滚动条 ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--magic-gold);
}
```

**Step 2: Commit**

```bash
git add public/css/design-system.css
git commit -m "feat: add design system CSS with variables and animations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第二阶段：主菜单重构

### Task 2: 创建主菜单样式

**Files:**
- Create: `public/css/main-menu.css`

**Step 1: 写入主菜单 CSS**

```css
/* main-menu.css - 主菜单样式 */

/* ===== 主菜单容器 ===== */
#menu-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, var(--bg-deep) 0%, var(--bg-void) 100%);
  z-index: 10;
}

/* 背景装饰 - 符文圆环 */
#menu-screen::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background:
    radial-gradient(circle, transparent 40%, rgba(107, 91, 255, 0.05) 50%, transparent 60%),
    repeating-conic-gradient(from 0deg, transparent 0deg, rgba(240, 182, 52, 0.03) 2deg, transparent 4deg);
  border-radius: 50%;
  pointer-events: none;
  animation: rotate-slow 60s linear infinite;
}

@keyframes rotate-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ===== 标题 ===== */
.game-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  color: var(--magic-gold);
  text-align: center;
  margin-bottom: var(--space-xl);
  letter-spacing: 0.1em;
  animation: fadeInUp 0.8s ease-out, title-glow 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.game-title::after {
  content: '✦';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: var(--magic-gold-light);
  animation: fadeIn 1s ease-out 0.5s both;
}

/* ===== 语言选择器 ===== */
.language-selector {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgba(0, 0, 0, 0.4);
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  z-index: 20;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.language-selector label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.language-selector select {
  padding: var(--space-xs) var(--space-md);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--duration-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f0b634' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.language-selector select:hover {
  border-color: var(--magic-gold);
  background-color: rgba(255, 255, 255, 0.15);
}

.language-selector select:focus {
  outline: none;
  border-color: var(--magic-gold);
  box-shadow: 0 0 0 2px rgba(240, 182, 52, 0.2);
}

/* ===== 菜单按钮 ===== */
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  z-index: 1;
}

.menu-btn {
  position: relative;
  padding: var(--space-md) var(--space-2xl);
  font-family: var(--font-ui);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  background: linear-gradient(180deg, rgba(58, 58, 90, 0.8) 0%, rgba(42, 42, 74, 0.9) 100%);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-default);
  min-width: 280px;
  text-align: center;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out both;
}

.menu-btn:nth-child(1) { animation-delay: 0.4s; }
.menu-btn:nth-child(2) { animation-delay: 0.5s; }
.menu-btn:nth-child(3) { animation-delay: 0.6s; }
.menu-btn:nth-child(4) { animation-delay: 0.7s; }

.menu-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(240, 182, 52, 0.1), transparent);
  transition: left var(--duration-normal);
}

.menu-btn:hover {
  transform: translateY(-4px);
  border-color: var(--magic-gold);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), var(--glow-gold);
}

.menu-btn:hover::before {
  left: 100%;
}

.menu-btn:active {
  transform: translateY(-2px);
}

/* ===== 版本信息 ===== */
.version-info {
  position: absolute;
  bottom: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-muted);
  font-size: 0.75rem;
  z-index: 1;
  animation: fadeIn 1s ease-out 1s both;
}

/* ===== 响应式 ===== */
@media (max-width: 576px) {
  #menu-screen::before {
    width: 100%;
    height: 100%;
  }

  .language-selector {
    top: var(--space-sm);
    right: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
  }

  .menu-btn {
    min-width: 240px;
    padding: var(--space-md) var(--space-xl);
    font-size: 1rem;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/main-menu.css
git commit -m "feat: add main menu styles with magical fantasy theme

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第三阶段：卡牌组件重构

### Task 3: 创建卡牌组件样式

**Files:**
- Create: `public/css/cards.css`

**Step 1: 写入卡牌 CSS**

```css
/* cards.css - 卡牌组件样式 */

/* ===== 卡牌基础 ===== */
.card {
  position: relative;
  width: 120px;
  height: 160px;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-deep) 100%);
  border-radius: 10px;
  border: 3px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-bounce);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), var(--glow-gold);
  z-index: 10;
}

.card.selected {
  transform: translateY(-15px) scale(1.08);
  border-color: var(--magic-gold);
  box-shadow: 0 0 30px rgba(240, 182, 52, 0.6);
}

.card.can-play {
  border-color: #4ad94a;
  box-shadow: 0 0 20px rgba(74, 217, 74, 0.5);
  animation: can-play-pulse 2s infinite;
}

@keyframes can-play-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(74, 217, 74, 0.4); }
  50% { box-shadow: 0 0 25px rgba(74, 217, 74, 0.7); }
}

/* ===== 稀有度样式 ===== */
.card.rarity-common { border-color: var(--rarity-common); }
.card.rarity-rare {
  border-color: var(--rarity-rare);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}
.card.rarity-epic {
  border-color: var(--rarity-epic);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}
.card.rarity-legendary {
  border-color: var(--rarity-legendary);
  box-shadow: 0 0 20px rgba(240, 182, 52, 0.4);
  animation: legendary-glow 3s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(240, 182, 52, 0.4);
    border-color: var(--rarity-legendary);
  }
  50% {
    box-shadow: 0 0 40px rgba(240, 182, 52, 0.8), 0 0 60px rgba(255, 140, 0, 0.4);
    border-color: var(--magic-gold-light);
  }
}

/* ===== 费用水晶 ===== */
.card-cost {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 32px;
  height: 32px;
  background: radial-gradient(circle at 30% 30%, #5ba3e8, var(--mana));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* ===== 稀有度宝石 ===== */
.card-rarity-gem {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 16px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.card-rarity-gem::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.rarity-common .card-rarity-gem { background: var(--rarity-common); }
.rarity-rare .card-rarity-gem { background: var(--rarity-rare); }
.rarity-epic .card-rarity-gem { background: var(--rarity-epic); }
.rarity-legendary .card-rarity-gem {
  background: linear-gradient(135deg, var(--magic-gold) 0%, var(--magic-gold-dark) 100%);
  animation: gem-shine 2s infinite;
}

@keyframes gem-shine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

/* ===== 卡牌插画区域 ===== */
.card-art {
  flex: 1;
  margin: 20px 8px 8px;
  background: linear-gradient(135deg, rgba(107, 91, 255, 0.1), rgba(155, 74, 217, 0.1));
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.card-art::before {
  content: '🔮';
  font-size: 2rem;
  opacity: 0.5;
}

/* ===== 卡牌信息 ===== */
.card-info {
  padding: 6px 8px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.3));
}

.card-name {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--magic-gold);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.card-type {
  font-size: 0.625rem;
  color: var(--text-secondary);
  text-align: center;
}

/* ===== 属性值 ===== */
.card-stats {
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  pointer-events: none;
}

.card-stat {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card-attack {
  background: radial-gradient(circle at 30% 30%, var(--attack), var(--attack-dark));
  color: #000;
}

.card-health {
  background: radial-gradient(circle at 30% 30%, var(--health), var(--health-dark));
  color: white;
}

/* ===== 手牌区域 ===== */
.player-hand {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: -20px;
  padding: 20px 40px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5) 20%);
  z-index: 100;
}

.player-hand .card {
  margin-left: -30px;
  transform-origin: bottom center;
  transition: all var(--duration-normal) var(--easing-bounce);
}

.player-hand .card:first-child {
  margin-left: 0;
}

.player-hand .card:hover {
  transform: translateY(-30px) scale(1.1) rotate(0deg) !important;
  z-index: 20;
}

/* 扇形排列 */
.player-hand .card:nth-child(1) { transform: rotate(-15deg); }
.player-hand .card:nth-child(2) { transform: rotate(-10deg); }
.player-hand .card:nth-child(3) { transform: rotate(-5deg); }
.player-hand .card:nth-child(4) { transform: rotate(0deg); }
.player-hand .card:nth-child(5) { transform: rotate(5deg); }
.player-hand .card:nth-child(6) { transform: rotate(10deg); }
.player-hand .card:nth-child(7) { transform: rotate(15deg); }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .card {
    width: 90px;
    height: 120px;
  }

  .card-cost {
    width: 26px;
    height: 26px;
    font-size: 0.875rem;
  }

  .card-name {
    font-size: 0.625rem;
  }

  .player-hand {
    padding: 10px 20px;
  }

  .player-hand .card {
    margin-left: -40px;
  }
}

@media (max-width: 576px) {
  .card {
    width: 70px;
    height: 95px;
    border-width: 2px;
  }

  .card-cost {
    width: 22px;
    height: 22px;
    font-size: 0.75rem;
    top: -3px;
    left: -3px;
  }

  .player-hand {
    height: 60px;
    overflow: hidden;
    transition: height var(--duration-normal);
  }

  .player-hand.expanded {
    height: 120px;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/cards.css
git commit -m "feat: add card component styles with rarity glow effects

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第四阶段：战场界面重构

### Task 4: 创建战场界面样式

**Files:**
- Create: `public/css/battlefield.css`

**Step 1: 写入战场 CSS**

```css
/* battlefield.css - 战场界面样式 */

/* ===== 游戏屏幕 ===== */
#game-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at center, var(--bg-mystic) 0%, var(--bg-void) 100%);
  z-index: 5;
  overflow: hidden;
}

/* 背景装饰 */
#game-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(107, 91, 255, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(155, 74, 217, 0.05) 0%, transparent 40%),
    repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(240, 182, 52, 0.02) 50px, rgba(240, 182, 52, 0.02) 51px);
  pointer-events: none;
}

/* ===== 顶部信息栏 ===== */
.game-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.turn-indicator {
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--magic-gold);
  text-shadow: 0 0 10px rgba(240, 182, 52, 0.5);
}

.mana-display {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--mana);
}

.mana-display .mana-icon {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, var(--mana), var(--mana-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

/* ===== 英雄区域 ===== */
.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-md);
  position: relative;
  z-index: 5;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.hero-portrait {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-surface));
  border: 4px solid;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.hero-portrait::before {
  content: '⚔️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.hero-portrait.enemy {
  border-color: var(--health);
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
}

.hero-portrait.player {
  border-color: var(--magic-gold);
  box-shadow: 0 0 20px rgba(240, 182, 52, 0.3);
}

.hero-stats {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.hero-health {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--health);
}

.hero-armor {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--armor);
}

/* ===== 战场区域 ===== */
.battlefield {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-xl);
  padding: var(--space-md);
  position: relative;
}

/* 中线能量波动 */
.battlefield::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    rgba(107, 91, 255, 0.3),
    rgba(240, 182, 52, 0.3),
    rgba(107, 91, 255, 0.3),
    transparent
  );
  transform: translateY(-50%);
  animation: energy-flow 3s linear infinite;
}

@keyframes energy-flow {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.field-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  min-height: 120px;
  padding: var(--space-md);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed;
}

.field-row.enemy-field {
  border-color: rgba(230, 57, 70, 0.3);
}

.field-row.player-field {
  border-color: rgba(74, 217, 74, 0.3);
}

.field-row:empty::after {
  content: attr(data-empty-text);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-style: italic;
}

/* ===== 随从 ===== */
.minion {
  position: relative;
  width: 90px;
  height: 110px;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-deep) 100%);
  border: 3px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: all var(--duration-normal);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.minion:hover {
  transform: translateY(-5px);
  border-color: var(--magic-gold);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.minion.can-attack {
  border-color: #4ad94a;
  box-shadow: 0 0 20px rgba(74, 217, 74, 0.5);
  animation: ready-pulse 1.5s infinite;
}

@keyframes ready-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(74, 217, 74, 0.4); }
  50% { box-shadow: 0 0 30px rgba(74, 217, 74, 0.7); }
}

.minion.selected {
  border-color: var(--magic-gold);
  box-shadow: 0 0 25px rgba(240, 182, 52, 0.6);
  transform: translateY(-8px);
}

.minion.taunt::after {
  content: '🛡️';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  filter: drop-shadow(0 0 5px var(--magic-gold));
}

.minion-name {
  font-size: 0.625rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.minion-art {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.minion-stats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
}

.minion-stat {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.minion-attack {
  background: radial-gradient(circle, var(--attack), var(--attack-dark));
  color: #000;
}

.minion-health {
  background: radial-gradient(circle, var(--health), var(--health-dark));
  color: white;
}

/* 机制图标 */
.minion-mechanics {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mechanic-icon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== 控制按钮 ===== */
.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.control-btn {
  padding: var(--space-sm) var(--space-lg);
  font-family: var(--font-ui);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  background: linear-gradient(180deg, rgba(58, 58, 90, 0.8), rgba(42, 42, 74, 0.9));
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.control-btn:hover {
  transform: translateY(-2px);
  border-color: var(--magic-gold);
}

.control-btn.primary {
  background: linear-gradient(180deg, rgba(74, 144, 74, 0.8), rgba(42, 100, 42, 0.9));
  border-color: #4ad94a;
}

.control-btn.primary:hover {
  box-shadow: 0 0 20px rgba(74, 217, 74, 0.4);
}

.control-btn.danger {
  background: linear-gradient(180deg, rgba(144, 74, 74, 0.8), rgba(100, 42, 42, 0.9));
  border-color: var(--health);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero-portrait {
    width: 60px;
    height: 60px;
  }

  .minion {
    width: 70px;
    height: 90px;
  }

  .field-row {
    gap: var(--space-sm);
    min-height: 100px;
  }
}

@media (max-width: 576px) {
  .game-info-bar {
    padding: var(--space-xs) var(--space-sm);
  }

  .turn-indicator {
    font-size: 0.875rem;
  }

  .hero-portrait {
    width: 50px;
    height: 50px;
  }

  .minion {
    width: 55px;
    height: 75px;
  }

  .control-btn {
    padding: var(--space-xs) var(--space-md);
    font-size: 0.8125rem;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/battlefield.css
git commit -m "feat: add battlefield styles with energy effects

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第五阶段：组件样式

### Task 5: 创建通用组件样式

**Files:**
- Create: `public/css/components.css`

**Step 1: 写入组件 CSS**

```css
/* components.css - 通用组件样式 */

/* ===== 屏幕切换 ===== */
.screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.screen.hidden {
  display: none !important;
}

/* ===== 返回按钮 ===== */
.back-btn {
  position: fixed;
  top: var(--space-lg);
  left: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--duration-fast);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.back-btn:hover {
  color: var(--magic-gold);
  border-color: var(--magic-gold);
  background: rgba(0, 0, 0, 0.6);
}

/* ===== 模态框 ===== */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%);
  border: 2px solid var(--magic-gold);
  border-radius: 16px;
  padding: var(--space-xl);
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), var(--glow-gold);
  animation: fadeInScale 0.3s ease-out;
}

.modal-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all var(--duration-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--magic-gold);
  border-color: var(--magic-gold);
  transform: rotate(90deg);
}

/* ===== 对话框 ===== */
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.dialog-content {
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-mystic) 100%);
  border: 2px solid var(--magic-gold);
  border-radius: 16px;
  padding: var(--space-2xl);
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), var(--glow-gold);
  animation: fadeInScale 0.4s ease-out;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--magic-gold);
  margin-bottom: var(--space-lg);
}

.dialog-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.choice-options {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.choice-btn {
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  background: linear-gradient(180deg, var(--bg-card), var(--bg-surface));
  border: 2px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--duration-normal);
  min-width: 150px;
}

.choice-btn:hover {
  transform: translateY(-3px);
  border-color: var(--magic-gold);
  box-shadow: var(--glow-gold);
}

/* ===== 游戏消息 ===== */
.game-message {
  position: fixed;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-md) var(--space-xl);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid var(--magic-gold);
  border-radius: 10px;
  color: var(--magic-gold);
  font-family: var(--font-display);
  font-size: 1.125rem;
  text-align: center;
  z-index: 500;
  animation: message-slide 3s ease-out forwards;
}

@keyframes message-slide {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(30px);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

/* ===== 卡组构建器 ===== */
#deck-select-screen,
#deck-builder-screen,
#class-select-screen {
  padding-top: 60px;
  overflow-y: auto;
}

.screen-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--magic-gold);
  text-align: center;
  margin-bottom: var(--space-xl);
}

/* 卡组列表 */
.deck-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: 700px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.deck-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.deck-item:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: var(--magic-gold);
  transform: translateX(5px);
}

.deck-info-wrapper {
  flex: 1;
}

.deck-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--magic-gold);
  margin-bottom: var(--space-xs);
}

.deck-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.deck-actions {
  display: flex;
  gap: var(--space-sm);
}

.deck-action-btn {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.8125rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.deck-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.deck-action-btn.edit {
  border-color: var(--mana);
  color: var(--mana);
}

.deck-action-btn.play {
  border-color: #4ad94a;
  color: #4ad94a;
}

.deck-action-btn.delete {
  border-color: var(--health);
  color: var(--health);
}

/* 职业选择 */
.class-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-lg);
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.class-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--duration-normal);
  width: 130px;
}

.class-option:hover {
  transform: translateY(-8px);
  border-color: var(--magic-gold);
  box-shadow: var(--glow-gold);
}

.class-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.class-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text-primary);
}

/* 职业色彩 */
.mage-icon { background: linear-gradient(135deg, #4a90d9, #2070c0); }
.warrior-icon { background: linear-gradient(135deg, #d9a74a, #b08030); }
.hunter-icon { background: linear-gradient(135deg, #4ad94a, #30b030); }
.druid-icon { background: linear-gradient(135deg, #d94a4a, #b03030); }
.rogue-icon { background: linear-gradient(135deg, #d94ad9, #b030b0); }
.priest-icon { background: linear-gradient(135deg, #ffffff, #cccccc); }
.paladin-icon { background: linear-gradient(135deg, #f0c040, #d0a020); }
.shaman-icon { background: linear-gradient(135deg, #4a4ad9, #3030b0); }
.warlock-icon { background: linear-gradient(135deg, #6a2a8a, #4a1a6a); }
.demonhunter-icon { background: linear-gradient(135deg, #ff6b6b, #c92a2a); }
.deathknight-icon { background: linear-gradient(135deg, #4ad9d9, #2a8a8a); }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .modal-content {
    padding: var(--space-lg);
  }

  .dialog-content {
    padding: var(--space-xl);
  }

  .class-option {
    width: 100px;
    padding: var(--space-md);
  }

  .class-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .back-btn {
    top: var(--space-sm);
    left: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
  }

  .deck-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .deck-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .choice-options {
    flex-direction: column;
  }

  .choice-btn {
    width: 100%;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/components.css
git commit -m "feat: add common component styles

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第六阶段：主样式文件重构

### Task 6: 重构主样式文件

**Files:**
- Modify: `public/css/style.css`

**Step 1: 写入新主样式 CSS**

```css
/* style.css - 主样式文件 */

/* ===== 导入设计系统 ===== */
@import url('design-system.css');
@import url('main-menu.css');
@import url('cards.css');
@import url('battlefield.css');
@import url('components.css');

/* ===== 页面基础 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--font-ui);
  background: var(--bg-void);
  color: var(--text-primary);
}

/* ===== 工具类 ===== */
.hidden {
  display: none !important;
}

/* ===== 初始语言选择 ===== */
#initial-language-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, var(--bg-deep) 0%, var(--bg-void) 100%);
  z-index: 1000;
}

#initial-language-screen h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 3rem);
  color: var(--magic-gold);
  margin-bottom: var(--space-2xl);
  text-shadow: 0 0 20px rgba(240, 182, 52, 0.5);
  animation: fadeInUp 0.8s ease-out;
}

#initial-language-screen .language-selector {
  position: relative;
  top: auto;
  right: auto;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* ===== 动画关键帧 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== 打印样式 ===== */
@media print {
  .screen {
    position: relative;
    overflow: visible;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/style.css
git commit -m "feat: refactor main style.css to use modular imports

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第七阶段：HTML 结构优化

### Task 7: 更新 HTML 结构

**Files:**
- Modify: `public/index.html`

**Step 1: 读取现有 HTML 结构**

```bash
cat public/index.html
```

**Step 2: 更新 HTML 结构**

保持现有结构，但添加以下优化：

1. 添加魔法粒子背景容器
2. 优化语义化标签
3. 添加必要的类名
4. 更新标题和元信息

**关键修改点:**

```html
<!-- 在 body 开头添加 -->
<div class="magic-particles" id="particles">
  <div class="particle" style="top: 10%; left: 20%;"></div>
  <div class="particle" style="top: 30%; left: 80%;"></div>
  <div class="particle" style="top: 50%; left: 10%;"></div>
  <div class="particle" style="top: 70%; left: 60%;"></div>
  <div class="particle" style="top: 20%; left: 50%;"></div>
  <div class="particle" style="top: 80%; left: 30%;"></div>
  <div class="particle" style="top: 40%; left: 90%;"></div>
  <div class="particle" style="top: 60%; left: 40%;"></div>
</div>

<!-- 主菜单添加类名 -->
<h1 class="game-title" data-i18n="gameTitle">炉石传说 CLI</h1>

<!-- 添加版本信息 -->
<div class="version-info">v1.0.0</div>

<!-- 战场区域添加 data 属性 -->
<div class="field-row enemy-field" data-empty-text="空战场"></div>
<div class="field-row player-field" data-empty-text="空战场"></div>
```

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: optimize HTML structure with semantic tags and particles

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第八阶段：JS 适配

### Task 8: 检查并更新 JS 文件

**Files:**
- Read: `public/js/app.js`
- Read: `public/js/game.js`
- Read: `public/js/deck.js`

**Step 1: 检查现有 JS 文件**

确认 JS 中的 DOM 选择器是否需要更新以匹配新的 CSS 类名。

**可能需要调整的类名映射:**

| 旧类名 | 新类名 |
|--------|--------|
| `.menu-btn` | 保持 |
| `.card` | 保持 |
| `.minion` | 保持 |
| `.hero-portrait` | 添加 `.enemy` 或 `.player` |

**Step 2: 添加动态粒子生成**

```javascript
// 在 app.js 中添加
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (8 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

// 在初始化时调用
document.addEventListener('DOMContentLoaded', initParticles);
```

**Step 3: Commit**

```bash
git add public/js/app.js
git commit -m "feat: add particle animation initialization

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 第九阶段：测试与验证

### Task 9: 启动服务器并验证

**Step 1: 启动服务器**

```bash
npm start
```

**Step 2: 验证清单**

| 检查项 | 期望结果 |
|--------|----------|
| 主菜单 | 显示魔法粒子背景、发光标题、悬浮按钮效果 |
| 语言切换 | 正常工作，样式美观 |
| 职业选择 | 卡片悬浮效果正常 |
| 卡组构建 | 卡牌悬浮、稀有度发光正常 |
| 游戏战场 | 能量波动效果、随从可攻击脉冲光 |
| 响应式 | 移动端布局正确切换 |

**Step 3: 截图记录**

访问 http://localhost:3000 并检查各界面效果。

**Step 4: Commit 最终版本**

```bash
git add .
git commit -m "feat: complete web UI redesign with magical fantasy theme

- Add design system with CSS variables
- Implement main menu with particle effects
- Redesign card components with rarity glow
- Create battlefield with energy effects
- Add responsive design for mobile/desktop
- Optimize HTML structure and animations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 文件结构

```
public/
├── css/
│   ├── style.css              # 主样式（导入其他模块）
│   ├── design-system.css      # 设计系统（变量、动画）
│   ├── main-menu.css          # 主菜单样式
│   ├── cards.css              # 卡牌组件样式
│   ├── battlefield.css        # 战场界面样式
│   └── components.css         # 通用组件样式
├── js/
│   ├── app.js                 # 主应用逻辑
│   ├── game.js                # 游戏逻辑
│   ├── deck.js                # 卡组逻辑
│   └── api.js                 # API 接口
└── index.html                 # 主页面
```

---

## 完成标准

- [ ] 所有 CSS 模块创建完成
- [ ] HTML 结构优化完成
- [ ] JS 适配完成
- [ ] 本地测试通过
- [ ] 响应式布局验证通过
- [ ] 最终 commit 完成

---

*计划创建日期: 2026-03-04*
