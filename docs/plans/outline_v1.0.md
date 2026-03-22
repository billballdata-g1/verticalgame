# 🎮 《横版闯关游戏》v1.0 - 开发大纲

**创建时间**: 2026-03-20 10:29 GMT+8  
**版本**: v1.0（初始版本）

---

## 📋 **技术选型**

### **游戏引擎：Phaser 3** ⭐⭐⭐⭐⭐

| 需求 | Phaser 是否满足 |
|------|-----------------|
| 🔥 **社区活跃** | ✅ GitHub 28K+ stars，全球最大的 HTML5 游戏框架 |
| 📚 **文档完整** | ✅ 官方文档 + API 参考 + 教程视频 |
| 🐛 **易调试** | ✅ Google "Phaser [问题]" → 99% 能在 StackOverflow 找到答案 |
| 💪 **社区支持** | ✅ Discord、Reddit、中文社区都有活跃讨论 |
| 🎮 **适合横版游戏** | ✅ 内置 Arcade Physics，专门做平台跳跃的 |

---

## 🚀 **阶段划分（最小可迭代步骤）**

### **阶段一：基础框架 (1-2 次交互)**

#### **Step 1: 项目初始化 + 玩家移动** ✅ COMPLETED
```
目标：跑通第一个版本，能看到红色方块在地面上跳来跳去
```

**具体任务：**
- [x] 创建 `/home/billv/workspace/game/` 目录结构
- [x] npm init + 安装 phaser@^3.70.0 + vite@^5.0.0
- [x] 配置 Vite 开发服务器（端口 3000）
- [x] Phaser 游戏主循环、窗口设置（800x600）
- [x] Arcade Physics 物理引擎启用（重力 y=1200）
- [x] 绘制红色方块作为玩家（32x48px）
- [x] 键盘控制左右移动 (← →) — 速度 250 px/s
- [x] 空格键/↑ 跳跃 — 向上速度 -500 px/s
- [x] 地面碰撞检测（绿色长条，深绿色 #2d5a3d）
- [x] Git 初始化 + GitHub 远程仓库（verticalgame）
- [x] Commit: "Step 1: Phaser 3 project initialization"

**预期效果：**
```
浏览器打开 http://localhost:3000/
┌─────────────────────────────────────┐
│                                   │ ← 天空蓝 #87CEEB
│         🟥 (红色方块玩家)          │
│                                    │
│                                    │
│        ←──────────────────→        │
│___________________________________│ ← 深绿色地面
│
调试信息：位置 (100, 450), 在地面:true
```

---

### **阶段二：核心玩法 (2-3 次交互)**

#### **Step 2a: 平台系统** ⏳ PENDING
```
目标：在空中搭建可站立的平台，玩家能跳上去、站在上面
```

**具体任务：**
- [ ] 创建静态平台组 `this.platforms = this.physics.add.staticGroup()`
- [ ] 设计简单的地图数据结构（数组存储平台坐标）
- [ ] 平台碰撞检测 — 玩家从上方落下时能站立
- [ ] 测试：玩家在平台上左右移动不掉下去

**示例代码结构：**
```javascript
const platformsData = [
    { x: 150, y: 400 },  // 第一个平台
    { x: 350, y: 320 },  // 第二个（更高）
    { x: 550, y: 240 }   // 第三个（最高，需要跳两次）
];
```

---

#### **Step 2b: 敌人系统** ⏳ PENDING
```
目标：简单巡逻的方块，碰到会死（Game Over）
```

**具体任务：**
- [ ] 创建动态敌人组 `this.enemies = this.physics.add.group()`
- [ ] 红色方块敌人 — 在固定范围内来回巡逻
- [ ] 敌人与玩家的碰撞检测（所有方向都算碰到会死）
- [ ] Game Over → Restart 循环
- [ ] 简单的死亡动画或提示

---

#### **Step 2c: 踩扁机制** ⏳ PENDING
```
目标：从上方落下时消灭敌人（马里奥经典！）+ 弹跳效果
```

**具体任务：**
- [ ] 检测玩家是否从上方接触敌人
- [ ] 敌人消失 + 播放简单的动画/音效
- [ ] 玩家轻微弹跳（向上速度 -200）
- [ ] 得分系统 — 踩扁一个得 100 分

**判定逻辑：**
```javascript
// 只有当玩家在敌人的上方时才算踩扁
if (player.y < enemy.y && player.body.touching.down) {
    // 👊 踩扁敌人！
}
```

---

### **阶段三：游戏完整化 (2-3 次交互)**

#### **Step 3a: 关卡设计** ⏳ PENDING
```
目标：多平台、多个敌人的布局，有明确的终点/胜利条件
```

