/**
 * Flea Enemy Module
 * 🦟 跳蚤敌人 — 跳跃型
 */

import { HP_PER_BLOCK, HIT_COOLDOWN } from './types';

// ========== 配置常量 ==========
export const config = {
    hp: 30,
    size: 16,
    maxHealthBlocks: 6,        // 30 / 5 = 6 blocks
    healthBlockSize: 6,
    playerDamage: 15,
    receivedDamage: 10,
    textureName: 'fleaEnemy',
    spawnPos: { x: 300, y: 180 },
    jumpIntervalMin: 1500,     // 最短跳跃间隔（毫秒）
    jumpIntervalMax: 3000,     // 最长跳跃间隔
};

// ========== 创建敌人 ==========
export function create(scene) {
    console.log('🦟 Creating Flea Enemy...');
    
    // --- Step 1: Graphics 绘制纹理 ---
    const fleaGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 绘制跳蚤纹理 — 小小的深色椭圆 + 腿
    fleaGraphics.fillStyle(0x4a3728);       // 深棕色身体
    fleaGraphics.fillEllipse(10, 10, 16, 10);  // 椭圆形身体（比饼干人小很多）
    
    // 六条腿 — 用短矩形代替（简化版本）
    fleaGraphics.fillStyle(0x4a3728);
    fleaGraphics.fillRect(2, 5, 3, 2);      // 左前腿
    fleaGraphics.fillRect(15, 5, 3, 2);     // 右前腿
    fleaGraphics.fillRect(2, 13, 3, 2);     // 左后腿
    fleaGraphics.fillRect(15, 13, 3, 2);    // 右后腿
    
    // 两只小眼睛 — 白色圆点
    fleaGraphics.fillStyle(0xffffff);
    fleaGraphics.fillCircle(7, 8, 2);      // 左眼
    fleaGraphics.fillCircle(13, 8, 2);     // 右眼
    
    const fleaTexture = fleaGraphics.generateTexture(config.textureName, config.size * 2, config.size * 2);
    console.log(`✅ Flea texture generated: ${config.textureName}`);
    
    // --- Step 2: Physics Sprite 创建 ---
    const flea = scene.physics.add.sprite(
        config.spawnPos.x,
        config.spawnPos.y,
        config.textureName
    );
    
    // 设置物理属性
    flea.setBounce(0.1);
    flea.setCollideWorldBounds(true);
    flea.body.setSize(config.size, config.size);  // ⭐ 小小的碰撞箱
    
    // 初始化 HP
    flea.hp = config.hp;
    
    // 🦟 跳蚤行为控制变量（保存在 scene 中）
    scene.fleaLastJumpTime = 0;             // 上次跳跃时间（用于随机跳跃）
    
    console.log(`✅ Flea enemy created at (${config.spawnPos.x}, ${config.spawnPos.y}), HP: ${config.hp}`);
    
    return flea;
}

// ========== 创建血条 UI ==========
export function createHealthBar(scene) {
    console.log('[🦟跳蚤血条] 开始创建，max blocks:', config.maxHealthBlocks);
    
    const healthBlocks = [];
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        const block = scene.add.rectangle(
            0, 0,
            config.healthBlockSize - 1,
            config.healthBlockSize,
            0x8b4513               // 🟤 深棕色（和跳蚤身体颜色一致）
        ).setOrigin(0.5);
        
        block.setDepth(997);       // 在敌人血条之下
        healthBlocks.push(block);
    }
    console.log('✅ [🦟跳蚤血条] 创建完成：', healthBlocks.length, '个小方块');
    
    return healthBlocks;
}

