/**
 * Phaser 3 - 横版闯关游戏
 */

import Phaser from 'phaser';

// ============ 全局常量（让 update 函数也能访问）===========
const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 60;
const HP_PER_BLOCK = 5;            // 每个小方块代表多少血量
const PLAYER_BLOCK_SIZE = 12;
const PLAYER_MAX_BLOCKS = 20;      // 100HP / 5 = 20 blocks
const PLAYER_BAR_X = 10;
const PLAYER_BAR_Y = 10;
const ENEMY_BLOCK_SIZE = 8;
const ENEMY_MAX_BLOCKS = 12;       // 60HP / 5 = 12 blocks

// 💨 二段跳相关常量
const DEFAULT_MAX_JUMPS = 1;       // 默认只能跳一次
const DOUBLE_JUMP_VALUE = 2;       // 鞋子道具给的跳跃次数

// 🦟 跳蚤敌人相关常量
const FLEA_HP = 30;                // 低血量（2 下踩扁或 6 次接触）
const FLEA_SIZE = 16;              // 小小的（饼干人是 50x50）
const FLEA_MAX_BLOCKS = 6;         // 30HP / 5 = 6 blocks
const FLEA_BLOCK_SIZE = 6;         // 比敌人血条小一点

// ============ 游戏配置 ============
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.body, // 直接插入到 body
    backgroundColor: '#87CEEB', // 天空蓝
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, // 向下的重力
            debug: false          // 设为 true 可以看到物理边界
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

// ============ Preload: 加载资源 ============
function preload() {
    console.log('📦 Loading resources...');
}

