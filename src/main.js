/**
 * Phaser 3 - 横版闯关游戏
 */

import Phaser from 'phaser';

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

    // --- 敌人也要和平台/地面碰撞（不会掉下去）---
    this.physics.add.collider(this.enemyPreview, ground);
    this.physics.add.collider(this.enemyPreview, platforms);

    // --- 血量系统 (Step 2b-5) ---
    this.playerHP = 100;
    const PLAYER_MAX_HP = 100;
    this.enemyPreview.hp = 60;
    const ENEMY_MAX_HP = 60;

    // --- 玩家碰到敌人 → 双向掉血 (改用 overlap，每帧触发) ---
    const playerDamage = 20;
    const enemyDamage = 30;

    this.physics.add.overlap(this.player, this.enemyPreview, (player, enemy) => {
        // 双方都掉血（但要避免一帧多次触发，用简单的时间戳）
        const now = Date.now();
        
        if (!this.lastDamageTime || now - this.lastDamageTime > 200) {  // 200ms 冷却
            // 玩家掉血
            this.playerHP -= playerDamage;
            console.log(`❤️ 玩家受伤！HP: ${this.playerHP}`);
            
            // 敌人掉血
            enemy.hp -= enemyDamage;
            console.log(`🍪 饼干人受伤！HP: ${enemy.hp}`);
            
            this.lastDamageTime = now;
            
            // 弹开效果 — 玩家向后跳
            const direction = player.x < enemy.x ? -1 : 1;
            player.setVelocity(direction * 150, -200);
            
            // 检查敌人死亡
            if (enemy.hp <= 0) {
                console.log('💥 饼干人被击败了！');
                enemy.destroy();  // 删除敌人
            }
            
            // 检查玩家死亡
            if (this.playerHP <= 0) {
                console.log('💀 Game Over! 被饼干人抓住了！');
                this.gameOverText.setVisible(true);
                player.setVelocity(0, 0);
                player.setTint(0x888888);  // 变灰
            }
        }
    });

    // --- 玩家血条 UI (左上角) ---
    this.playerBarBG = this.add.rectangle(200, 35, 160, 20, 0x333333);
    this.playerBarFG = this.add.rectangle(200, 35, 160, 20, 0x00ff00);

    // --- 敌人血条 UI (头顶) ---
    this.enemyBarBG = this.add.rectangle(600, 180, 60, 8, 0x333333).setScrollFactor(0);
    this.enemyBarFG = this.add.rectangle(600, 180, 60, 8, 0xff0000).setScrollFactor(0);

    // --- UI: 调试信息 ---
    this.debugText = this.add.text(20, 20, '', {
        fontSize: '14px',
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
        
        // 隐藏 Game Over 文字
        this.gameOverText.setVisible(false);
        
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

        // --- 跳跃 ---
        if (this.cursors.up.isDown || this.cursors.space.isDown) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(-500);
            }
        }

        // --- 敌人巡逻逻辑 ---
        const enemySpeed = 80;

        if (this.enemyPreview && this.enemyPreview.active) {
            if (this.enemyPreview.x > 650) {
                this.enemyPreview.setVelocityX(-enemySpeed);
            } else if (this.enemyPreview.x < 550) {
                this.enemyPreview.setVelocityX(enemySpeed);
            }
        }

        // --- 实时更新血条宽度（只做宽度，不做位置移动）---
        const playerPct = Math.max(0, this.playerHP / PLAYER_MAX_HP);
        if (this.playerBarFG) {
            this.playerBarFG.width = 160 * playerPct;
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
            + `速度 X: ${Math.round(this.player.body.velocity.x)}\n`
            + `速度 Y: ${Math.round(this.player.body.velocity.y)}\n`  
            + `在地面：${this.player.body.touching.down}`
        );
    } catch (e) {
        // 忽略调试信息错误，不影响游戏
    }
}
