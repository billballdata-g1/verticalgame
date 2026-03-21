/**
 * Cookie Enemy Module
 * 🍪 饼干人敌人 — 地面巡逻型
 */

import { HP_PER_BLOCK, HIT_COOLDOWN } from './types';

// ========== 配置常量 ==========
export const config = {
    hp: 60,
    size: 50,
    maxHealthBlocks: 12,      // 60 / 5 = 12 blocks
    healthBlockSize: 8,
    playerDamage: 20,
    receivedDamage: 15,
    textureName: 'cookieEnemy',
    spawnPos: { x: 600, y: 200 },
};

// ========== 创建敌人 ==========
export function create(scene) {
    console.log('🍪 Creating Cookie Enemy...');
    
    // --- Step 1: Graphics 绘制纹理 ---
    const enemyGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 饼干身体：浅棕色圆形
    enemyGraphics.fillStyle(0xc4a574);
    enemyGraphics.fillCircle(25, 25, 25);
    
    // 两只小眼睛
    enemyGraphics.fillStyle(0x1a1a1a);
    enemyGraphics.fillCircle(18, 20, 3);
    enemyGraphics.fillCircle(32, 20, 3);
    
    // 微笑嘴巴
    enemyGraphics.fillEllipse(25, 30, 8, 4);
    
    const enemyTexture = enemyGraphics.generateTexture(config.textureName, 50, 50);
    console.log(`✅ Cookie texture generated: ${config.textureName}`);
    
    // --- Step 2: Physics Sprite 创建 ---
    const enemy = scene.physics.add.sprite(
        config.spawnPos.x,
        config.spawnPos.y,
        config.textureName
    );
    
    // 设置物理属性
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setSize(40, 45);  // 稍微小一点的碰撞箱
    
    // 初始速度 — 向右巡逻
    const enemySpeed = 80;
    enemy.setVelocityX(enemySpeed);
    
    // 初始化 HP
    enemy.hp = config.hp;
    console.log(`✅ Cookie enemy created at (${config.spawnPos.x}, ${config.spawnPos.y}), HP: ${config.hp}`);
    
    return enemy;
}

// ========== 创建血条 UI ==========
export function createHealthBar(scene) {
    console.log('[🍪敌人血条] 开始创建，max blocks:', config.maxHealthBlocks);
    
    const healthBlocks = [];
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        const block = scene.add.rectangle(
            0, 0,
            config.healthBlockSize - 1,
            config.healthBlockSize,
            0xff0000               // 🔴 红色
        ).setOrigin(0.5);
        
        block.setDepth(998);       // 敌人在玩家之下（视觉上）
        healthBlocks.push(block);
    }
    console.log('✅ [🍪敌人血条] 创建完成：', healthBlocks.length, '个小方块');
    
    return healthBlocks;
}

// ========== Cleanup: 敌人死亡时清理资源 ==========
export function cleanup(scene, healthBlocks) {
    console.log('🗑️ [Cookie] Cleanup — hide health bar');
    if (healthBlocks && Array.isArray(healthBlocks)) {
        healthBlocks.forEach(block => {
            if (block) block.setVisible(false);
        });
    }
}

