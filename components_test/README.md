# 🎮 Components Test — UI 组件最小化测试

> **Purpose**: Isolated testing environment for game UI components, separate from main game logic.

---

## 📊 **Health Bar Test Summary**

### 🔍 **测试目标**

验证 Phaser Rectangle 在不同 `origin` 设置下，`.width` 属性的变化行为。

---

### 🧪 **三个实验组对比**

| Test | Config | `.width = X` Behavior | Result |
|------|--------|----------------------|--------|
| **#1** | `origin = 0.5` (默认) | 左右同时收缩 | ❌ 不直观，看起来没变 |
| **#2** | `origin = 0` + `.setOrigin(0)` | **从右向左缩短** | ✅ **推荐方案！** |
| **#3** | `origin = 0` + `scale.x` | 缩放控制宽度 | ⚠️ 可行但有副作用 |

---

### 📸 **视觉效果对比**

#### Test #1: origin=0.5 (Phaser 默认)
```
100%: [████████] ← x=200, width=300
 50%: [  ██  ░░] ← 左右各缩进 75px（看起来没变！）
  0%: [    ░░░░] ← 完全消失
```
**问题**: 血条从中间向两侧收缩，视觉上不明显。

---

#### Test #2: origin=0 (左端固定) ✅ **推荐！**
```
100%: [████████] ← x=50, width=300
 50%: [███░░░░░] ← 从右向左缩短（正确！）
  0%: [░░░░░░░░] ← 完全消失
```
**优势**: 
- ✅ 视觉上直观，符合用户对血条的预期
- ✅ 背景条和血条对齐良好
- ✅ 代码简单：`.setOrigin(0)` + `.width = X`

---

#### Test #3: scale.x (缩放控制)
```
100%: [████████] ← x=50, width=300, scale.x=1.0
 50%: [███░░░░░] ← x=50, width=300, scale.x=0.5
  0%: [░░░░░░░░] ← scale.x=0 (隐藏)
```
**问题**: 
- ⚠️ `scale` 会影响渲染顺序、碰撞检测等
- ⚠️ 不适用于需要精确位置控制的场景
- ✅ 但可以做缩放动画效果（如受伤闪烁）

---

### 🏆 **最终结论**

#### ✅ **推荐方案：Test #2 (origin=0)**

```javascript
// create() — 创建血条时，背景条和血条都设置 origin=0
this.playerBarBG = this.add.rectangle(50, 75, 300, 40, 0x333333).setOrigin(0);
this.playerBarFG = this.add.rectangle(50, 75, 300, 40, 0x00ff00).setOrigin(0);

// update() — 每帧更新宽度
const pct = Math.max(0, this.playerHP / MAX_HP);
this.playerBarFG.width = max_width * pct;
```

---

### 📚 **Phaser Rectangle Origin 详解**

| origin | 含义 | `.width` 变化方向 |
|--------|------|------------------|
| `0.5` (默认) | 中心点固定 | ←→ 左右同时收缩 |
| `0` | 左端固定 | ← 从右向左缩短 ✅ |

---

### 🔗 **相关链接**

- Phaser Docs: https://new.phaser.io/docs/3.70/Phaser.GameObjects.Rectangle#setOrigin
- Test Page: `/components_test/health-bar-test.html`

---

*Summary created: 2026-03-20*
