# 🛠️ 游戏测试与 Debug 指引

> **Test & Debug Guide for Beginners** — 从零开始学习如何测试和调试 Phaser 3 + Vite 项目

---

## 📚 **目录**

1. [Vite 开发服务器基础](#1-vite-开发服务器基础)
2. [Phaser 3 的内置调试工具](#2-phaser-3-的内置调试工具)
3. [浏览器开发者工具的使用](#3-浏览器开发者工具的使用)
4. [Step-by-Step Debug 流程](#4-step-by-step-debug-流程)
5. [常见错误及解决方案](#5-常见错误及解决方案)
6. [测试清单（每 Step 完成后）](#6-测试清单每 step 完成后)

---

## **1️⃣ Vite 开发服务器基础**

### **什么是 Vite？**
Vite 是一个**超快的前端开发工具**，它的作用是：
- 🖥️ 启动一个本地 Web 服务器（比如 http://localhost:3000）
- 🔄 当你修改代码时自动刷新浏览器（HMR - Hot Module Replacement）
- ⚡ 极速编译，秒级响应

---

### **如何启动 Vite？**

```bash
cd /home/billv/workspace/game
npm run dev
```

**输出示例：**
```
➜ Local: http://localhost:3000/
   ↑ 打开这个网址就能看到你的游戏！

➜ Network: use --host to expose
   ↑ 如果想在手机上访问，加 --host 参数

➜ press h + enter to show help
   ↑ 按 h+enter 可以看到更多帮助命令
```

---

### **启动后做什么？**

**方法 A: 自动打开浏览器（推荐）**
```bash
npm run dev    # Vite 会自动打开 http://localhost:3000
```

**方法 B: 手动打开浏览器**
1. 保持 Terminal 窗口开着（服务器在运行中）
2. 打开 Chrome / Firefox / Edge
3. 访问：http://localhost:3000/

---

### **如何停止 Vite？**
```bash
# 在启动 Vite 的 Terminal 里按 Ctrl+C
```
输出：
```
^C
✓ Built in xx ms
```
游戏服务器就关闭了。

---

### **常见问题**

#### **问题：端口被占用（Port already in use）**
```bash
# 默认端口是 3000，如果被占用会报错
# 解决方案：换一个端口
npm run dev -- --port 3001    # 使用 3001 端口
```

---

#### **问题：npm run dev 找不到命令**
```bash
# 原因：依赖没有安装
npm install    # 先安装 phaser + vite
npm run dev    # 然后再启动
```

---

## **2️⃣ Phaser 3 的内置调试工具**

### **2.1 Physics Debug（查看碰撞箱）** ⭐ 强烈推荐！

在 `src/main.js` 的配置中：
```javascript
const config = {
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false   // ← 改为 true，可以看到所有碰撞箱！
        }
    }
};
```

**设置为 `true` 后的效果：**
- 🟦 每个物体的碰撞箱会用蓝色框显示
- 🔴 红色箭头表示物理力的方向（重力、速度）

---

### **2.2 控制台日志（console.log）**

在代码中插入：
```javascript
function update() {
    console.log('玩家位置:', this.player.x, this.player.y);
}
```

查看方式：
1. 浏览器按 `F12` 打开开发者工具
2. 点击 **Console** 标签
3. 滚动看日志输出

---

### **2.3 调试文本显示（在屏幕上）**

在代码中添加实时信息显示：
```javascript
this.debugText = this.add.text(20, 20, '', {
    fontSize: '14px',
    fill: '#fff'  // 白色文字，加黑色描边更清晰
}).setScrollFactor(0); // 固定在屏幕上不动

// Update 中更新内容
this.debugText.setText(`
位置：(${Math.round(this.player.x)}, ${Math.round(this.player.y)})
速度 X: ${Math.round(this.player.body.velocity.x)}
在地面：${this.player.body.touching.down}
`);
```

---

## **3️⃣ 浏览器开发者工具的使用**

### **如何打开？**
- 🖥️ Windows/Linux: 按 `F12` 或右键 → "检查" / "Inspect"
- 🍎 Mac: 按 `Cmd+Option+I`

---

### **三个最重要的标签页**

#### **Console（控制台）** — 看日志、调试信息
```
┌───────────────────────────────────────┐
│ Console │ Sources │ Network │ ...     │ ← 标签栏
├───────────────────────────────────────┤
│ > 📦 Loading resources...             │ ← Phaser 的 console.log()
│ > 🎮 Creating game objects...         │
│ > 玩家位置：100, 450                  │
│                                       │
│ └─────────────────────────────────────┘ ← 在这里输入 JavaScript
```

**常用命令：**
```javascript
// 在 Console 里直接输入（不是按 Enter，是点那个 ▶️ 运行按钮）
game.config.width        // 查看游戏宽度
game.scene.scenes[0].player.x  // 查看玩家位置
```

---

#### **Sources** — 断点调试（高级用法）
1. 在代码行号左边点击，设置断点（红色圆点）
2. 刷新页面或触发事件，程序会暂停在那里
3. 可以查看变量值、单步执行

---

#### **Network** — 检查资源加载
- 看图片是否成功加载
- 看有没有 404 错误（资源找不到的问题）

---

## **4️⃣ Step-by-Step Debug 流程**

### **场景：玩家跳不起来，怎么排查？**

#### **步骤 1: 启动游戏并打开 Console**
```bash
cd /home/billv/workspace/game
npm run dev    # 启动服务器
# → 浏览器自动打开 http://localhost:3000
```
然后按 `F12` 打开开发者工具。

---

#### **步骤 2: 检查 Console 有没有错误**
```javascript
// 红色错误 = 代码有问题，需要修复
Uncaught ReferenceError: cursors is not defined
    at update (main.js:78)
```
→ 说明 `cursors` 没定义，去 `create()` 里加：`this.cursors = this.input.keyboard.createCursorKeys();`

---

#### **步骤 3: 添加 console.log() 看变量值**
```javascript
function update() {
    console.log('按上键了吗？', this.cursors.up.isDown);
    console.log('在地面吗？', this.player.body.touching.down);
}
```

刷新页面，在 Console 里看输出：
```
按上键了吗？ true
在地面吗？ false   ← 问题！玩家在空中，所以跳不起来
```
→ 可能是地面碰撞检测有问题。

---

#### **步骤 4: 开启 Physics Debug**
```javascript
physics: {
    arcade: {
        debug: true   // ← 改为 true
    }
}
```

刷新页面，看到：
- 🟦 蓝色框 = 地面碰撞箱
- 🔴 红色箭头 = 重力方向（向下）

如果看不到地面的蓝色框 → 说明 `this.physics.add.collider()` 没调用。

---

#### **步骤 5: 检查代码逻辑**
```javascript
// 跳跃检测必须同时满足两个条件：
if (cursors.up.isDown && this.player.body.touching.down) {
    this.player.setVelocityY(-500);
}
```

---

## **5️⃣ 常见错误及解决方案**

### **🔴 Vite 启动失败**

#### **错误：`Cannot find module 'phaser'`**
```bash
# 原因：依赖没有安装
npm install    # 安装 package.json 里的所有依赖
```

---

#### **错误：`Port 3000 is already in use`**
```bash
# 原因：端口被占用（可能是之前的 Vite 还在运行）

# 方案 A: 换一个端口
npm run dev -- --port 3001

# 方案 B: 杀掉占用端口的进程（Linux/Mac）
lsof -ti:3000 | xargs kill -9    # 强制关闭 3000 端口的所有进程
```

---

### **🔴 Phaser 报错**

#### **错误：`TypeError: Cannot read property 'x' of null`**
```javascript
// 原因：访问了 null/undefined 的属性
this.player.x   // ← player 可能是 undefined

// 解决方案：先检查是否存在
if (this.player && this.player.x) {
    console.log(this.player.x);
}
```

---

#### **错误：`Uncaught ReferenceError: xxx is not defined`**
```javascript
// 原因：使用了未定义的变量
update() {
    cursors.left.isDown   // ← cursors 没定义！
}

// 解决方案：在 create() 里先定义
create() {
    this.cursors = this.input.keyboard.createCursorKeys();
}
```

---

#### **错误：图片 404 Not Found**
```javascript
this.load.image('player', 'assets/player.png');

// Console 里看到：GET http://localhost:3000/assets/player.png 404 (Not Found)
```

**排查步骤：**
1. 检查文件是否存在：`ls -la assets/player.png`
2. 检查路径是否正确（注意大小写！）
3. 如果是本地图片，确保放在 `/home/billv/workspace/game/assets/` 目录下

---

### **🔴 游戏逻辑问题**

#### **问题：玩家掉出屏幕外**
```javascript
// 原因：没有设置边界限制
create() {
    this.player.setCollideWorldBounds(true);   // ← 加上这行！
}
```

---

#### **问题：玩家在平台上穿过去（穿透）**
```javascript
// 原因：平台是静态的，需要设置为动态才能被检测
create() {
    this.platform = this.physics.add.staticRectangle(400, 300, 100, 20);
}
```

如果玩家穿过去 → 检查是否调用了 `this.physics.add.collider(this.player, this.platforms);`

---

## **6️⃣ 测试清单（每 Step 完成后）**

### **Step 1: 玩家移动** ✅

| 测试项 | 如何测试 | 预期结果 |
|--------|----------|----------|
| ← 左移 | 按 ← 键 | 红色方块向左移动 |
| → 右移 | 按 → 键 | 红色方块向右移动 |
| ↑ 跳跃 | 在地面时按 ↑/空格 | 向上跳起，然后落下 |
| 边界限制 | 走到屏幕边缘 | 不会掉出屏幕外 |

---

### **Step 2a: 平台系统**（待实现）

| 测试项 | 如何测试 | 预期结果 |
|--------|----------|----------|
| 站在平台上 | 跳到平台上 | 能稳稳站住不掉下去 |
| 在平台上移动 | 在平台上按 ← → | 左右移动正常 |
| 从平台边缘掉落 | 走到平台外 | 掉落到地面或其他平台 |

---

### **Step 2b: 敌人系统**（待实现）

| 测试项 | 如何测试 | 预期结果 |
|--------|----------|----------|
| 碰到敌人死亡 | 从侧面接触敌人 | Game Over，玩家回到起点 |
| 踩扁敌人 | 从上方跳到敌人头上 | 敌人消失，玩家轻微弹跳 |

---

## 📋 **Debug 速查表**

### **快速定位问题类型：**

```
1. Vite 启动失败？ → 看 Terminal 里的红色错误
   ├─ "Cannot find module" → npm install
   └─ "Port in use" → 换个端口或 kill -9

2. 浏览器白屏/不显示游戏？ → F12 Console 看错误
   ├─ "Uncaught ReferenceError" → 变量未定义
   ├─ "TypeError: xxx is not defined" → 访问了 null
   └─ "404 Not Found" → 资源路径错误

3. 游戏运行但行为异常？ → 加 console.log() + Physics Debug
   ├─ "玩家跳不起来" → 检查 touching.down、setVelocityY()
   ├─ "穿墙/穿透" → 检查 collider() 是否调用
   └─ "速度太快/太慢" → 调整 setVelocityX/Y 的参数
```

---

## 🆘 **寻求帮助**

### **StackOverflow（英文）**
搜索格式：`Phaser [问题关键词]`
- `Phaser player not jumping`
- `Phaser platform collision bug`

---

### **Phaser 官方文档**
https://new.phaser.io/docs/3.70/

---

*最后更新：2026-03-20*
