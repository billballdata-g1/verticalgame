/**
 * Item Manager
 * 物品系统核心管理器 — 处理装备、升级、效果应用等逻辑
 */

import { EQUIPMENT_SLOTS, ITEM_TYPES } from './types.js';

/**
 * @class ItemManager
 * @description 管理所有物品的状态、装备槽位和效果
 */
export class ItemManager {
    /**
     * 创建物品管理器实例
     * @param {Phaser.Scene} scene - Phaser Scene 引用
     */
    constructor(scene) {
        this.scene = scene;
        
        // 🎒 装备槽位状态（slotName → itemConfig）
        this.equippedItems = new Map();
        for (const slot of Object.values(EQUIPMENT_SLOTS)) {
            this.equippedItems.set(slot, null);
        }
        
        // ⚡ 当前激活的效果列表
        this.activeEffects = [];
        
        // 👁️ 已附着到玩家的视觉元素（itemSprite → {player, bodyPart}）
        this.attachedVisuals = new Map();
    }
    
    /**
     * 收集物品
     * @param {Object} itemConfig - 物品配置对象
     */
    collect(itemConfig) {
        console.log(`📦 COLLECTING: ${itemConfig.id}`);
        
        if (!itemConfig || !itemConfig.id) {
            console.error('❌ Invalid item config');
            return;
        }
        
        // 🎒 如果是装备，自动装备到对应槽位
        if (itemConfig.type === ITEM_TYPES.EQUIPMENT && itemConfig.equipmentSlot) {
            this.equip(itemConfig.equipmentSlot.bodyPart, itemConfig);
        }
        
        // ⚡ 应用物品效果
        if (itemConfig.effects && itemConfig.effects.length > 0) {
            this.applyEffects(itemConfig.id, itemConfig.effects);
        }
    }
    
    /**
     * 装备/更换物品
     * @param {string} slotName - 槽位名称（EQUIPMENT_SLOTS.xxxx）
     * @param {Object} newItemConfig - 新物品配置
     */
    equip(slotName, newItemConfig) {
        console.log(`🎒 EQUIPPING: ${newItemConfig.id} to slot '${slotName}'`);
        
        // 🔄 检查槽位是否已被占用
        const existingItem = this.equippedItems.get(slotName);
        if (existingItem) {
            console.log(`⚠️ Slot '${slotName}' already equipped with: ${existingItem.id}`);
            
            // ❓ TODO: 根据配置决定是否替换（这里暂不自动替换）
            return;
        }
        
        // ✅ 装备新物品
        this.equippedItems.set(slotName, newItemConfig);
    }
    
    /**
     * 卸下物品
     * @param {string} slotName - 槽位名称
     */
    unequip(slotName) {
        const item = this.equippedItems.get(slotName);
        if (item) {
            console.log(`📤 UNEQUIPPING: ${item.id} from slot '${slotName}'`);
            
            // ⚡ 移除对应效果
            this.removeEffects(item.id);
            
            this.equippedItems.set(slotName, null);
        }
    }
    
    /**
     * 应用物品效果
     * @param {string} itemId - 物品 ID（用于后续移除）
     * @param {Object[]} effects - 效果数组
     */
    applyEffects(itemId, effects) {
        console.log(`⚡ APPLYING EFFECTS for ${itemId}:`, effects);
        
        effects.forEach(effect => {
            // 📝 TODO: 实现不同类型效果的逻辑
            // - STAT_MODIFY: 修改玩家属性（速度、跳跃力等）
            // - ABILITY_UNLOCK: 解锁能力（二段跳等）
            // - BEHAVIOR_CHANGE: 改变行为
            
            console.log(`   → Effect: ${effect.type}`, effect.params);
        });
    }
    
    /**
     * 移除物品效果
     * @param {string} itemId - 物品 ID
     */
    removeEffects(itemId) {
        console.log(`🔄 REMOVING EFFECTS for ${itemId}`);
        // 📝 TODO: 实现效果移除逻辑（恢复原始属性等）
    }
    
    /**
     * 升级物品
     * @param {string} itemId - 物品 ID
     * @returns {boolean} - 是否成功升级
     */
    upgrade(itemId) {
        // 📝 TODO: 实现升级逻辑
        console.log(`⬆️ UPGRADE requested for ${itemId}`);
        return false;
    }
    
    /**
     * 附着视觉元素到玩家身体部位
     * @param {Phaser.GameObjects.Sprite} itemSprite - 物品 Sprite
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家 Sprite
     * @param {string} bodyPart - 身体部位（EQUIPMENT_SLOTS.xxxx）
     * @param {{x: number, y: number}} offset - 偏移量
     */
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
    
    /**
     * 每帧更新（跟随玩家移动等）
     */
    update() {
        // 🔄 更新所有附着视觉元素的位置
        for (const [itemSprite, attachment] of this.attachedVisuals) {
            if (!itemSprite.active || !attachment.player.active) continue;
            
            // 📍 设置物品跟随玩家位置（暂时固定在 player.x, player.y + offset）
            // TODO: 根据 bodyPart 计算更精确的位置
            itemSprite.setPosition(
                attachment.player.x + attachment.offset.x,
                attachment.player.y + attachment.offset.y
            );
            
            // 📊 设置 depth 确保在最上层显示
            itemSprite.setDepth(1001);
        }
    }
}

// ========== Factory Function ==========

/**
 * 创建 ItemManager 实例的工厂函数
 * @param {Phaser.Scene} scene - Phaser Scene 引用
 * @returns {ItemManager}
 */
export function createItemManager(scene) {
    return new ItemManager(scene);
}