// ========== 设置碰撞检测 ==========
export function setupColliders(scene, enemy, ground, platforms, player, healthBlocks) {
    // 🔴 注意：healthBlocks 必须传入，这样 cleanup() 才能隐藏血条
    
    // --- 敌人与平台/地面碰撞（不会掉下去）---
    scene.physics.add.collider(enemy, ground);
    scene.physics.add.collider(enemy, platforms);
    
    // --- 💥 踩扁机制 + 双向掉血 (改用 overlap，每帧触发) ---
    const stompDamage = 60;       // 💥 踩扁伤害 — 直接秒杀！
    
    scene.physics.add.overlap(player, enemy, (playerSprite, enemySprite) => {
        if (!enemySprite.active) return;
        
        const now = Date.now();
        
        // 💥 踩扁机制 — 从上方落下时
        if (playerSprite.body.touching.down && playerSprite.body.velocity.y > 0) {
            console.log('💥 STEP ON ENEMY! Player touching.down + velocity.y>', playerSprite.body.velocity.y);
            
            // ⬆️ 玩家弹跳（向上速度）
            playerSprite.setVelocityY(-200);
            
            // 💀 敌人受到踩扁伤害（直接秒杀）
            enemySprite.hp -= stompDamage;
            console.log(`🍪 Stomped! Enemy HP: ${enemySprite.hp}`);
            
            if (enemySprite.hp <= 0) {
                console.log('💀 Enemy crushed by stomp!');
                enemySprite.destroy();
                cleanup(scene, healthBlocks);  // 🔴 直接调用 cleanup（不是 cookieEnemy.cleanup）
            }
            
            return; // ⭐ 踩扁时跳过普通碰撞的伤害逻辑
        }
        
        // ❌ 侧面/下方接触 → 双向掉血（保持现有逻辑）
        console.log('⚠️ Normal contact — both take damage');
        
        // 玩家掉血（独立冷却）- 每次掉 20HP（4 个小块）
        if (!scene.playerLastHitTime || now - scene.playerLastHitTime > HIT_COOLDOWN) {
            scene.playerHP -= config.playerDamage;
            console.log(`❤️ 玩家受伤！HP: ${scene.playerHP}`);
            scene.playerLastHitTime = now;
        }
        
        // 敌人掉血（独立冷却）- 每次掉 15HP（3 个小块）
        if (!enemySprite.lastHitTime || now - enemySprite.lastHitTime > HIT_COOLDOWN) {
            enemySprite.hp -= config.receivedDamage;
            console.log(`🍪 饼干人受伤！HP: ${enemySprite.hp}`);
            enemySprite.lastHitTime = now;
            
            // 弹开效果 — 玩家向后跳
            const direction = playerSprite.x < enemySprite.x ? -1 : 1;
            playerSprite.setVelocity(direction * 150, -200);
            
            // 🔴 检查敌人死亡 — 同时清除血条！
            if (enemySprite.hp <= 0) {
                console.log('💥 饼干人被击败了！');
                enemySprite.destroy();          // 删除敌人
                cleanup(scene, healthBlocks);     // 🔴 隐藏所有血条方块
            }
        }
        
        // 检查玩家死亡（单独处理，避免在冷却判断内）
        if (scene.playerHP <= 0 && !scene.gameOver) {
            console.log('💀 Game Over! 被饼干人抓住了！');
            scene.gameOverText.setVisible(true);
            playerSprite.setVelocity(0, 0);
            playerSprite.setTint(0x888888);  // 变灰
            scene.gameOver = true;
        }
    });
}

// ========== Update: 每帧更新逻辑 ==========
export function update(scene, enemy, healthBlocks) {
    if (!enemy || !enemy.active) return;
    
    const enemySpeed = 80;
    
    // 🎯 玩家吸引机制：玩家在附近（距离 < 400px）时，主动扑向玩家！
    const distToPlayer = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        scene.player.x, scene.player.y
    );
    
    if (distToPlayer < 400 && scene.playerHP > 0) {
        // 🎯 扑向玩家！
        const dx = scene.player.x - enemy.x;
        const direction = Math.sign(dx);
        enemy.setVelocityX(direction * enemySpeed * 1.5);  // ⚡ 加速扑向玩家
    }
    // 📺 全屏巡逻（扩大范围）
    else if (enemy.x > 780) {
        enemy.setVelocityX(-enemySpeed);
    } else if (enemy.x < 20) {
        enemy.setVelocityX(enemySpeed);
    }

    // --- 🔴 敌人血条跟随移动 + 方块显示/隐藏更新 ---
    const barCenterX = enemy.x;
    const barCenterY = enemy.y - 70;  // 头顶上方
    
    // 计算起始位置（让血条居中）
    const totalBarWidth = config.maxHealthBlocks * config.healthBlockSize;
    const startX = barCenterX - totalBarWidth / 2;
    
    // 🔍 计算应该显示多少个小方块
    const visibleBlocks = Math.max(0, Math.ceil(enemy.hp / HP_PER_BLOCK));
    
    console.log(`[🍪敌人血条更新] HP=${enemy.hp}, 应显示 ${visibleBlocks} 个方块`);
    
    // 更新每个小方块的位置和可见性
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        if (healthBlocks && healthBlocks[i]) {
            // 设置位置（横向排列）
            healthBlocks[i].setPosition(
                startX + i * config.healthBlockSize,
                barCenterY
            );
            
            // 🔴 控制可见性：有血就显示，没血就隐藏
            const shouldBeVisible = (i < visibleBlocks);
            healthBlocks[i].setVisible(shouldBeVisible);
        }
    }
}