// ========== 设置碰撞检测 ==========
export function setupColliders(scene, flea, ground, platforms, player) {
    // --- 🦟 跳蚤敌人也要和平台/地面碰撞（不会掉下去）---
    scene.physics.add.collider(flea, ground);
    scene.physics.add.collider(flea, platforms);

    // --- 🦟 Step 2e: 跳蚤敌人和玩家之间的碰撞检测（双向掉血 + 踩扁）---
    scene.physics.add.overlap(player, flea, (playerSprite, fleaSprite) => {
        if (!fleaSprite.active) return;  // 跳蚤已经死了
        
        const now = Date.now();
        
        // 💥 踩扁机制 — 从上方落下时（秒杀！）
        if (playerSprite.body.touching.down && playerSprite.body.velocity.y > 0) {
            console.log('💥 STEP ON FLEA!');
            playerSprite.setVelocityY(-200);      // ⬆️ 玩家弹跳
            fleaSprite.hp -= config.hp;           // 💀 直接秒杀（跳蚤只有 30HP）
            
            if (fleaSprite.hp <= 0) {
                console.log('💀 Flea crushed!');
                fleaSprite.destroy();
                // hideFleaHealthBar() will be called from main.js
            }
            return;
        }
        
        // ⚠️ 普通接触 — 双向掉血
        // 玩家掉血
        if (!scene.playerLastHitTime || now - scene.playerLastHitTime > HIT_COOLDOWN) {
            scene.playerHP -= config.playerDamage;
            console.log(`🦟 Flea bites! Player HP: ${scene.playerHP}`);
            scene.playerLastHitTime = now;
        }
        
        // 跳蚤掉血
        if (!fleaSprite.lastHitTime || now - fleaSprite.lastHitTime > HIT_COOLDOWN) {
            fleaSprite.hp -= config.receivedDamage;
            console.log(`🦟 Flea hurt! HP: ${fleaSprite.hp}`);
            fleaSprite.lastHitTime = now;
            
            // 🔄 弹开效果
            const direction = playerSprite.x < fleaSprite.x ? -1 : 1;
            playerSprite.setVelocity(direction * 150, -200);
            
            // 💀 跳蚤死亡
            if (fleaSprite.hp <= 0) {
                console.log('💀 Flea defeated!');
                fleaSprite.destroy();
                // hideFleaHealthBar() will be called from main.js
            }
        }
    });
}

// ========== Update: 每帧更新逻辑 ==========
export function update(scene, flea, healthBlocks) {
    if (!flea || !flea.active) return;
    
    const now = Date.now();
    
    // 🔴 更新跳蚤血条位置（跟随移动）+ 方块显示/隐藏
    const fleaBarCenterX = flea.x;
    const fleaBarCenterY = flea.y - 25;  // ⬆️ 头顶上方，更近一点
    
    const fleaTotalBarWidth = config.maxHealthBlocks * config.healthBlockSize;
    const fleaStartX = fleaBarCenterX - fleaTotalBarWidth / 2;
    
    const fleaVisibleBlocks = Math.max(0, Math.ceil(flea.hp / HP_PER_BLOCK));
    
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        if (healthBlocks[i]) {
            healthBlocks[i].setPosition(
                fleaStartX + i * config.healthBlockSize,
                fleaBarCenterY
            );
            
            const shouldBeVisible = (i < fleaVisibleBlocks);
            healthBlocks[i].setVisible(shouldBeVisible);
        }
    }
    
    // 🎯 玩家吸引机制：玩家在附近（距离 < 300px）时，扑向玩家！
    const distToPlayer = Phaser.Math.Distance.Between(
        flea.x, flea.y,
        scene.player.x, scene.player.y
    );
    
    if (distToPlayer < 300 && scene.playerHP > 0) {
        // 🎯 扑向玩家！
        const dx = scene.player.x - flea.x;
        const dy = scene.player.y - flea.y;
        
        // ⬅️➡️ 水平移动（朝向玩家）
        flea.setVelocityX(Math.sign(dx) * 120);
        
        // ⬆️ 如果玩家在高处，跳跃！
        if (dy < -50 && flea.body.touching.down && 
            now - scene.fleaLastJumpTime > 200) {
            console.log('🦟 Flea POUNCE on player!');
            flea.setVelocityY(-600);
            scene.fleaLastJumpTime = now;
        }
    }
    // 🎲 否则随机左右跳跃探索
    else if (flea.body.touching.down && 
             now - scene.fleaLastJumpTime > config.jumpIntervalMin) {
        
        const randomDirection = Math.random() < 0.5 ? -1 : 1;
        const shouldJump = Math.random() < 0.7;  // 70% 几率跳跃
        
        if (shouldJump) {
            console.log(`🦟 Flea JUMP! direction: ${randomDirection > 0 ? 'right' : 'left'}`);
            flea.setVelocityX(randomDirection * 100);  // ⬅️➡️ 水平移动
            flea.setVelocityY(-600);  // ⬆️ 向上跳跃
            scene.fleaLastJumpTime = now;
        } else {
            // 🐌 缓慢左右移动探索
            flea.setVelocityX(randomDirection * 30);
        }
    }
}
