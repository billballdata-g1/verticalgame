# 🎮 横版闯关游戏开发手册

> **Game Development Handbook** — 技术栈、架构、进度追踪

**项目**: `verticalgame` (GitHub)  
**引擎**: Phaser 3.70 + Vite 5.0  
**语言**: JavaScript/TypeScript  
**状态**: Step 3d-2 ✅ **物品系统模块化完成！**

---

## 📋 **快速开始（Session 重启后）**

### **1️⃣ 了解项目背景**
```bash
# 阅读开发大纲（完整游戏设计）
cat docs/plans/outline_v1.0.md

# 查看 Git 提交历史（了解当前进度）
git log --oneline -10

# ⭐ 使用 s.gameResume 恢复上下文
s.gameResume
```

---

### **2️⃣ 测试游戏** ::GAMERESUME_TEST_START::
```bash
cd /home/billv/workspace/game && npm run dev
# → 打开 http://localhost:3000
# 🎮 操作：←→移动，↑/空格跳跃 | 💨 收集鞋子后解锁二段跳
```
::GAMERESUME_TEST_END::

---

### **3️⃣ 继续开发 Step N**
```bash
# ⭐ 新架构：修改对应的模块文件（而不是 main.js）
vi src/enemies/[new]Enemy.js       # 新增敌人
vi src/items/[new]Item.js          # 新增物品
vi src/main.js                     # 只在主文件中调度

# 完成后提交
s.git commit "Step N: xxx"
s.git push
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
| `vite` | ^5.0.0 | 开发服务器 + HMR（热重载）|
| `git` | - | 版本控制 |
| `s.git` | v2.0 | 自动化 Git 技能（提交+Push）|

---

## 📁 **项目结构（v3.0 — 完全模块化架构）** ⭐ NEW

### **【旧架构】→【新架构】对比**
```bash
# ❌ 旧架构（内联代码，800+ 行全部在 main.js）：
game/src/main.js (所有敌人逻辑都在这里)

# ✅ 新架构（模块化，main.js 只负责调度）：
game/
├── src/
│   ├── main.js                    ← 🎮 游戏主逻辑（~380 行，只负责调度）
│   ├── enemies/                   ← ⭐ 敌人模块目录
│   │   ├── types.js               — 共享常量 (HP_PER_BLOCK, HIT_COOLDOWN)
│   │   ├── index.js               — 统一导出口
│   │   ├── cookieEnemy.js         — 🍪 Walker 类型（地面巡逻）
│   │   ├── fleaEnemy.js           — 🦟 Jumper 类型（跳跃探索）
│   │   └── shooterEnemy.js        — 🎯 Static Turret（远程炮台，360°追踪）
│   └── items/                     ← ⭐ 物品模块目录
│       ├── types.js               — 共享常量 (EQUIPMENT_SLOTS, ITEM_TYPES)
│       ├── index.js               — 统一导出口
│       ├── ItemManager.js         — 💼 核心管理器（装备系统）
│       └── doubleJumpShoesItem.js — 💨 二段跳鞋子道具
├── docs/
│   ├── plans/outline_v1.0.md      — 📚 完整游戏开发大纲
│   └── debug.md                   — 🐛 Debug 记录与错题本
├── log/
│   └── log_*.md                   — 📝 Git 提交日志
├── index.html
├── package.json
├── vite.config.js
└── README.md                      ← 📖 **本手册**
```

---

## 🎯 **当前进度**

### **Step 1: 项目初始化 + 玩家移动 ✅ COMPLETED**
- Commit ID: `5f240ff` → `4023390`
- Phaser 初始化、Vite 配置、红色方块玩家（←→↑跳跃）

---

### **Step 2a: 平台系统 ✅ COMPLETED**
- Commit ID: `b3e0bb6`
- 5 个不同高度的静态平台

---

### **Step 2b-1 ~ 2b-5: 敌人系统 + 血量 UI ✅ COMPLETED**
- Commit IDs: `32f8acc` → `7b2cf77` → `08bcd95`
- 🍪 饼干人（Walker）、🦟 跳蚤（Jumper）、双向掉血、小方块拼接血条

---

### **Step 2c: 二段跳系统 ✅ COMPLETED**
- Commit ID: `_待提交_`
- 💨 金黄色鞋子道具，收集后解锁二段跳

---

## ⭐ **Step 2e: 敌人系统模块化重构 ✅ COMPLETED (2026-03-21)**

### **【旧架构】→【新架构】**
```bash
# ❌ 旧架构（内联代码）：
game/src/main.js (800+ 行，所有敌人逻辑混在一起)

# ✅ 新架构（模块化）：
game/
├── src/main.js (300+ 行) 
│   ├── import { cookieEnemy, fleaEnemy } from './enemies'
│   └── cookieEnemy.create/update() ← API 调用
└── src/enemies/
    ├── types.js          ← 共享常量
    ├── index.js          ← 统一导出口
    ├── cookieEnemy.js    ← 🍪 Walker（地面巡逻）
    ├── fleaEnemy.js      ← 🦟 Jumper（跳跃探索）
    └── shooterEnemy.js   ← 🎯 Static Turret（远程炮台，360°追踪，已集成！）
