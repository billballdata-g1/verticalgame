/**
 * Item System - Index
 * 物品系统统一导出口
 */

// ========== Types & Constants ==========
export {
    EQUIPMENT_SLOTS,
    ITEM_TYPES,
    EFFECT_TYPES,
} from './types.js';

// ========== Core Classes ==========
export { ItemManager, createItemManager } from './ItemManager.js';

// ========== Item Modules ==========
export * as doubleJumpShoesItem from './doubleJumpShoesItem.js';  // 👟 二段跳鞋 ⭐

// ========== Future Item Modules (待创建) ==========
// export { healthPackItem } from './healthPackItem.js';   // ❤️ Health Pack
// export { shieldItem } from './shieldItem.js';           // 🛡️ Shield
