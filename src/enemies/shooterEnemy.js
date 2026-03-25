/**
 * Shooter Enemy Module
 * 🎯 射手敌人 — 远程射击型炮台
 */

import { HP_PER_BLOCK, HIT_COOLDOWN } from './types';

// ========== 配置常量 ==========
export const config = {
    hp: 50,
    size: 40,
    maxHealthBlocks: 10,      // 50 / 5 = 10 blocks
    healthBlockSize: 8,
    contactDamage: 25,        // ⚠️ 碰到炮台受到的伤害（非子弹）
    bulletDamage: 25,         // 🔴 子弹伤害（远程！）
    receivedDamage: 15,
    
    textureName: 'shooterEnemy',
    spawnPos: { x: 400, y: 350 },  // 放在平台上
    
    // 🎯 射击参数
    shootInterval: 2000,      // 每 2 秒发射一次
    bulletSpeed: 300,         // 子弹速度（向右）
    
    // 🔄 [NEW] 重生机制
    respawnCount: 1,          // 剩余重生次数（默认：1）
    respawnPos: 'random',     // 重生位置（'random' | {x, y}）
};

// ========== 创建敌人 ==========
export function create(scene) {
    console.log('🎯 Creating Shooter Enemy...');
    
    // --- Step 1: Graphics 绘制纹理 ---
    const shooterGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 🔴 红色圆形身体（炮台）
    shooterGraphics.fillStyle(0xcc3333);
    shooterGraphics.fillCircle(25, 25, 25);
    
    // 👁️ 白色眼睛 + 黑色瞳孔
    shooterGraphics.fillStyle(0xffffff);
    shooterGraphics.fillCircle(18, 20, 8);     // 左眼白
    shooterGraphics.fillCircle(32, 20, 8);     // 右眼白
    shooterGraphics.fillStyle(0x000000);
    shooterGraphics.fillCircle(18, 20, 4);     // 左瞳孔
    shooterGraphics.fillCircle(32, 20, 4);     // 右瞳孔
    
    // 🎯 前方枪管（深灰色矩形）
    shooterGraphics.fillStyle(0x555555);
    shooterGraphics.fillRect(40, 20, 15, 10);  // 向右伸出的枪管
    
    const shooterTexture = shooterGraphics.generateTexture(config.textureName, 60, 50);
    console.log(`✅ Shooter texture generated: ${config.textureName}`);
    
    // --- Step 2: Physics Sprite 创建（静态！不移动）---
    const shooter = scene.physics.add.sprite(
        config.spawnPos.x,
        config.spawnPos.y,
        config.textureName
    );
    
    // ⚠️ FIX: 不要使用 setStatic()，用 enableBody(false) 代替
    // setStatic() 会完全禁用物理体，导致 overlap 检测失效！
    shooter.body.enable = true;           // ✅ 保持物理体启用
    shooter.setImmovable(true);           // ✅ 不可移动（类似 static）
    shooter.body.allowGravity = false;    // ✅ 不受重力影响
    shooter.body.setSize(config.size, config.size);
    
    // 初始化 HP
    shooter.hp = config.hp;
    
    // 🎯 射击控制变量（保存在 scene 中）
    scene.shooterLastShootTime = 0;
    
    // 🔄 [NEW] 初始化重生属性
    shooter.respawnCount = config.respawnCount;
    shooter.respawnPos = config.respawnPos;
    
    console.log(`✅ Shooter enemy created at (${config.spawnPos.x}, ${config.spawnPos.y}), HP: ${config.hp}`);
    
    return shooter;
}

// ========== 创建血条 UI ==========
export function createHealthBar(scene) {
    console.log('[🎯射手血条] 开始创建，max blocks:', config.maxHealthBlocks);
    
    const healthBlocks = [];
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        const block = scene.add.rectangle(
            0, 0,
            config.healthBlockSize - 1,
            config.healthBlockSize,
            0xcc3333               // 🔴 红色（和身体颜色一致）
        ).setOrigin(0.5);
        
        block.setDepth(996);       // 在跳蚤血条之下
        healthBlocks.push(block);
    }
    console.log('✅ [🎯射手血条] 创建完成：', healthBlocks.length, '个小方块');
    
    return healthBlocks;
}

