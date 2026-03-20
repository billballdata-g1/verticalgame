# 🎮 横版闯关游戏开发手册

> **Game Development Handbook** — 技术栈、架构、进度追踪

**项目**: `verticalgame` (GitHub)  
**引擎**: Phaser 3.70 + Vite 5.0  
**语言**: JavaScript/TypeScript  
**状态**: Step 1 ✅ COMPLETED | Step 2a ⏳ PENDING

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

**Commit ID**: `5f240ff` (Step 1) → `4023390` (Step 1b)

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

### **Step 2a: 平台系统 ⏳ PENDING**

**待实现：**
```javascript
// TODO: 在空中搭建可站立的平台
const platformsData = [
    { x: 150, y: 400 },  // 第一个平台
    { x: 350, y: 320 },  // 第二个（更高）
];

this.platforms = this.physics.add.staticGroup();
platformsData.forEach(data => {
    const platform = this.add.rectangle(data.x, data.y, 100, 20, 0x4a6b4a);
    platforms.add(platform);
});
this.physics.add.collider(this.player, this.platforms);
```

---

### **Step 2b: 敌人系统 ⏳ PENDING**

**待实现：**
- 👾 简单巡逻的方块，碰到会死（Game Over）

---

### **Step 2c: 踩扁机制 ⏳ PENDING**

**待实现：**
- ⬇️ 从上方落下时消灭敌人（马里奥经典！）+ 弹跳效果

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

## 🔗 **外部链接**

- **GitHub**: https://github.com/billballdata-g1/verticalgame
- **Phaser Docs**: https://new.phaser.io/docs/3.70/
- **Vite Docs**: https://vitejs.dev/

---

## 📝 **版本历史**

| 日期 | 更新内容 | Commit ID |
|------|----------|-----------|
| 2026-03-20 | Step 1: Phaser 初始化 + 玩家移动 | `5f240ff` |
| 2026-03-20 | Step 1b: 保存完整开发大纲 v1.0 | `4023390` |

---

*最后更新：2026-03-20 12:54 GMT+8*
