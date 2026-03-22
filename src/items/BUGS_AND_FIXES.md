# 物品系统 Bug 记录与修复经验

> **位置**: `src/items/BUGS_AND_FIXES.md`  
> **用途**: 记录物品模块开发过程中遇到的 Bug 和解决方案，避免重复踩坑

---

## 🐛 Bug #1: 鞋子穿上后不停上下抖动

**发现时间**: 2026-03-22  
**影响模块**: `ItemManager.js`, `doubleJumpShoesItem.js`

### 症状
玩家收集鞋子后，鞋子会跟着玩家移动，但是不停上下抖动（看起来像快速浮动）。

### 根本原因
**物理体冲突**：
1. 鞋子创建时使用了 `this.physics.add.sprite()` → 有物理体，受重力影响
2. `ItemManager.update()` 每帧用 `setPosition()` 强制设置鞋子位置
3. **冲突**：物理引擎试图让鞋子下落（重力），而 `setPosition` 强制固定位置 → 抖动

### 解决方案

**在 `ItemManager.js` 的 `attachVisual()` 方法中禁用物理体：**

```javascript
attachVisual(itemSprite, player, bodyPart, offset = { x: 0, y: 0 }) {
    console.log(`👁️ ATTACHING visual of ${itemSprite.key} to player.${bodyPart}`);
    
    // ⚠️ FIX: 禁用物理体防止和 setPosition 冲突导致的抖动
    if (itemSprite.body) {
        itemSprite.body.enable = false;  // 禁用物理体，不再受重力/速度影响
        console.log(`   → Physics body disabled for ${itemSprite.key}`);
    }
    
    this.attachedVisuals.set(itemSprite, {
        player,
        bodyPart,
        offset
    });
}
```

### 关键经验

> **当一个 GameObject 需要被 `setPosition` 精确控制时，应该禁用其物理体。**

**适用场景**：
- 附着在玩家身上的装备（鞋子、护甲、翅膀等）
- UI 元素跟随物体移动
- 任何需要"固定在相对位置"的视觉效果

**不要这样做**（会导致抖动）：
```javascript
// ❌ 错误：保留物理体 + 强制设置位置
itemSprite.body.enable = true;  // 物理体启用（受重力）
itemSprite.setPosition(x, y);   // 每帧强制设置位置 → 冲突！
```

**正确做法**（不会抖动）：
```javascript
// ✅ 正确：禁用物理体 + 强制设置位置
itemSprite.body.enable = false; // 禁用物理体
itemSprite.setPosition(x, y);   // 完全控制位置
```

---

## 💡 通用开发建议

### 1. 物品模块的标准结构

每个物品模块应该包含：

```javascript
// 1. 配置对象
export const config = { ... };

// 2. 创建函数
export function create(scene) { ... }

// 3. 收集逻辑
export async function collect(itemManager, itemConfig, itemSprite) { ... }

// 4. 可选：每帧更新
export function update(itemManager, itemSprite) { ... }
```

### 2. 动态导入 vs 静态导入

**动态导入**（当前使用）：
```javascript
// ✅ 优点：代码分割，按需加载
import('./items/doubleJumpShoesItem.js').then(module => {
    module.create(this);
});

// ❌ 缺点：异步，可能有延迟
```

**静态导入**（更确定）：
```javascript
// ✅ 优点：同步加载，立即可用
import { doubleJumpShoesItem } from './items/doubleJumpShoesItem.js';
// 直接使用：doubleJumpShoesItem.create(this);

// ❌ 缺点：增加初始包大小
```

### 3. 调试技巧

**查看所有附着的物品：**
```javascript
// 在浏览器控制台运行
itemManager.attachedVisuals.forEach((data, sprite) => {
    console.log(`${sprite.key}: attached to player.${data.bodyPart}`);
});
```

**临时禁用物理体抖动测试：**
```javascript
// 在控制台手动禁用物理体看是否还抖动
itemManager.attachedVisuals.forEach((data, sprite) => {
    if (sprite.body) sprite.body.enable = false;
});
```

---

## 📝 待补充的 Bug

（当遇到新问题时，按照上面的格式添加到这里）

---

*最后更新: 2026-03-22*  
*维护者: Bill + Agent*