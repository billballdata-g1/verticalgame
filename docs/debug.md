# 🐛 Debug Notes - Phaser 游戏开发踩坑记录

**最后更新**: 2026-03-21 13:22 GMT+8

---

## 🔥 **严重问题：全屏蓝色（Game Crash）**

### ❌ **Bug #1: 直接修改精灵的 `.x`/`.y` 属性导致崩溃**

**症状**: 游戏启动后全屏蓝色，没有任何渲染内容。

**错误代码：**
```javascript
// ❌ 危险：直接修改精灵位置会破坏物理状态！
this.enemyBarBG.x = this.enemyPreview.x;
this.enemyBarFG.x = this.enemyPreview.x;
this.enemyBarBG.y = this.enemyPreview.y - 40;
this.enemyBarFG.y = this.enemyPreview.y - 40;
```

**原因分析：**
- Phaser 的 `Sprite` 对象有内置的物理系统
- 直接修改 `.x`/`.y` 会跳过物理引擎的状态更新
- 可能导致内部状态不一致 → **整个场景渲染失败**

**修复方案：**
```javascript
// ✅ 正确：用 setPosition() API（安全）
const enemyX = this.enemyPreview.x;
const enemyY = this.enemyPreview.y - 40;

if (this.enemyBarBG) {
    this.enemyBarBG.setPosition(enemyX, enemyY);
}
if (this.enemyBarFG) {
    this.enemyBarFG.setPosition(enemyX, enemyY);
}
```

**验证**: 用 `setPosition()` 后，血条跟随移动且不会崩溃。

---

### ❌ **Bug #2: try-catch 结构错误导致语法崩溃**

**症状**: 全屏蓝色，控制台无任何报错（因为语法错误在解析阶段就失败了）

**错误代码：**
```javascript
function update() {
    try {
        // ...玩家移动逻辑...

        if (this.enemyPreview && this.enemyPreview.active) {
            // 巡逻逻辑
        }

    // ❌ 这里缺少了 } 来闭合第一个 try！
    // --- 实时更新血条 UI ---
    try {   // ← 这个嵌套的 try 让结构更混乱
```

**原因分析：**
- 多个 `try-catch` 嵌套时，花括号配对很容易出错
- JavaScript 解析阶段失败 → **整个文件无法加载**

**修复方案：**
```javascript
function update() {
    // ✅ 外层 try-catch 包裹核心逻辑
    try {
        const speed = 250;

        if (this.cursors.left.isDown) { ... }
        if (this.enemyPreview && this.enemyPreview.active) { ... }

    } catch (e) {
        console.error('Update loop error:', e);
    }

    // ✅ 调试信息独立在外层 try-catch（不影响游戏逻辑）
    try {
        this.debugText.setText(`...`);
    } catch (e) {
        // 忽略，不影响游戏
    }
}
```

---

## 💨 **二段跳 Bug：穿鞋后一跳直接变 2/2**

### ❌ **Bug #3: `isDown` 按键检测导致连续触发**

**症状**: 穿鞋后第一次按跳跃键，`jumpsUsed` 直接从 0 跳到 2（没二段跳效果）。

**错误代码：**
```javascript
// ❌ isDown 在按住期间每一帧都是 true → 连续触发！
if (this.cursors.up.isDown || this.cursors.space.isDown) {
    if (touching.down) {
        jumpsUsed = 1;
    } else if (jumpsUsed < maxJumps) {
        jumpsUsed = 2;  // ⚠️ 可能立即触发！
    }
}
```

**原因分析：**
- `cursors.up.isDown` 在按键期间每一帧都返回 `true`
- 加上复杂的去重逻辑（`lastJumpFrame`）容易出 bug
- **物理引擎状态变化可能导致判断条件在同一帧内满足两次**

**修复方案：用键盘事件代替每帧检测！**
```javascript
// ✅ keydown 只在"按下的那一瞬间"触发一次，天然去重！
this.input.keyboard.on('keydown-UP', () => {
    if (touching.down) {
        this.player.setVelocityY(-500);
        jumpsUsed = 1;  // 🦯 第一次跳跃
    } else if (jumpsUsed < maxJumps) {
        this.player.setVelocityY(-500);
        jumpsUsed = 2;  // 💨 二段跳！
    }
});
```