**具体任务：**
- [ ] 完整的关卡地图（包含起点、终点）
- [ ] 终点旗杆或金币 — 触达后显示 "Victory!"
- [ ] Victory → Restart 循环
- [ ] 简单的关卡编辑器（在代码里配置数组即可修改）

---

#### **Step 3b: 视觉美化** ⏳ PENDING
```
目标：把色块换成简单的像素风格精灵图，添加 UI
```

**具体任务：**
- [ ] 玩家精灵图 — 简单的像素小人（或保持红色方块）
- [ ] 敌人精灵图 — 小怪物/史莱姆形象
- [ ] 踩扁动画效果 — 敌人被压扁的视觉效果
- [ ] UI：分数显示、生命数
- [ ] 背景图片（可选）

---

### **阶段四：进阶功能 (可选)** ⏳ PENDING

| 功能 | 描述 |
|------|------|
| 🎵 **背景音乐 + 音效** | 跳跃声、踩扁声、胜利音乐 |
| 💎 **收集品系统** | 金币？道具？ ⭐ STEP 3D-1 ~ 3D-5 |
| 🔥 **更多敌人类型** | 会飞的？会跳的？ |
| 🗄️ **多关卡系统** | 不同难度的关卡 |

---

### **Step 3d: 物品/装备系统架构与实现** ⏳ PENDING

```yaml
目标：模块化物品系统，支持装备槽位、升级机制、跟随移动等完整功能
参考：src/enemies/的模块化设计模式
```

#### **完整开发路线图（逐步验证）**

| Step | 任务 | Checkbox | 说明 |
|------|------|----------|------|
| **3d-1** | ItemManager 框架搭建 | `[x]` ✅ | 📁 `src/items/ItemManager.js` + types.js + index.js |
| **3d-2** | Speed Shoes → 模块化物品 | `[x]` ✅ | 👟 `src/items/doubleJumpShoesItem.js`，从 main.js 抽离 |
| **3d-3** | Update Loop — 物品跟随移动 | `[ ]` | ⚙️ 在 scene.update() 中添加 `itemManager.update()` |
| **3d-4** | 升级机制测试 | `[ ]` | ⬆️ Level Up + stat_modify 效果验证 |
| **3d-5** | 新物品实现（Health Pack / Shield） | `[ ]` | ❤️/🛡️ 复制模板，快速迭代新物品 |

#### **itemConfig — 8 个核心维度**

```javascript
const itemConfig = {
    id: 'speed_shoes',              // 🆔 唯一标识
    spawnPosition: {...},           // 📍 初始化位置
    collectibleBy: {...},           // 👥 谁可以收集
    visualization: {...},           // 👁️ 可视化设置（persist, attachToBodyPart）
    equipmentSlot: {...},           // 🎒 装备槽位（bodyPart: head/hands/feet/chest）
    effects: [...],                 // ⚡ 功能效果（stat_modify, ability_unlock, behavior_change）
    upgradeable: {...},             // ⬆️ 升级机制（maxLevel, levelUpEffects）
    duration: {...},                // ⏱️ 持久化时间
    destructible: {...}             // 💥 能否被破坏
};
```

#### **目标目录结构**

```bash
src/items/
├── types.js          ← 共享常量（EQUIPMENT_SLOTS, ITEM_TYPES）
├── index.js          ← 统一导出口
├── ItemManager.js    ← ⭐ 核心：装备系统管理器
└── [items]/
    ├── speedShoesItem.js   — 💨 Speed Shoes
    ├── healthPackItem.js   — ❤️ Health Pack
    └── shieldItem.js       — 🛡️ Shield（可破坏）
```

---

## 📁 **当前项目结构（Step 1）**

```
/home/billv/workspace/game/
├── docs/
│   └── plans/
│       └── outline_v1.0.md        ← 📄 本大纲文件
├── log/
│   ├── log_2026-03-20_1044.md    ← Step 1a: Phaser 初始化日志
│   └── log_2026-03-20_1113.md    ← Step 1b: Git + GitHub 配置日志
├── src/
│   ├── main.js                    ← 游戏主逻辑
│   ├── enemies/                   ← 👾 敌人模块化目录
│   │   ├── types.js              ← 共享常量
│   │   ├── index.js              ← 统一导出口
│   │   ├── cookieEnemy.js        ← 🍪 Walker 类型
│   │   ├── fleaEnemy.js          ← 🦟 Jumper 类型
│   │   └── shooterEnemy.js       ← 🎯 Shooter 类型
│   └── items/                     ← 💎 物品系统目录 ⭐ NEW!
│       ├── types.js              ← 共享常量
│       ├── index.js              ← 统一导出口
│       └── ItemManager.js        ← ⭐ 核心：装备系统管理器
├── index.html                     ← HTML 入口
├── package.json                   ← npm 配置
└── vite.config.js                 ← Vite 配置
```

