# 🐛 Debug Notes - Phaser 游戏开发踩坑记录

**最后更新**: 2026-03-20 16:12 GMT+8

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

## 📊 **经验总结**

| 问题 | 症状 | 检测方法 |
|------|------|----------|
| 直接修改 `.x`/`.y` | 全屏蓝色 | 浏览器控制台无报错 → 检查物理对象操作 |
| try-catch 结构错误 | 全屏蓝色 | `node --check src/main.js` 可以检测语法错误 |

### ✅ **安全编码习惯：**

1. **永远用 API，不要直接改属性** — `.setPosition()` > `.x = ` 
2. **try-catch 要独立** — 核心逻辑一个 try，调试信息另一个 try
3. **增量测试** — 每加一段代码就刷新浏览器验证
4. **控制台日志** — 用 `console.log()` 标记关键路径是否执行

---

## 📚 **相关资源**

- Phaser Group API: https://new.phaser.io/docs/3.70/Phaser.Physics.Arcade.Group
- Phaser Sprite setPosition: https://new.phaser.io/docs/3.70/Phaser.GameObjects.Sprite#setPosition

---

*文档版本：v1.0 — 创建时间：2026-03-20*
