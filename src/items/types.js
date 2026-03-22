/**
 * Item System Types & Constants
 * 物品/装备系统统一配置和类型定义
 */

// ========== 装备槽位（Equipment Slots）==========
/**
 * @enum {string}
 */
export const EQUIPMENT_SLOTS = {
    HEAD: 'head',           // 👑 头部装备（头盔、帽子等）
    CHEST: 'chest',         // 🛡️ 胸部装备（护甲等）
    HANDS: 'hands',         // ✋ 手部装备（手套、饰品等）
    FEET: 'feet',           // 👟 脚部装备（鞋子等）
};

// ========== 物品类型（Item Types）==========
/**
 * @enum {string}
 */
export const ITEM_TYPES = {
    EQUIPMENT: 'equipment',       // 🎒 可装备的物品（鞋子、护甲等）
    CONSUMABLE: 'consumable',     // 💊 消耗品（血包等）
    COLLECTIBLE: 'collectible',   // 💰 收集品（金币、道具等）
};

// ========== 物品效果类型（Effect Types）==========
/**
 * @enum {string}
 */
export const EFFECT_TYPES = {
    STAT_MODIFY: 'stat_modify',      // ⚡ 属性修改（速度、跳跃力等）
    ABILITY_UNLOCK: 'ability_unlock',// 🔓 能力解锁（二段跳、冲刺等）
    BEHAVIOR_CHANGE: 'behavior_change',// 🔄 行为改变
};

// ========== itemConfig 接口定义 ==========
/**
 * @typedef {Object} ItemConfig
 * 
 * @property {string} id - 唯一标识（如 'speed_shoes'）
 * 
 * @property {Object} spawnPosition - 初始化位置
 *   @property {number} x - X 坐标
 *   @property {number} y - Y 坐标
 * 
 * @property {Object} collectibleBy - 谁可以收集
 *   @property {string[]} roles - 角色类型数组（如 ['player']）
 * 
 * @property {Object} visualization - 可视化设置
 *   @property {boolean} persist - 收集后是否保留视觉元素
 *   @property {string|null} attachToBodyPart - 附着到身体的哪个部位（null = 不跟随）
 *   @property {{x: number, y: number}} offset - 相对于身体部位的偏移量
 * 
 * @property {Object|null} equipmentSlot - 装备槽位配置（消耗品为 null）
 *   @property {string} bodyPart - 对应的身体部位（EQUIPMENT_SLOTS.xxxx）
 *   @property {boolean} replaceable - 同类是否可以替换
 * 
 * @property {Object[]} effects - 物品功能效果数组
 *   @property {string} type - 效果类型（EFFECT_TYPES.xxxx）
 *   @property {...} params - 效果参数（依类型而定）
 * 
 * @property {Object|null} upgradeable - 升级机制配置（不可升级为 null）
 *   @property {number} maxLevel - 最大等级
 *   @property {Object[]} levelUpEffects - 每级提升的效果
 * 
 * @property {Object|null} duration - 持久化时间配置（永久为 null）
 *   @property {number} milliseconds - 持续时间（毫秒）
 *   @property {'destroy'|'disable'} onExpire - 过期后的行为
 * 
 * @property {Object|null} destructible - 可破坏性配置（不可破坏为 null）
 *   @property {boolean} canBeDestroyed - 是否可以被破坏
 *   @property {number} destroyDamage - 造成多少伤害会破坏
 */

// ========== ItemFactory 接口定义 ==========
/**
 * @typedef {Object} ItemFactory
 * 
 * @property {ItemConfig} config - 物品配置常量
 * 
 * @property {function(Scene): Object} create - 创建物品实例
 *   @param {Phaser.Scene} scene - Phaser Scene 对象
 *   @returns {Object} item - 创建的 Sprite/Object2D 对象
 * 
 * @property {function(ItemManager, ItemConfig, Phaser.GameObjects.Sprite): Promise<void>} collect - 收集逻辑
 *   @param {ItemManager} manager - ItemManager 实例
 *   @param {ItemConfig} config - 物品配置
 *   @param {Phaser.GameObjects.Sprite} itemSprite - 物品 Sprite
 * 
 * @property {function(ItemManager, Phaser.Physics.Arcade.Sprite): void} update - 每帧更新逻辑（跟随移动等）
 */

// ========== ItemManager 接口定义 ==========
/**
 * @typedef {Object} ItemManager
 * 
 * @property {Phaser.Scene} scene - Phaser Scene 引用
 * 
 * @property {Map<string, Object>} equippedItems - 当前装备的物品 Map（slotName → itemConfig）
 * 
 * @property {Set<Object>} activeEffects - 当前激活的效果 Set
 * 
 * @method collect(itemConfig) - 收集物品
 * @method equip(slotName, itemConfig) - 装备/更换物品
 * @method unequip(slotName) - 卸下物品
 * @method upgrade(itemId) - 升级物品
 * @method attachVisual(itemSprite, player, bodyPart, offset) - 附着视觉元素到玩家身体部位
 */