// ============ Create: 创建游戏对象 ============
function create() {
    console.log('🎮 Creating game objects...');

    // --- 地面 (静态组 - 不会动的物体) ---
    const ground = this.physics.add.staticGroup();
    
    const floorGraphics = this.make.graphics({ x: 0, y: 0 });
    floorGraphics.fillStyle(0x2d5a3d);
    floorGraphics.fillRect(0, 0, 800, 40);
    const floorTexture = floorGraphics.generateTexture('floor', 800, 40);
    
    const floorSprite = this.add.sprite(400, 580, 'floor');
    ground.add(floorSprite);

    // --- 平台系统 (Step 2a) ---
    const platforms = this.physics.add.staticGroup();
    
    const platformsData = [
        { x: 150, y: 480 },
        { x: 350, y: 380 },
        { x: 200, y: 280 },
        { x: 450, y: 200 },
        { x: 650, y: 150 },
    ];
    
    platformsData.forEach(data => {
        const platformGraphics = this.make.graphics({ x: 0, y: 0 });
        platformGraphics.fillStyle(0x6b8c4a);
        platformGraphics.fillRect(0, 0, 100, 20);
        const platformTexture = platformGraphics.generateTexture('platform_' + data.x + '_' + data.y, 100, 20);
        
        const platformSprite = this.add.sprite(data.x, data.y, platformTexture);
        platforms.add(platformSprite);
    });

    // --- 💨 Step 2d: 鞋子道具（二段跳）---
    const shoeGraphics = this.make.graphics({ x: 0, y: 0 });
    
    // 绘制鞋子纹理
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
    
    const shoeTexture = shoeGraphics.generateTexture('shoeItem', 50, 40);
    
    // 💨 鞋子道具 — 放在平台上（玩家收集后获得二段跳）
    this.shoeItem = this.physics.add.sprite(500, 360, 'shoeItem');
    this.shoeItem.setBounce(0);              // 不弹跳
    this.shoeItem.setCollideWorldBounds(true);
    this.shoeItem.body.setSize(40, 32);      // 稍微小一点的碰撞箱
    
    // 💨 二段跳状态变量
    this.maxJumps = DEFAULT_MAX_JUMPS;       // 当前最大跳跃次数（默认 1）
    this.jumpsUsed = 0;                      // 当前已经用了多少次跳跃
    this.lastJumpFrame = -999;               // 🔍 记录上次跳跃的帧数（防止连发），初始为负数确保第一帧能跳

    // --- 敌人系统 (Step 2b) ---
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    
    // 饼干身体：浅棕色圆形
    enemyGraphics.fillStyle(0xc4a574);
    enemyGraphics.fillCircle(25, 25, 25);

    // 两只小眼睛
    enemyGraphics.fillStyle(0x1a1a1a);
    enemyGraphics.fillCircle(18, 20, 3);
    enemyGraphics.fillCircle(32, 20, 3);

    // 微笑嘴巴
    enemyGraphics.fillEllipse(25, 30, 8, 4);

    const enemyTexture = enemyGraphics.generateTexture('cookieEnemy', 50, 50);

    // 用 physics.add.sprite() — 让敌人受重力影响！
    this.enemyPreview = this.physics.add.sprite(600, 200, 'cookieEnemy');

    // 设置物理属性
    this.enemyPreview.setBounce(0.1);
    this.enemyPreview.setCollideWorldBounds(true);
    this.enemyPreview.body.setSize(40, 45);
    
    // 给敌人初始速度 — 向右巡逻
    const enemySpeed = 80;
    this.enemyPreview.setVelocityX(enemySpeed);

    // --- 🦟 Step 2e: 跳蚤敌人（小小的一只，会跳跃！）---
    const fleaGraphics = this.make.graphics({ x: 0, y: 0 });
    
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
    
    const fleaTexture = fleaGraphics.generateTexture('fleaEnemy', FLEA_SIZE * 2, FLEA_SIZE * 2);
    
    // 🦟 跳蚤敌人 — 放在平台上（会跳跃）
    this.fleaEnemy = this.physics.add.sprite(300, 180, 'fleaEnemy');
    this.fleaEnemy.hp = FLEA_HP;           // 🔴 低血量！
    this.fleaEnemy.setBounce(0.1);
    this.fleaEnemy.setCollideWorldBounds(true);
    this.fleaEnemy.body.setSize(FLEA_SIZE, FLEA_SIZE);  // ⭐ 小小的碰撞箱
    
    // 🦟 跳蚤行为控制变量
    this.fleaLastJumpTime = 0;             // 上次跳跃时间（用于随机跳跃）
    this.fleaJumpIntervalMin = 1500;       // 最短跳跃间隔（毫秒）
    this.fleaJumpIntervalMax = 3000;       // 最长跳跃间隔
    
    console.log('🦟 Flea enemy created at (300, 180), HP:', FLEA_HP);

    // --- 玩家 (红色方块) ---
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xff6b6b); // 红色
    playerGraphics.fillRect(0, 0, 32, 48);
    const playerTexture = playerGraphics.generateTexture('player', 32, 48);
    
    this.player = this.physics.add.sprite(100, 450, 'player');
    
    // 玩家物理属性
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 44);

    // --- 键盘输入 ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- 碰撞检测：玩家碰到地面和平台 ---
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, platforms);

    // --- 🦟 跳蚤敌人也要和平台/地面碰撞（不会掉下去）---
    this.physics.add.collider(this.fleaEnemy, ground);
    this.physics.add.collider(this.fleaEnemy, platforms);

    // --- 🦟 Step 2e: 鞋子道具收集（overlap）---
    this.physics.add.overlap(this.player, this.shoeItem, (player, shoe) => {
        if (!shoe.active) return;  // 已经被捡走了，跳过
        
        console.log('👟 COLLECTED! Double jump unlocked!');
        
        // 💨 获得二段跳能力
        this.maxJumps = DOUBLE_JUMP_VALUE;
        
        // 🗑️ 鞋子消失
        shoe.destroy();
    });

    // --- 💨 Step 2d: 跳跃键抬起事件（更可靠的二段跳触发）---
    this.input.keyboard.on('keydown-UP', () => {
        if (this.playerHP <= 0) return; // Game Over 时不响应
        
        console.log('⬆️ UP pressed! touching.down:', this.player.body.touching.down, 'jumpsUsed:', this.jumpsUsed);
        
        // ✅ 第一次跳跃：在地面上
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.jumpsUsed = 1;
            console.log('🦯 Jump #1!');
        }
        // 💨 第二次跳跃：在空中，且还有剩余次数
        else if (this.jumpsUsed < this.maxJumps) {
            this.player.setVelocityY(-500);
            this.jumpsUsed = 2;
            console.log('💨 DOUBLE JUMP! jumpsUsed:', this.jumpsUsed, '/', this.maxJumps);
        }
    });
    
    // 🔁 空格键也支持二段跳
    this.input.keyboard.on('keydown-SPACE', (event) => {
        if (this.playerHP <= 0) return;
        
        console.log('␣ SPACE pressed! touching.down:', this.player.body.touching.down, 'jumpsUsed:', this.jumpsUsed);
        
        // ✅ 第一次跳跃
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.jumpsUsed = 1;
            console.log('🦯 Jump #1!');
        }
        // 💨 第二次跳跃
        else if (this.jumpsUsed < this.maxJumps) {
            this.player.setVelocityY(-500);
            this.jumpsUsed = 2;
            console.log('💨 DOUBLE JUMP! jumpsUsed:', this.jumpsUsed, '/', this.maxJumps);
        }
    });

    // --- 🐛 FIX: 鞋子和地面/平台碰撞（不会掉到地下）---
    this.physics.add.collider(this.shoeItem, ground);
    this.physics.add.collider(this.shoeItem, platforms);

    // --- 🦟 Step 2e: 跳蚤敌人和玩家之间的碰撞检测（双向掉血 + 踩扁）---
    this.physics.add.overlap(this.player, this.fleaEnemy, (player, flea) => {
        if (!flea.active) return;  // 跳蚤已经死了
        
        const now = Date.now();
        
        // 💥 踩扁机制 — 从上方落下时（秒杀！）
        if (player.body.touching.down && player.body.velocity.y > 0) {
            console.log('💥 STEP ON FLEA!');
            player.setVelocityY(-200);      // ⬆️ 玩家弹跳
            flea.hp -= 30;                  // 💀 直接秒杀（跳蚤只有 30HP）
            
            if (flea.hp <= 0) {
                console.log('💀 Flea crushed!');
                flea.destroy();
                hideFleaHealthBar();        // 🔴 隐藏血条！
            }
            return;
        }
        
        // ⚠️ 普通接触 — 双向掉血
        const playerDamage = 15;   // 跳蚤伤害比饼干人低（每次 -15HP）
        const fleaDamage = 10;     // 玩家对跳蚤造成较少伤害（每次 -10HP）
        
        // 玩家掉血
        if (!this.playerLastHitTime || now - this.playerLastHitTime > 200) {
            this.playerHP -= playerDamage;
            console.log(`🦟 Flea bites! Player HP: ${this.playerHP}`);
            this.playerLastHitTime = now;
        }
        
        // 跳蚤掉血
        if (!flea.lastHitTime || now - flea.lastHitTime > 200) {
            flea.hp -= fleaDamage;
            console.log(`🦟 Flea hurt! HP: ${flea.hp}`);
            flea.lastHitTime = now;
            
            // 🔄 弹开效果
            const direction = player.x < flea.x ? -1 : 1;
            player.setVelocity(direction * 150, -200);
            
            // 💀 跳蚤死亡
            if (flea.hp <= 0) {
                console.log('💀 Flea defeated!');
                flea.destroy();
                hideFleaHealthBar();        // 🔴 隐藏血条！
            }
        }
    });

    // --- 敌人也要和平台/地面碰撞（不会掉下去）---
    this.physics.add.collider(this.enemyPreview, ground);
    this.physics.add.collider(this.enemyPreview, platforms);

    // ============ 血量系统 ============
    this.playerHP = 100;
    this.gameOver = false;  // 游戏结束标志
    
    this.enemyPreview.hp = 60;

    // --- 🔴 敌人死亡时清除血条的方法 ---
    const hideEnemyHealthBar = () => {
        console.log('🗑️ [清理] 隐藏所有敌人血条方块');
        this.enemyHealthBlocks.forEach(block => block.setVisible(false));
    };

    // --- 🦟 Step 2e: 跳蚤死亡时清除血条的方法 ---
    const hideFleaHealthBar = () => {
        console.log('🗑️ [清理] 隐藏所有跳蚤血条方块');
        this.fleaHealthBlocks.forEach(block => block.setVisible(false));
    };

    // --- 💥 Step 2c-1: 踩扁机制 + 双向掉血 (改用 overlap，每帧触发) ---
    const playerDamage = 20;      // 玩家每次受伤 -20HP（4 个小块）
    const enemyDamage = 15;       // 敌人每次受伤 -15HP（3 个小块）
    const stompDamage = 60;       // 💥 踩扁伤害 — 直接秒杀！

    this.physics.add.overlap(this.player, this.enemyPreview, (player, enemy) => {
        const now = Date.now();
        
        // 💥 Step 2c-1: 踩扁机制 — 从上方落下时
        if (player.body.touching.down && player.body.velocity.y > 0) {
            console.log('💥 STEP ON ENEMY! Player touching.down + velocity.y>', player.body.velocity.y);
            
            // ⬆️ 玩家弹跳（向上速度）
            player.setVelocityY(-200);
            
            // 💀 敌人受到踩扁伤害（直接秒杀）
            enemy.hp -= stompDamage;
            console.log(`🍪 Stomped! Enemy HP: ${enemy.hp}`);
            
            if (enemy.hp <= 0) {
                console.log('💀 Enemy crushed by stomp!');
                enemy.destroy();
                hideEnemyHealthBar();
            }
            
            return; // ⭐ 踩扁时跳过普通碰撞的伤害逻辑
        }
        
        // ❌ 侧面/下方接触 → 双向掉血（保持现有逻辑）
        console.log('⚠️ Normal contact — both take damage');
        
        // 玩家掉血（独立冷却）- 每次掉 20HP（4 个小块）
        if (!this.playerLastHitTime || now - this.playerLastHitTime > 200) {
            this.playerHP -= playerDamage;
            console.log(`❤️ 玩家受伤！HP: ${this.playerHP}`);
            this.playerLastHitTime = now;
        }
        
        // 敌人掉血（独立冷却）- 每次掉 15HP（3 个小块）
        if (!enemy.lastHitTime || now - enemy.lastHitTime > 200) {
            enemy.hp -= enemyDamage;
            console.log(`🍪 饼干人受伤！HP: ${enemy.hp}`);
            enemy.lastHitTime = now;
            
            // 弹开效果 — 玩家向后跳
            const direction = player.x < enemy.x ? -1 : 1;
            player.setVelocity(direction * 150, -200);
            
            // 🔴 检查敌人死亡 — 同时清除血条！
            if (enemy.hp <= 0) {
                console.log('💥 饼干人被击败了！');
                enemy.destroy();          // 删除敌人
                hideEnemyHealthBar();     // 🔴 隐藏所有血条方块
            }
        }
        
        // 检查玩家死亡（单独处理，避免在冷却判断内）
        if (this.playerHP <= 0 && !this.gameOver) {
            console.log('💀 Game Over! 被饼干人抓住了！');
            this.gameOverText.setVisible(true);
            player.setVelocity(0, 0);
            player.setTint(0x888888);  // 变灰
            this.gameOver = true;
        }
    });

    // --- 🔴 玩家血条 UI (左上角) - 用小方块实现！---
    console.log('[玩家血条] 开始创建，使用全局常量：PLAYER_MAX_BLOCKS =', PLAYER_MAX_BLOCKS);
    
    this.playerHealthBlocks = [];
    for (let i = 0; i < PLAYER_MAX_BLOCKS; i++) {
        // 计算位置
        const blockX = PLAYER_BAR_X + i * PLAYER_BLOCK_SIZE + PLAYER_BLOCK_SIZE/2;
        const blockY = PLAYER_BAR_Y + PLAYER_BLOCK_SIZE/2;
        
        // 创建小方块 - origin=0.5（中心对齐）
        const block = this.add.rectangle(
            blockX, 
            blockY,
            PLAYER_BLOCK_SIZE - 1, // -1 留小间隙
            PLAYER_BLOCK_SIZE,
            0x00ff00               // 绿色
        ).setOrigin(0.5);
        
        block.setDepth(999);       // 确保在最上层
        this.playerHealthBlocks.push(block);
    }
    console.log('✅ [玩家血条] 创建完成：', this.playerHealthBlocks.length, '个小方块');

    // --- 🔴 敌人血条 UI (头顶) - 用小方块实现！---
    console.log('[敌人血条] 开始创建，使用全局常量：ENEMY_MAX_BLOCKS =', ENEMY_MAX_BLOCKS);
    
    this.enemyHealthBlocks = [];
    for (let i = 0; i < ENEMY_MAX_BLOCKS; i++) {
        const block = this.add.rectangle(
            0, 0,
            ENEMY_BLOCK_SIZE - 1,
            ENEMY_BLOCK_SIZE,
            0xff0000               // 红色
        ).setOrigin(0.5);
        
        block.setDepth(998);       // 敌人在玩家之下（视觉上）
        this.enemyHealthBlocks.push(block);
    }
    console.log('✅ [敌人血条] 创建完成：', this.enemyHealthBlocks.length, '个小方块');

    // --- 🦟 Step 2e: 跳蚤血条 UI (头顶) - 用更小的方块实现！---
    console.log('[跳蚤血条] 开始创建，使用全局常量：FLEA_MAX_BLOCKS =', FLEA_MAX_BLOCKS);
    
    this.fleaHealthBlocks = [];
    for (let i = 0; i < FLEA_MAX_BLOCKS; i++) {
        const block = this.add.rectangle(
            0, 0,
            FLEA_BLOCK_SIZE - 1,
            FLEA_BLOCK_SIZE,
            0x8b4513               // 深棕色（和跳蚤身体颜色一致）
        ).setOrigin(0.5);
        
        block.setDepth(997);       // 在敌人血条之下
        this.fleaHealthBlocks.push(block);
    }
    console.log('✅ [跳蚤血条] 创建完成：', this.fleaHealthBlocks.length, '个小方块');

    // --- UI: 调试信息 ---
    this.debugText = this.add.text(10, 60, '', {
        fontSize: '12px',
        fill: '#333'
    }).setScrollFactor(0);

    // --- Game Over UI (默认隐藏) ---
    this.gameOverText = this.add.text(400, 300, '💀 Game Over!\n按 R 重新开始', {
        fontSize: '32px',
        fill: '#ff0000',
        align: 'center'
    }).setOrigin(0.5).setVisible(false);

    // --- 重置游戏的方法 ---
    this.resetGame = () => {
        // 重置玩家位置
        this.player.setPosition(100, 450);
        this.player.setVelocity(0, 0);
        this.player.clearTint();  // 恢复颜色
        
        // 重置血量
        this.playerHP = PLAYER_MAX_HP;
        this.enemyPreview.hp = ENEMY_MAX_HP;
        
        // 💨 重置二段跳状态
        this.jumpsUsed = 0;
        this.lastJumpFrame = -1;
        
        // 重置敌人位置
        this.enemyPreview.setPosition(600, 200);
        this.enemyPreview.setActive(true);
        this.enemyPreview.setVisible(true);
        this.enemyPreview.setVelocityX(enemySpeed);
        
        // 隐藏 Game Over 文字
        this.gameOverText.setVisible(false);
        this.gameOver = false;
        
        console.log('🔄 游戏重新开始！');
    };

    // --- 键盘监听：按 R 键重新开始 ---
    this.input.keyboard.on('keydown-R', () => {
        if (!this.gameOverText.visible) return;  // 只有 Game Over 时才响应
        this.resetGame();
    });
}