---

## 🚀 **运行方式**

```bash
# 进入项目目录
cd /home/billv/workspace/game

# 启动开发服务器（自动打开浏览器）
npm run dev
```

访问：http://localhost:3000

---

## 🔄 **版本管理**

### **Step N 完成后保存：**
```bash
s.git commit "Step N: xxx"
s.git push
```

### **如果出错，回退到上一个版本：**
```bash
s.git revert    # 撤销最近一次提交
```

---

## 📊 **进度追踪**

| Step | 状态 | Commit ID | 备注 |
|------|------|-----------|------|
| Step 1: 项目初始化 + 玩家移动 | ✅ COMPLETED | `5f240ff` | Phaser + Vite |
| Step 2a: 平台系统 | ✅ COMPLETED | `b3e0bb6` | 5 个平台 |
| Step 2b-1 ~ 2b-3: 饼干敌人渲染/巡逻 | ✅ COMPLETED | `7b2cf77` | 🍪 Walker 类型 |
| Step 2b-4: Game Over + R 键重启 | ✅ COMPLETED | `7b2cf77` | 红色 UI |
| **Step 2b-5: 双向血量系统 + 血条 UI** | ✅ **COMPLETED (FIXED)** | `_待提交_` | 💡小方块拼接法修复 |
| Step 2c-1 ~ 2c-3: 跳蚤敌人 🦟 | ✅ COMPLETED | `_待提交_` | Jumper + Player Attraction |
| Step 2d: 鞋子道具 - 二段跳 💨 | ✅ COMPLETED | `_待提交_` | 金黄色鞋子，位置 (500,360) |
| **Step 2e: 敌人模块化架构** | ⏳ **IN PROGRESS** | — | 📁 `src/enemies/` 已创建 |
| **Step 3d-1 ~ 3d-5: 物品系统架构与实现** | ❌ PENDING | — | 📁 `src/items/` 待创建 ⭐ NEW!

---

### 🔴 **当前正在做：Step 2e - 敌人系统重构与集成计划**

#### 📋 **完整开发流程（逐步验证）**

```yaml
Phase 1: 标准化代码结构 ✅ COMPLETED
───────────────────────────────────────
Step 2e-1: 统一饼干人 + 跳蚤的代码架构
           
目标：确保两个敌人的模块遵循 enemybuilder skill 的标准格式

现状:
  ✅ src/enemies/types.js         (共享常量 HP_PER_BLOCK, HIT_COOLDOWN)
  ✅ src/enemies/index.js          (导出口 cookieEnemy, fleaEnemy, shooterEnemy)
  ✅ src/enemies/cookieEnemy.js    (标准化 Walker 类型模块)
  ✅ src/enemies/fleaEnemy.js      (标准化 Jumper 类型模块)
  ✅ skills/enemybuilder/SKILL.md  (完整标准化指南)

验证:
  - export const config = {...}       ← ✅ 配置常量统一格式
  - export function create(scene)     ← ✅ 创建敌人实例
  - export function createHealthBar() ← ✅ 血条 UI 工厂函数
  - export function setupColliders()  ← ✅ 碰撞检测设置
  - export function update()          ← ✅ 每帧更新逻辑

下一步：在 GitHub 上建 branch，保存这个标准化成果！

---

Phase 2: 重构主程序 ⏳ PENDING
───────────────────────────────────────
Step 2e-2a: 讨论是否编写代码生成脚本
            
目的：减少手动复制粘贴，提高重构效率
方案:
  Option A: 写一个 Node.js 脚本
    - 读取 enemy module 的配置
    - 自动生成 main.js 中需要的代码片段
    - 输出到剪贴板（直接粘贴）
  
  Option B: 手动复制粘贴模板
    - 准备标准化代码模板
    - 替换变量名即可
    - 适合一次性重构，不值得写脚本

决策：[等待讨论]

Step 2e-2b: 正式重构 main.js（不管用不用脚本）
           
任务:
  a. 移除内联敌人代码
     ❌ 删除所有直接在 create() 中绘制的敌人纹理
     ❌ 删除 inline 的 enemy physics setup
     ❌ 删除 update() 中的敌人行为逻辑
  
  b. 使用模块化 API
     ✅ import { cookieEnemy, fleaEnemy } from './enemies'
     ✅ this.cookieSprite = cookieEnemy.create(this)
     ✅ this.fleaSprite = fleaEnemy.create(this)
     ✅ 调用 setupColliders() + update()

---

Phase 3: 逐步集成敌人（逐个验证） ⏳ PENDING
───────────────────────────────────────
Step 2e-3a: 只放饼干人进去测试
            
目的：最小化变量，确保重构正确
流程:
  1. main.js 中只保留 cookieEnemy 的代码
  2. npm run dev → 测试游戏运行
  3. 验证：移动/跳跃/踩扁/接触掉血/血条显示都正常
  
成功标准:
  ✅ 饼干人正确渲染在 (600, 200)
  ✅ 左右巡逻 + 玩家吸引机制正常
  ✅ 踩扁秒杀生效，血条更新正常

Step 2e-3b: 加跳蚤进去测试
             
流程:
  1. main.js 中添加 fleaEnemy
  2. npm run dev → 验证两个敌人同时存在
  3. 检查：
     - 饼干人 + 跳蚤独立巡逻/跳跃
     - 血条不冲突（depth 层级正确）
     - 碰撞检测各自独立工作

成功标准:
  ✅ 两个敌人都正常渲染和移动
  ✅ 血条显示在不同 height，不重叠
  ✅ 踩扁饼干人后跳蚤不受影响

Step 2e-3c: 加 shooterEnemy 进去测试
               
流程:
  1. main.js 中添加 shooterEnemy（静态炮台！）
  2. npm run dev → 验证三个敌人同时存在
  3. 检查：
     - shooter 固定在 (400, 350)，不移动
     - 每 2 秒向右发射子弹
     - 踩扁 shooter 秒杀生效

成功标准:
  ✅ 射手炮台静止不动，定时射击
  ✅ 三个敌人血条互不干扰
  ✅ 所有碰撞检测正常工作
```

