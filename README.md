# 🎮 横版闯关游戏开发手册

> **Game Development Handbook** — 技术栈、架构、进度追踪

**项目**: `verticalgame` (GitHub)  
**引擎**: Phaser 3.70 + Vite 5.0  
**语言**: JavaScript/TypeScript  
**状态**: Step 1 ✅ | Step 2a ✅ | Step 2b-5 ✅

---

## 📋 **快速开始（Session 重启后）**

### **1️⃣ 了解项目背景**
```bash
# 阅读开发大纲（完整游戏设计）
cat docs/plans/outline_v1.0.md

# 查看 Git 提交历史（了解当前进度）
git log --oneline -10
```

---

### **2️⃣ 运行项目**
```bash
cd /home/billv/workspace/game
npm run dev    # 启动 Vite 开发服务器，自动打开 http://localhost:3000
```

---

### **3️⃣ 继续开发 Step N**
```bash
# 修改 src/main.js (游戏主逻辑)
# ...

# 完成后提交
s.git commit "Step N: xxx"
s.git push

# 更新本 README.md（当前进度、下一步计划）
```

---

## 🔧 **技术栈**

### **核心引擎：Phaser 3.70** ⭐⭐⭐⭐⭐
- **GitHub**: https://github.com/photonstorm/phaser (28K+ stars)
- **文档**: https://new.phaser.io/docs/3.70/
- **为什么选它？**
  - ✅ 全球最大的 HTML5 游戏框架
  - ✅ 内置 Arcade Physics（专门做平台跳跃）
  - ✅ 社区活跃，Google "Phaser [问题]" → 99% 能找到答案

---

### **开发工具链**

| 工具 | 版本 | 用途 |
|------|------|------|
| `phaser` | ^3.70.0 | 游戏引擎核心 |
| `vite` | ^5.0.0 | 开发服务器 + HMR（热重载） |
| `git` | - | 版本控制 |
| `s.git` | v2.0 | 自动化 Git 技能（提交+Push）|

---

## 📁 **项目结构**

```
/home/billv/workspace/game/
├── docs/plans/                   ← 📚 文档目录
│   └── outline_v1.0.md          — 完整游戏开发大纲（Phase 1-4）
├── log/                          ← 📝 Git 提交日志
│   ├── log_2026-03-20_1044.md    (Step 1a: Phaser 初始化)
│   └── log_2026-03-20_1113.md    (Step 1b: Git + GitHub 配置)
├── src/
│   └── main.js                   ← 🎮 游戏主逻辑（Phaser Scene）
├── index.html                    — HTML 入口
├── package.json                  — npm 配置
├── vite.config.js                — Vite 配置
├── .gitignore                    — Git 忽略规则
└── README.md                     ← 📖 **本手册（开发交接文档）**
```

---

## 🎯 **当前进度**

### **Step 1: 项目初始化 + 玩家移动 ✅ COMPLETED**

**Commit ID**: `5f240ff` → `4023390`

**实现的功能：**
```javascript
// src/main.js — Step 1 代码概览
const config = {
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 1200 } } },
};

// 玩家：红色方块 (32x48px)
this.player = this.physics.add.sprite(100, 450, 'player');

// 控制：← → 移动，↑/空格 跳跃
if (cursors.left.isDown) player.setVelocityX(-250);
if (cursors.up.isDown && touching.down) player.setVelocityY(-500);
```

**运行效果：**
- 🔴 红色方块玩家站在绿色地面上
- ← → 左右移动（速度 250 px/s）
- ↑/空格 跳跃（向上速度 -500 px/s）
- 📊 左上角调试信息显示位置、速度等数据

---

### **Step 2a: 平台系统 ✅ COMPLETED**

**Commit ID**: `b3e0bb6`

**实现的功能：**
```javascript
const platformsData = [
    { x: 150, y: 480 },   // 最低的平台
    { x: 350, y: 380 },   // 中等高度
    { x: 200, y: 280 },   // 较高
    { x: 450, y: 200 },   // 更高
    { x: 650, y: 150 },   // 最高平台
];
```

---

### **Step 2b-1 ~ 2b-3: 敌人系统 ✅ COMPLETED**

**Commit IDs**: `32f8acc` → `7b2cf77`

**实现的功能：**
- 🍪 饼干人纹理渲染（圆形身体 + 眼睛 + 嘴巴）
- ⬇️ 受重力影响，站在平台/地面上
- ↔️ 左右巡逻移动（550-650px 范围）

---

### **Step 2b-4: Game Over 系统 ✅ COMPLETED**

**Commit ID**: `7b2cf77`

**实现的功能：**
- 💀 玩家碰到敌人 → 显示红色 Game Over UI
- ⌨️ 按 R 键重新开始游戏

---

### **Step 2b-5: 血量系统 + 血条 UI ✅ COMPLETED**

