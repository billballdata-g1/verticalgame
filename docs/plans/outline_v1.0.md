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
| 💎 **收集品系统** | 金币？道具？ |
| 🔥 **更多敌人类型** | 会飞的？会跳的？ |
| 🗄️ **多关卡系统** | 不同难度的关卡 |

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
│   └── main.js                    ← 游戏主逻辑
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

| Step | 状态 | Commit ID |
|------|------|-----------|
| Step 1: 项目初始化 + 玩家移动 | ✅ COMPLETED | `5f240ff` |
| Step 2a: 平台系统 | ✅ COMPLETED | `b3e0bb6` |
| Step 2b-1 ~ 2b-3: 敌人渲染/巡逻 | ✅ COMPLETED | `7b2cf77` |
| Step 2b-4: Game Over 系统 | ✅ COMPLETED | `7b2cf77` |
| **Step 2b-5: 血量系统 + 血条 UI** | ⏳ **IN PROGRESS (BUG)** | `08bcd95` |

---

*大纲版本：v1.0 — 创建时间：2026-03-20*

---

## 🚨 **当前卡住的问题 (2026-03-20)**

### ❌ **血条宽度不变化 Bug** 🔴 HIGH PRIORITY

**症状**: 
- HP 数字正常显示和更新 (`HP: X/100 | Enemy: Y/60`)
- 玩家血条（绿色）始终满的，不随 HP 缩短
- 敌人血条（红色）位置跟随正确，但宽度也不变化

**已尝试方案 (全部无效)**:
1. ✅ `.setOrigin(0)` — 让 Rectangle 左端固定
2. ❌ `setPosition()` — 用于敌人血条跟随移动（这个有效）
3. ❌ 强制刷新浏览器、重启 Vite
4. ❌ 添加 console.log 调试输出

**代码位置**: `src/main.js` Line ~195-230

```javascript
// create() — 创建血条时设置 origin=0
this.playerBarFG = this.add.rectangle(200, 35, 160, 20, 0x00ff00).setOrigin(0);

// update() — 每帧更新宽度
const playerPct = Math.max(0, this.playerHP / PLAYER_MAX_HP);
if (this.playerBarFG) {
    this.playerBarFG.width = 160 * playerPct;
}
```

**下一步排查方向**:
- [ ] 尝试用 `setScaleX()` 替代 `.width`（Phaser 可能优化了 width 属性）
- [ ] 查看 Phaser Rectangle 的官方文档，确认 anchor/origin 机制
- [ ] StackOverflow: "Phaser health bar width not changing"
- [ ] 创建一个最小的测试用例验证问题