**验证**:
- 穿鞋后 `maxJumps = 2`
- ⬆️ UP → `🦯 Jump #1!`, `jumpsUsed = 1/2` ✅
- ⬆️⬆️ 在空中再按 UP → `💨 DOUBLE JUMP!`, `jumpsUsed = 2/2` ✅

---

## 💨 **二段跳 Bug：穿鞋后一跳直接变 2/2** (2026-03-21)

### ❌ **Bug #3: `isDown` 按键检测导致连续触发**

**症状**: 穿鞋后第一次按跳跃键，`jumpsUsed` 直接从 0 跳到 2（没二段跳效果）。

**错误代码：**
```javascript
// ❌ isDown 在按住期间每一帧都是 true → 连续触发！
if (this.cursors.up.isDown || this.cursors.space.isDown) {
    if (touching.down) {
        jumpsUsed = 1;
    } else if (jumpsUsed < maxJumps) {
        jumpsUsed = 2;  // ⚠️ 可能立即触发！
    }
}
```

**原因分析：**
- `cursors.up.isDown` 在按键期间每一帧都返回 `true`
- 加上复杂的去重逻辑（`lastJumpFrame`）容易出 bug
- **物理引擎状态变化可能导致判断条件在同一帧内满足两次**

**修复方案：用键盘事件代替每帧检测！**
```javascript
// ✅ keydown 只在"按下的那一瞬间"触发一次，天然去重！
this.input.keyboard.on('keydown-UP', () => {
    if (touching.down) {
        this.player.setVelocityY(-500);
        jumpsUsed = 1;  // 🦯 第一次跳跃
    } else if (jumpsUsed < maxJumps) {
        this.player.setVelocityY(-500);
        jumpsUsed = 2;  // 💨 二段跳！
    }
});
```

**验证**: 
- 穿鞋后 `maxJumps = 2`
- ⬆️ UP → `🦯 Jump #1!`, `jumpsUsed = 1/2` ✅
- ⬆️⬆️ 在空中再按 UP → `💨 DOUBLE JUMP!`, `jumpsUsed = 2/2` ✅

**调试经验：**
> **游戏控制优先用键盘事件，而不是每帧检测！**
> - `keydown`/`keyup` 只在按键瞬间触发一次
> - `isDown` 在按住期间每一帧都是 true → 需要额外的去重逻辑
> - 简单问题复杂化往往是 bug 的根源

---

## 📊 **经验总结**

| 问题 | 症状 | 检测方法 |
|------|------|----------|
| 直接修改 `.x`/`.y` | 全屏蓝色 | 浏览器控制台无报错 → 检查物理对象操作 |
| try-catch 结构错误 | 全屏蓝色 | `node --check src/main.js` 可以检测语法错误 |
| `isDown` 按键检测 | 二段跳失效，一跳直接变 2/2 | 看 console.log，发现跳跃日志在同一帧输出多次 → 改用键盘事件 |

### ✅ **安全编码习惯：**

1. **永远用 API，不要直接改属性** — `.setPosition()` > `.x = `
2. **try-catch 要独立** — 核心逻辑一个 try，调试信息另一个 try
3. **增量测试** — 每加一段代码就刷新浏览器验证
4. **控制台日志** — 用 `console.log()` 标记关键路径是否执行
5. **按键事件优先** — 游戏控制尽量用 `keydown`/`keyup` 事件，而不是每帧检测 `isDown`
6. **物理对象状态要尊重** — `touching.down` 等物理状态在跳跃瞬间会变化，不要在同一帧内依赖它做多次判断

---

## 📚 **相关资源**

- Phaser Group API: https://new.phaser.io/docs/3.70/Phaser.Physics.Arcade.Group
- Phaser Sprite setPosition: https://new.phaser.io/docs/3.70/Phaser.GameObjects.Sprite#setPosition

---

*文档版本：v1.0 - 创建时间：2026-03-20*