---

#### 📊 **Phase 4: 经验总结与文档更新** ⏳ PENDING

```yaml
Step 2e-4a: 更新 enemybuilder skill
            
添加内容:
  - ✅ 完整的重构案例（从内联 → 模块化）
  - ✅ 代码模板对比（before/after）
  - ✅ 常见陷阱和解决方案

Step 2e-4b: 更新 gamebuilder skill
             
添加内容:
  - ✅ 模块化架构设计原则
  - ✅ "逐步集成，逐个验证"的工作流
  - ✅ GitHub branch 管理策略（feature branch → main）
```

---

*大纲版本：v1.0 — 最后更新：2026-03-21 16:25 GMT+8*

---

## 🚨 **当前卡住的问题 (2026-03-21)**

### ✅ **血条宽度不变化 Bug** — FIXED 💡

**修复日期**: 2026-03-21 12:04

**原症状**: HP 数字正常显示和更新，但血条宽度始终固定。

**失败方案**: 
- ❌ `.setOrigin(0)` — Phaser Rectangle 锚点设置
- ❌ `setPosition()` — 敌人血条跟随移动
- ❌ 强制刷新、重启 Vite
- ❌ `setScaleX()` 替代 `.width`

**✅ 最终解决方案：小方块拼接法**
- 每块代表 5HP，掉血时右侧方块逐个消失
- **本质思考**: "血条"的核心是可视化血量变化 — **如何实现不重要，效果对就行**

---

## 🎯 **下一步行动计划**

### 🔴 **当前任务：Step 2e-1 - 标准化完成，准备建 Branch**

```bash
# ✅ 已完成：饼干人 + 跳蚤的代码结构已统一

# ⏳ 下一步：在 GitHub 上创建 feature branch
gh repo fork billballdata-g1/verticalgame  # (如果需要)
gh checkout -b feature/modular-enemy-system
# Add commit message about standardized enemy modules
```

### 📋 **完整流程概览**

| Phase | Step | 任务 | 状态 |
|-------|------|------|------|
| **Phase 1** | 2e-1 | 标准化敌人代码结构 | ✅ DONE |
| | — | GitHub 建 branch + commit | ⏳ NEXT |
| **Phase 2** | 2e-2a | 讨论是否写代码生成脚本 | ⏳ TODO |
| | 2e-2b | 重构 main.js 使用模块化 API | ⏳ TODO |
| **Phase 3** | 2e-3a | 只放饼干人进去测试 | ⏳ TODO |
| | 2e-3b | 加跳蚤进去测试 | ⏳ TODO |
| | 2e-3c | 加 shooterEnemy 测试 | ⏳ TODO |
| **Phase 4** | 2e-4a/b | 更新 enemybuilder + gamebuilder skill | ⏳ TODO |

### 💡 **关键设计决策（待讨论）**

**是否编写代码生成脚本？**

> **Option A: 写脚本** — 适合未来频繁添加敌人，一次性投入值得
> 
> **Option B: 手动复制粘贴** — 这次只是重构现有敌人，不值得花时间写工具

我的建议：先手动完成这次重构，如果后续经常需要加新敌人再考虑自动化。