// ========== Cleanup: 敌人死亡时清理资源 ==========
export function cleanup(scene, healthBlocks) {
    console.log('🗑️ [Shooter] Cleanup — hide health bar');
    if (healthBlocks && Array.isArray(healthBlocks)) {
        healthBlocks.forEach(block => {
            if (block) block.setVisible(false);
        });
    }
}

// ========== 设置碰撞检测 ==========
export function setupColliders(scene, shooter, ground, platforms, player, healthBlocks) {
    // ⚠️ Shooter 是静态物体，不需要和地面/平台碰撞
    
    // --- 🎯 Shooter 和玩家之间的碰撞检测（踩扁 + 双向掉血）---
    scene.physics.add.overlap(player, shooter, (playerSprite, shooterSprite) => {
        if (!shooterSprite.active) return;
        
        const now = Date.now();
        
        // 💥 踩扁机制 — 从上方落下时（秒杀！）
        if (playerSprite.body.touching.down && playerSprite.body.velocity.y > 0) {
            console.log('💥 STEP ON SHOOTER!');
            playerSprite.setVelocityY(-200);      // ⬆️ 玩家弹跳
            shooterSprite.hp -= config.hp;        // 💀 直接秒杀
            
            if (shooterSprite.hp <= 0) {
                console.log('💀 Shooter crushed!');
                handleEnemyDeath(scene, shooterSprite, healthBlocks);  // ⭐ [NEW]
            }
            return;
        }
        
        // ⚠️ 普通接触 — 双向掉血（虽然 shooter 不动，但玩家可能跳过来碰它）
        if (!scene.playerLastHitTime || now - scene.playerLastHitTime > HIT_COOLDOWN) {
            scene.playerHP -= config.contactDamage;  // ⚠️ FIX: 使用 contactDamage 而不是 receivedDamage
            console.log(`🎯 Shooter contact! Player HP: ${scene.playerHP}`);
            scene.playerLastHitTime = now;
        }
        
        if (!shooterSprite.lastHitTime || now - shooterSprite.lastHitTime > HIT_COOLDOWN) {
            shooterSprite.hp -= config.receivedDamage;
            console.log(`🎯 Shooter hurt! HP: ${shooterSprite.hp}`);
            shooterSprite.lastHitTime = now;
            
            // 弹开效果
            const direction = playerSprite.x < shooterSprite.x ? -1 : 1;
            playerSprite.setVelocity(direction * 150, -200);
            
            if (shooterSprite.hp <= 0) {
                console.log('💀 Shooter defeated!');
                handleEnemyDeath(scene, shooterSprite, healthBlocks);  // ⭐ [NEW]
            }
        }
    });
}

// ========== 创建子弹 ==========
export function createBullet(scene, x, y) {
    console.log('🔫 Shooter fires bullet! Position:', x, y);
    
    // ✅ FIX: 检查 player 是否存在（防止 scene.player 为 undefined）
    if (!scene.player || !scene.player.active) {
        console.warn('⚠️ createBullet: scene.player does not exist or is inactive');
        return null;
    }
    
    const bulletGraphics = scene.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffff00);      // 💛 黄色子弹
    bulletGraphics.fillCircle(5, 5, 8);
    const bulletTexture = bulletGraphics.generateTexture('shooterBullet', 16, 16);
    
    // 🔄 360°追踪射击 — 计算朝向玩家的速度向量
    const dx = scene.player.x - x;
    const dy = scene.player.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // ✅ 单位化方向向量 × 子弹速度
    const vx = (dx / distance) * config.bulletSpeed;  // X 轴速度分量
    const vy = (dy / distance) * config.bulletSpeed;  // Y 轴速度分量
    
    console.log(`🎯 Bullet velocity: (${vx.toFixed(0)}, ${vy.toFixed(0)}) — angle: ${Math.atan2(dy, dx).toFixed(2)} rad`);
    
    const bullet = scene.physics.add.sprite(x, y, 'shooterBullet');
    bullet.setVelocity(vx, vy);  // 🔄 360°追踪射击！
    bullet.body.setSize(10, 10);
    
    // 🎯 子弹和玩家碰撞检测 — FIX: 使用 scene.player 而不是 this.player
    scene.physics.add.overlap(bullet, scene.player, (bulletSprite, playerSprite) => {
        if (!bulletSprite.active || !playerSprite.active) return;
        
        console.log('💥 BULLET HIT! Player HP:', scene.playerHP);
        scene.playerHP -= config.bulletDamage;  // ✅ FIX: 使用 bulletDamage
        
        // 💀 玩家死亡检查
        if (scene.playerHP <= 0 && !scene.gameOver) {
            console.log('💀 Game Over! Shot by shooter!');
            scene.gameOverText.setVisible(true);
            playerSprite.setVelocity(0, 0);
            playerSprite.setTint(0x888888);
            scene.gameOver = true;
        }
        
        // 🗑️ 子弹消失
        bulletSprite.destroy();
    });
    
    return bullet;
}

