/**
 * Enemy System Types & Constants
 * 敌人系统统一配置和类型定义
 */

// ========== 通用战斗常量 ==========
export const HP_PER_BLOCK = 5;       // 每个血条小方块代表多少血量
export const HIT_COOLDOWN = 200;     // 伤害冷却时间（毫秒）

// ========== [NEW] 重生位置类型 ==========
/**
 * @typedef {Object|'random'} RespawnPos
 * @description 敌人重生位置 — 'random' 或具体坐标
 */

// ========== 敌人工厂接口定义 ==========
/**
 * @typedef {Object} EnemyFactory
 * @property {Object} config - 敌人配置常量
 *   @property {number} hp - 生命值
 *   @property {number} size - 碰撞箱大小（正方形）
 *   @property {number} maxHealthBlocks - 血条最大方块数 (hp / HP_PER_BLOCK)
 *   @property {number} healthBlockSize - 每个小方块的像素尺寸
 *   @property {number} playerDamage - 对玩家造成的伤害
 *   @property {number} receivedDamage - 从玩家受到的伤害（普通接触）
 *   @property {string} textureName - Phaser Texture 名称
 *   @property {{x: number, y: number}} spawnPos - 初始生成位置
 *   @property {number} [respawnCount] - 🔄 重生次数（默认：1，0=不复生）
 *   @property {'random'|{x:number,y:number}} [respawnPos] - 🔄 重生位置（默认：'random'）
 * 
 * @property {function(Scene): Object} create - 创建敌人实例
 *   @param {Phaser.Scene} scene - Phaser Scene 对象
 *   @returns {Object} enemy - 创建的敌人 Sprite 对象
 * 
 * @property {function(Scene, Object): void} update - 每帧更新逻辑
 *   @param {Phaser.Scene} scene - Phaser Scene 对象
 *   @param {Object} enemy - 敌人实例
 */

// ========== 示例：饼干人配置 ==========
export const COOKIE_ENEMY_CONFIG = {
    hp: 60,
    size: 50,
    maxHealthBlocks: 12,      // 60 / 5 = 12 blocks
    healthBlockSize: 8,
    playerDamage: 20,
    receivedDamage: 15,
    textureName: 'cookieEnemy',
    spawnPos: { x: 600, y: 200 },
};

// ========== 示例：跳蚤配置 ==========
export const FLEA_ENEMY_CONFIG = {
    hp: 30,
    size: 16,
    maxHealthBlocks: 6,        // 30 / 5 = 6 blocks
    healthBlockSize: 6,
    playerDamage: 15,
    receivedDamage: 10,
    textureName: 'fleaEnemy',
    spawnPos: { x: 300, y: 180 },
};
