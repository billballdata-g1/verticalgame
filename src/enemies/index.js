/**
 * Enemies Module
 * 敌人工厂 — 统一管理所有敌人的导入和配置
 */

// ========== 重新导出所有子模块 ==========
export * from './types';

import * as CookieModule from './cookieEnemy';
import * as FleaModule from './fleaEnemy';
import * as ShooterModule from './shooterEnemy';

export const cookieEnemy = CookieModule;
export const fleaEnemy = FleaModule;
export const shooterEnemy = ShooterModule;

/**
 * @example
 * // 在主文件中导入和使用：
 * import { cookieEnemy, fleaEnemy } from './enemies';
 * 
 * function create() {
 *     // 创建敌人实例
 *     this.cookieEnemySprite = cookieEnemy.create(this);
 *     this.fleaEnemySprite = fleaEnemy.create(this);
 *     
 *     // 创建血条 UI
 *     this.cookieHealthBlocks = cookieEnemy.createHealthBar(this);
 *     this.fleaHealthBlocks = fleaEnemy.createHealthBar(this);
 *     
 *     // 设置碰撞检测（需要在 ground/platforms/player 都创建之后）
 *     cookieEnemy.setupColliders(this, this.cookieEnemySprite, ground, platforms, this.player);
 *     fleaEnemy.setupColliders(this, this.fleaEnemySprite, ground, platforms, this.player);
 * }
 * 
 * function update() {
 *     // 每帧更新敌人行为
 *     cookieEnemy.update(this, this.cookieEnemySprite, this.cookieHealthBlocks);
 *     fleaEnemy.update(this, this.fleaEnemySprite, this.fleaHealthBlocks);
 * }
 */