**Commit ID**: `_（待提交）_`  
**修复日期**: 2026-03-21 12:04

**实现方案：小方块拼接法** 💡
```javascript
// 玩家血条：20 个小方块 × 5HP = 100HP（左上角固定）
for (let i = 0; i < PLAYER_MAX_BLOCKS; i++) {
    this.playerHealthBlocks[i].setVisible(i < playerVisibleBlocks);
}

// 敌人血条：12 个小方块 × 5HP = 60HP（头顶跟随移动）
this.enemyHealthBlocks[i].setPosition(startX + i * ENEMY_BLOCK_SIZE, barCenterY);
```

**核心思想：**
- ❌ ~~原方案：修改 Rectangle 的 `.width` → Bug 难排查~~
- ✅ **新方案：每个小方块代表 5HP，掉血时右侧方块逐个消失**

**视觉效果：**
- ❤️ 玩家血条 — 左上角固定位置，绿色小方块横向排列
- 🍪 敌人血条 — 头顶上方跟随移动，红色小方块横向排列

---

---

## 🔄 **开发工作流**

### **Step N 标准流程：**

```bash
# Step 1: 查看当前进度
cat README.md          # 了解项目背景、当前状态
git log --oneline -5   # 看最近的提交历史

# Step 2: 运行游戏测试现有功能
npm run dev

# Step 3: 修改代码（在 src/main.js）
vi src/main.js         # 或你喜欢的编辑器

# Step 4: Step N 完成，提交！
s.git commit "Step N: xxx"
s.git push

# Step 5: 更新本 README.md
# — 当前进度 → 下一步计划
```

---

## 🛠️ **故障排查**

### **问题：npm run dev 启动失败**
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

---

### **问题：Phaser 报错找不到资源**
- Step 1 使用色块（程序生成纹理），无需外部图片
- 后期加载精灵图时确保路径正确：`this.load.image('player', 'assets/player.png')`

---

### **问题：Git Push 失败**
```bash
# 检查 Token 权限
gh auth status

# 重新生成 Token（https://github.com/settings/tokens）
# Scope: repo（完整私有仓库访问）
```

---

## 📚 **相关文档**

| 文件 | 说明 |
|------|------|
| `docs/plans/outline_v1.0.md` | 完整游戏开发大纲（Phase 1-4）|
| `log/log_*.md` | Git 提交日志，记录每个 Step 的改动 |
| `/home/billv/workspace/MEMORY.md` | 用户长期记忆（偏好、习惯等）|

---

## 🐛 **已知问题 (Known Issues)**

### ✅ **Bug #1: 血条宽度不变化 — FIXED**  
**修复日期**: 2026-03-21 12:04

**原症状**: HP 数字正常显示和变化，但血条宽度始终固定。

**失败方案：**
1. ❌ `.setOrigin(0)` — Phaser Rectangle 锚点设置
2. ❌ `setPosition()` — 敌人血条跟随移动
3. ❌ 强制刷新、重启 Vite
4. ❌ `setScaleX()` 替代 `.width`

**✅ 最终解决方案：小方块拼接法**
- 每块代表 5HP，掉血时右侧方块逐个消失
- 本质思考："血条"的核心是可视化血量变化 — **如何实现不重要，效果对就行**

---

### ⚠️ **Bug #2: R 键不重置敌人** 🟡 MEDIUM

R 键只重置玩家位置和血量，敌人不会重新生成。

---

## 🔗 **外部链接**

- **GitHub**: https://github.com/billballdata-g1/verticalgame
- **Phaser Docs**: https://new.phaser.io/docs/3.70/
- **Vite Docs**: https://vitejs.dev/

---

## 📝 **版本历史**

| 日期 | 更新内容 | Commit ID |
|------|----------|-----------|
| 2026-03-21 | Step 2b-5: FIX health bar with block-based approach | `_（待提交）_` |
| 2026-03-20 | Step 2b-5: Add bidirectional HP system + debug UI | `08bcd95` |
| 2026-03-20 | Step 2b-3: Add enemy patrol movement | `7b2cf77` |
| 2026-03-20 | Step 2b-2: Put cookie enemy into physics world | `87d38c7` |
| 2026-03-20 | Step 2b-1: Add cookie enemy texture rendering | `32f8acc` |
| 2026-03-20 | Step 2a: Add platform system with 5 platforms | `b3e0bb6` |
| 2026-03-20 | docs: 创建测试与 Debug 指引 | `b938735` |
| 2026-03-20 | docs: 创建开发手册 README.md | `9aac7ef` |
| 2026-03-20 | Step 1b: 保存完整开发大纲 v1.0 | `4023390` |
| 2026-03-20 | Step 1: Phaser 初始化 + 玩家移动 | `5f240ff` |

---

*最后更新：2026-03-20 17:00 GMT+8*
