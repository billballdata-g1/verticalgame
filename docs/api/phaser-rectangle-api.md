# 📦 Phaser Rectangle API Notes

## 🔧 **修改矩形宽度的方法**

### ❌ `.width` 直接赋值（可能不重绘）
```javascript
this.playerBarFG.width = 160 * playerPct;
```
- ✅ 简单直接
- ⚠️ Phaser 可能不会自动重绘纹理

---

### ✅ **`.setScaleX()` — 推荐！**
```javascript
this.playerBarFG.setScaleX(playerPct);
```
- ✅ **纯视觉变换，不涉及纹理重绘**
- ✅ Phaser 渲染管线更稳定
- ⚠️ 需要理解 "scale" vs "size" 的区别

---

### ✅ **`.setDisplaySize(width, height)` — 官方推荐**
```javascript
this.playerBarFG.setDisplaySize(160 * playerPct, 20);
```
- ✅ Phaser 3.70+ 专门用于动态修改显示尺寸
- ✅ 自动处理纹理重绘（应该比 `.width` 更可靠）

---

### ⚠️ **`.refresh()` — 不存在！**
```javascript
this.playerBarFG.refresh();  // ❌ TypeError! Rectangle 没有这个方法!
```
- ❌ `Graphics` 对象才有 `.refresh()`，Rectangle 没有！
- ❌ 调用会导致整个场景崩溃 → 全屏蓝色

---

## 📊 **总结：血条宽度修改的最佳实践**

```javascript
// 创建血条（带 origin=0）
this.playerBarFG = this.add.rectangle(200, 35, 160, 20, 0x00ff00).setOrigin(0);

// update() — 修改宽度（三种方案，按推荐程度排序）
const playerPct = Math.max(0, this.playerHP / PLAYER_MAX_HP);

// ✅ 方案 A: setScaleX（最稳定）
this.playerBarFG.setScaleX(playerPct);

// ✅ 方案 B: setDisplaySize（官方推荐）
this.playerBarFG.setDisplaySize(160 * playerPct, 20);

// ⚠️ 方案 C: .width（简单但可能不重绘）
this.playerBarFG.width = 160 * playerPct;
```

---

## 📖 **参考资源**
- Phaser 3.70 Docs: https://new.phaser.io/docs/3.70/
- Rectangle API: https://new.phaser.io/docs/3.70/Phaser.GameObjects.Rectangle