// ========== Update: 每帧更新逻辑 ==========
export function update(scene, shooter, healthBlocks) {
    if (!shooter || !shooter.active) return;
    
    // 🔄 360°追踪玩家 — 动态调整炮口角度
    if (scene.player && scene.player.active) {
        const dx = scene.player.x - shooter.x;
        const dy = scene.player.y - shooter.y;
        const angleRad = Math.atan2(dy, dx);      // 弧度：从 shooter 到 player
        const angleDeg = Phaser.Math.RadToDeg(angleRad);  // 转为角度
        
        shooter.setAngle(angleDeg);               // 🔄 旋转炮台对准玩家
    }
    
    const now = Date.now();
    
    // 🎯 定时射击逻辑！
    if (now - scene.shooterLastShootTime > config.shootInterval && scene.playerHP > 0) {
        // ✅ FIX: 确保 player 存在
        if (!scene.player || !scene.player.active) {
            console.warn('⚠️ Shooter update: player does not exist, skipping bullet creation');
            return;
        }
        
        // 📍 在炮台中心发射（旋转后会自动朝向玩家）
        createBullet(scene, shooter.x, shooter.y);
        scene.shooterLastShootTime = now;
    }
    
    // 🔴 血条更新（shooter 是静态的，不需要跟随移动）
    const barCenterX = shooter.x;
    const barCenterY = shooter.y - 35;  // ⬆️ 头顶上方
    
    const totalBarWidth = config.maxHealthBlocks * config.healthBlockSize;
    const startX = barCenterX - totalBarWidth / 2;
    
    const visibleBlocks = Math.max(0, Math.ceil(shooter.hp / HP_PER_BLOCK));
    
    for (let i = 0; i < config.maxHealthBlocks; i++) {
        if (healthBlocks && healthBlocks[i]) {
            healthBlocks[i].setPosition(startX + i * config.healthBlockSize, barCenterY);
            healthBlocks[i].setVisible(i < visibleBlocks);
        }
    }
}

// ========== [NEW] 统一死亡处理（含重生逻辑）==========
function handleEnemyDeath(scene, shooter, healthBlocks) {
    if (shooter.respawnCount > 0) {
        // 🔄 还有重生次数！
        console.log(`🔄 Shooter respawning... (${shooter.respawnCount} times left)`);
        
        shooter.respawnCount--;
        shooter.hp = config.hp;              // 恢复血量
        scene.shooterLastShootTime = 0;      // 🔫 重置射击计时器
        
        // 📍 确定重生位置
        let respawnX, respawnY;
        if (shooter.respawnPos === 'random') {
            // 🎲 随机位置（屏幕内）
            respawnX = Phaser.Math.Between(100, 700);
            respawnY = Phaser.Math.Between(150, 450);
        } else {
            // 📍 固定坐标
            respawnX = shooter.respawnPos.x;
            respawnY = shooter.respawnPos.y;
        }
        
        // ⚡ 重生！
        shooter.setPosition(respawnX, respawnY);
        shooter.setActive(true);
        shooter.setVisible(true);
        console.log(`✅ Shooter respawned at (${respawnX}, ${respawnY}) — ${shooter.respawnCount} times left`);
    } else {
        // 💀 重生次数用完，真正死亡
        console.log('💀 Shooter permanently defeated (respawn count: 0)');
        shooter.destroy();
        cleanup(scene, healthBlocks);     // 隐藏所有血条方块
    }
}