```

### **重构成果**
| 指标 | 旧架构 | 新架构 | 提升 |
|------|--------|--------|------|
| main.js 行数 | 800+ | 300+ | ↓ 60% |
| 新增敌人侵入性 | ❌ 需要改 main.js | ✅ 零侵入 | ⭐⭐⭐ |

### **重构过程 Bug 记录**
| Bug # | 问题 | 解决方案 | Commit ID |
|-------|------|----------|------------|
| #1 | 杀死怪物后血条不消失 | cleanup() API + healthBlocks 参数传递 | `7fb1e8e` |
| #2 | 杀死怪物后画面冻结 | 直接调用本地 cleanup()（不是 cookieEnemy.cleanup） | `7fb1e8e` |
| #4 | setStatic() 导致蓝屏（Turret） | setImmovable() + allowGravity = false | `e5ffc37` |

### **相关文档**
- 📝 完整记录：`log/log_2026-03-21_1800.md`
- 📚 s.gamebuilder: ⭐ 核心理念 #2 "模块化架构设计（从第一天开始！）"
- 🔧 s.enemybuilder: v2.0 Bug #1-4 实战记录

---

## ⭐ **Step 3d: 物品系统模块化 ✅ COMPLETED (2026-03-23)**

### **Step 3d-1 ~ 3d-2: ItemManager + Double Jump Shoes ✅**

#### **【旧架构】→【新架构】**
```bash
# ❌ 旧架构（内联代码在 main.js）：
game/src/main.js (所有物品逻辑混在一起)

# ✅ 新架构（模块化）：
game/
├── src/main.js 
│   ├── import { itemManager, doubleJumpShoesItem } from './items'
│   └── itemManager.collect() ← API 调用
└── src/items/
    ├── types.js              ← 共享常量 (EQUIPMENT_SLOTS, ITEM_TYPES)
    ├── index.js              ← 统一导出口
    ├── ItemManager.js        ← 💼 核心管理器（4.9KB）
    └── doubleJumpShoesItem.js — 💨 二段跳鞋子道具
```

#### **itemConfig — 8 个核心维度**
```javascript
const itemConfig = {
    id: 'double_jump_shoes',      // 🆔 唯一标识
    spawnPosition: {...},         // 📍 初始化位置 (500, 360)
    collectibleBy: { player: true }, // 👥 谁可以收集
    visualization: {...},         // 👁️ 可视化设置（persist, attachToBodyPart）
    equipmentSlot: { bodyPart: 'feet' }, // 🎒 装备槽位
    effects: [{ type: 'ability_unlock', ability: 'double_jump' }], // ⚡ 功能效果
    upgradeable: {...},           // ⬆️ 升级机制
    duration: { persistent: true }, // ⏱️ 持久化时间
    destructible: false           // 💥 能否被破坏
};
```

#### **模块化带来的好处：**
1. **主程序代码减少** — 物品逻辑从 main.js 抽离
2. **新增物品零侵入** — 加新物品不需要改 main.js
3. **测试隔离** — 可以单独测试每个物品模块
4. **Bug 定位快** — 问题出在哪个模块一目了然

#### **相关文档**
- 📝 ItemManager API：`src/items/ItemManager.js`
- 🐛 Bug 记录：`src/items/BUGS_AND_FIXES.md`（鞋子抖动修复等）

---

## 🔄 **开发工作流**

### **Step N 标准流程：**
```bash
# Step 1: 查看当前进度
cat README.md          # 了解项目背景、当前状态
git log --oneline -5   # 看最近的提交历史

# Step 2: 运行游戏测试现有功能
npm run dev

# Step 3: 修改代码（⭐ 新架构下）
vi src/enemies/[new]Enemy.js    # 新增敌人模块
vi src/items/[new]Item.js       # 新增物品模块
vi src/main.js                  # 只在主文件中调度

# Step 4: Step N 完成，提交！
s.git commit "Step N: xxx"
s.git push

# Step 5: 更新本 README.md（当前进度、下一步计划）
```

---

## 🛠️ **故障排查**

### **问题：npm run dev 启动失败**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **问题：Phaser 报错找不到资源**
- Step 1 使用色块（程序生成纹理），无需外部图片
- 后期加载精灵图时确保路径正确

### **问题：Git Push 失败**
```bash
gh auth status
# 重新生成 Token（https://github.com/settings/tokens）
```

---

## 📚 **相关文档**

| 文件 | 说明 |
|------|------|
| `docs/plans/outline_v1.0.md` | 完整游戏开发大纲（Phase 1-4）|
| `docs/debug.md` | Debug 记录与错题本（Bug #1-5）|
| `log/log_*.md` | Git 提交日志，记录每个 Step 的改动 |
| `/home/billv/workspace/MEMORY.md` | 用户长期记忆（偏好、习惯等）|

---

## 🐛 **已知问题 (Known Issues)**

### ✅ **Bug #1: 血条宽度不变化 — FIXED**  
**修复日期**: 2026-03-21 12:04  
**方案**: 小方块拼接法（每块代表 5HP）

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
|------|----------|------------|
| 2026-03-23 | Step 3d-2: Double Jump Shoes modularization | `9dea188` |
| 2026-03-23 | Step 3d-1 & 3d-2: ItemManager framework + Double Jump Shoes modularization | `a6b7708` |
| 2026-03-22 | feat: 360° dynamic player tracking for shooter enemy | `9551407` |
| 2026-03-21 | Step 2e-1c: Integrate shooterEnemy into main game | `e5ffc37` |
| 2026-03-21 | Step 2e-1b: Fix health bar cleanup and game freeze bug | `7fb1e8e` |
| 2026-03-21 | Step 2e-1: Standardize cookieEnemy + fleaEnemy module architecture | `04c9bcf` |
| ... | ... | ... |

---

*最后更新：2026-03-25 13:17 GMT+8*