// ============ Update: 每帧执行的游戏逻辑 (60fps) ============
function update() {
    try {
        const speed = 250;
        

        
        // --- 左右移动 ---
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        // --- 💨 跳跃（支持二段跳）---
        
        // 🔄 每帧检查落地 → 立即重置跳跃次数
        if (this.player.body.touching.down && this.jumpsUsed > 0) {
            console.log('👟 Landed! Reset jumpsUsed to 0');
            this.jumpsUsed = 0;
        }
        
        // ⌨️ 跳跃键检测已移到 create() 中的 keydown 事件
        // 这里只需要重置逻辑即可

        // --- 🍪 Step 2b: 饼干人全屏巡逻 + 玩家吸引机制 ---
        const enemySpeed = 80;

        if (this.enemyPreview && this.enemyPreview.active) {
            // 🎯 玩家吸引机制：玩家在附近（距离 < 400px）时，主动扑向玩家！
            const distToPlayer = Phaser.Math.Distance.Between(
                this.enemyPreview.x, this.enemyPreview.y,
                this.player.x, this.player.y
            );
            
            if (distToPlayer < 400 && this.playerHP > 0) {
                // 🎯 扑向玩家！
                const dx = this.player.x - this.enemyPreview.x;
                const direction = Math.sign(dx);
                this.enemyPreview.setVelocityX(direction * enemySpeed * 1.5);  // ⚡ 加速扑向玩家
            }
            // 📺 全屏巡逻（扩大范围）
            else if (this.enemyPreview.x > 780) {
                this.enemyPreview.setVelocityX(-enemySpeed);
            } else if (this.enemyPreview.x < 20) {
                this.enemyPreview.setVelocityX(enemySpeed);
            }

            // --- 🔴 敌人血条跟随移动 + 方块显示/隐藏更新 ---
            const barCenterX = this.enemyPreview.x;
            const barCenterY = this.enemyPreview.y - 70;  // 头顶上方
            
            // 计算起始位置（让血条居中）
            const totalBarWidth = ENEMY_MAX_BLOCKS * ENEMY_BLOCK_SIZE;
            const startX = barCenterX - totalBarWidth / 2;
            
            // 🔍 计算应该显示多少个小方块
            const visibleBlocks = Math.max(0, Math.ceil(this.enemyPreview.hp / HP_PER_BLOCK));
            
            console.log(`[敌人血条更新] HP=${this.enemyPreview.hp}, 应显示 ${visibleBlocks} 个方块`);
            
            // 更新每个小方块的位置和可见性
            for (let i = 0; i < ENEMY_MAX_BLOCKS; i++) {
                if (this.enemyHealthBlocks[i]) {
                    // 设置位置（横向排列）
                    this.enemyHealthBlocks[i].setPosition(
                        startX + i * ENEMY_BLOCK_SIZE,
                        barCenterY
                    );
                    
                    // 🔴 控制可见性：有血就显示，没血就隐藏
                    const shouldBeVisible = (i < visibleBlocks);
                    this.enemyHealthBlocks[i].setVisible(shouldBeVisible);
                }
            }
        }

        // --- 🦟 Step 2e: 跳蚤智能跳跃 + 血条跟随移动 ---
        if (this.fleaEnemy && this.fleaEnemy.active) {
            const now = Date.now();
            
            // 🔴 更新跳蚤血条位置（跟随移动）+ 方块显示/隐藏
            const fleaBarCenterX = this.fleaEnemy.x;
            const fleaBarCenterY = this.fleaEnemy.y - 25;  // ⬆️ 头顶上方，更近一点
            
            const fleaTotalBarWidth = FLEA_MAX_BLOCKS * FLEA_BLOCK_SIZE;
            const fleaStartX = fleaBarCenterX - fleaTotalBarWidth / 2;
            
            const fleaVisibleBlocks = Math.max(0, Math.ceil(this.fleaEnemy.hp / HP_PER_BLOCK));
            
            for (let i = 0; i < FLEA_MAX_BLOCKS; i++) {
                if (this.fleaHealthBlocks[i]) {
                    this.fleaHealthBlocks[i].setPosition(
                        fleaStartX + i * FLEA_BLOCK_SIZE,
                        fleaBarCenterY
                    );
                    
                    const shouldBeVisible = (i < fleaVisibleBlocks);
                    this.fleaHealthBlocks[i].setVisible(shouldBeVisible);
                }
            }
            
            // 🎯 玩家吸引机制：玩家在附近（距离 < 300px）时，扑向玩家！
            const distToPlayer = Phaser.Math.Distance.Between(
                this.fleaEnemy.x, this.fleaEnemy.y,
                this.player.x, this.player.y
            );
            
            if (distToPlayer < 300 && this.playerHP > 0) {
                // 🎯 扑向玩家！
                const dx = this.player.x - this.fleaEnemy.x;
                const dy = this.player.y - this.fleaEnemy.y;
                
                // ⬅️➡️ 水平移动（朝向玩家）
                this.fleaEnemy.setVelocityX(Math.sign(dx) * 120);
                
                // ⬆️ 如果玩家在高处，跳跃！
                if (dy < -50 && this.fleaEnemy.body.touching.down && 
                    now - this.fleaLastJumpTime > 200) {
                    console.log('🦟 Flea POUNCE on player!');
                    this.fleaEnemy.setVelocityY(-600);
                    this.fleaLastJumpTime = now;
                }
            }
            // 🎲 否则随机左右跳跃探索
            else if (this.fleaEnemy.body.touching.down && 
                     now - this.fleaLastJumpTime > this.fleaJumpIntervalMin) {
                
                const randomDirection = Math.random() < 0.5 ? -1 : 1;
                const shouldJump = Math.random() < 0.7;  // 70% 几率跳跃
                
                if (shouldJump) {
                    console.log(`🦟 Flea JUMP! direction: ${randomDirection > 0 ? 'right' : 'left'}`);
                    this.fleaEnemy.setVelocityX(randomDirection * 100);  // ⬅️➡️ 水平移动
                    this.fleaEnemy.setVelocityY(-600);  // ⬆️ 向上跳跃
                    this.fleaLastJumpTime = now;
                } else {
                    // 🐌 缓慢左右移动探索
                    this.fleaEnemy.setVelocityX(randomDirection * 30);
                }
            }
        }

        // --- 🔴 玩家血条更新（方块消失效果）---
        const playerVisibleBlocks = Math.max(0, Math.ceil(this.playerHP / HP_PER_BLOCK));  // 每块=5HP
        
        for (let i = 0; i < PLAYER_MAX_BLOCKS; i++) {
            if (this.playerHealthBlocks[i]) {
                const shouldBeVisible = (i < playerVisibleBlocks);
                this.playerHealthBlocks[i].setVisible(shouldBeVisible);
            }
        }

    } catch (e) {
        console.error('Update loop error:', e);
    }

    // --- 调试信息（独立在外面，避免影响游戏逻辑）---
    try {
        const enemyStatus = this.enemyPreview && this.enemyPreview.active 
            ? this.enemyPreview.hp.toString() 
            : 'dead';
        
        this.debugText.setText(
            `HP: ${this.playerHP}/100 | Enemy: ${enemyStatus}/60\n`
            + `位置：(${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n`  
            + `在地面：${this.player.body.touching.down} | 💨 Jumps: ${this.jumpsUsed}/${this.maxJumps}`
        );
    } catch (e) {
        // 忽略调试信息错误，不影响游戏
    }
}
