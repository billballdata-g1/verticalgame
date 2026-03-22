/**
 * Double Jump Shoes Item Module
 * 👟 二段跳鞋 — 装备类物品（脚部槽位）
 */

import { EQUIPMENT_SLOTS, ITEM_TYPES, EFFECT_TYPES } from './types.js';

// ========== itemConfig ==========
/**
 * @type {import('./types').ItemConfig}
 */
export const config = {
    // 🆔 唯一标识
    id: 'double_jump_shoes',
    
    // 📍 初始化位置（保持和原来一样）
    spawnPosition: {
        x: 500,
        y: 360
    },
    
    // 👥 谁可以收集
    collectibleBy: {
        roles: ['player']
    },
    
    // 👁️ 可视化设置（持久化 + 附着到脚底）
    visualization: {
        persist: true,              // ✅ 收集后保留视觉元素
        attachToBodyPart: EQUIPMENT_SLOTS.FEET,
        offset: { x: 0, y: 24 }     // ⬇️ 玩家脚底下方偏移
    },
    
    // 🎒 装备槽位配置（脚部）
    equipmentSlot: {
        bodyPart: EQUIPMENT_SLOTS.FEET,
        replaceable: true           // ✅ 同类可以替换（比如更好的鞋子）
    },
    
    // ⚡ 物品功能效果 — ⭐ 核心！
    effects: [
        {
            type: EFFECT_TYPES.ABILITY_UNLOCK,
            ability: 'double_jump',
            params: {
                maxJumps: 2         // 允许跳两次
            }
        },
        {
            type: EFFECT_TYPES.STAT_MODIFY,
            stat: 'jump_height',    // （可选）可以稍微增加跳跃高度
            value: 1.05,            // +5% 跳跃力（装饰性效果，实际还是 -500）
            operation: 'multiply'
        }
    ],
    
    // ⬆️ 升级机制 — ❌ 暂时不实现
    upgradeable: null,
    
    // ⏱️ 持久化时间 — ❌ 永久装备，不过期
    duration: null,
    
    // 💥 可破坏性 — ❌ 不可破坏
    destructible: null,
};

// ========== 创建物品 Sprite ==========
export function create(scene) {
    console.log('👟 Creating Double Jump Shoes...');
    
    // --- Step 1: Graphics 绘制鞋子纹理（改回原来的复杂样式）---
    const shoeGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 绘制鞋子纹理（原来的复杂样式）
    shoeGraphics.fillStyle(0xffd700);       // 金黄色鞋身
    shoeGraphics.fillRoundedRect(2, 18, 46, 20, 5);  // 鞋底
    shoeGraphics.fillStyle(0xffffff);        // 白色鞋面
    shoeGraphics.fillCircle(30, 15, 12);     // 鞋头圆顶
    shoeGraphics.fillRect(18, 5, 14, 15);   // 鞋筒
    shoeGraphics.fillStyle(0xff6b6b);        // 红色鞋带孔
    shoeGraphics.fillCircle(24, 10, 2);
    shoeGraphics.fillCircle(28, 10, 2);
    shoeGraphics.fillStyle(0xffff00);        // 黄色闪电标志（表示速度）
    shoeGraphics.fillRect(35, 12, 8, 4);
    
    // 生成纹理
    const shoeTexture = shoeGraphics.generateTexture('doubleJumpShoes', 50, 40);
    console.log(`✅ Double Jump Shoes texture generated: doubleJumpShoes`);
    
    // --- Step 2: Physics Sprite 创建 ---
    const shoes = scene.physics.add.sprite(
        config.spawnPosition.x,
        config.spawnPosition.y,
        'doubleJumpShoes'
    );
    
    // --- Step 3: 物理属性设置 ---
    shoes.setBounce(0);                    // 不弹跳
    shoes.setCollideWorldBounds(true);
    shoes.body.setSize(40, 32);            // 稍微小一点的碰撞箱
    shoes.active = true;
    
    console.log(`✅ Double Jump Shoes created at (${config.spawnPosition.x}, ${config.spawnPosition.y})`);
    return shoes;
}

// ========== 收集物品 ==========
export async function collect(itemManager, itemConfig, shoesSprite) {
    const scene = itemManager.scene;
    const player = scene.player;
    
    console.log('👟 COLLECTED! Double jump unlocked!');
    
    // ⭐ 通过 ItemManager 收集（自动装备到 FEET 槽位 + 应用效果）
    if (itemManager) {
        itemManager.collect(itemConfig);
    }
    
    // ✅ 获得二段跳能力（直接修改 scene.maxJumps，保持和原来兼容）
    scene.maxJumps = 2;
    
    // ❌ 不要 destroy() — 改为附着在玩家脚底！
    // shoesSprite.destroy();  ← 删除这行
    
    // 📍 设置鞋子跟随状态（标记为已收集）
    shoesSprite.collected = true;
    shoesSprite.targetPlayer = player;
    
    // 👁️ 附着视觉元素到玩家脚底
    if (itemConfig.visualization.attachToBodyPart) {
        const offset = itemConfig.visualization.offset || { x: 0, y: 0 };
        itemManager.attachVisual(shoesSprite, player, itemConfig.visualization.attachToBodyPart, offset);
    }
}

// ========== Update: 跟随玩家移动（可选，ItemManager.update() 已处理）==========
export function update(itemManager, shoesSprite) {
    // ⚠️ 这个函数可以留空 — ItemManager.update() 已经处理了所有附着视觉元素的更新
    // 如果需要额外的行为逻辑，可以在这里添加
}
