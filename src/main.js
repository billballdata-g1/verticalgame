/**
 * Phaser 3 - 横版闯关游戏 (Modular Architecture)
 */

import Phaser from 'phaser';
import { cookieEnemy, fleaEnemy } from './enemies';

// ============ 全局常量（让 update 函数也能访问）===========
const PLAYER_MAX_HP = 100;
const HP_PER_BLOCK = 5;            // 每个小方块代表多少血量
const PLAYER_BLOCK_SIZE = 12;
const PLAYER_MAX_BLOCKS = 20;      // 100HP / 5 = 20 blocks
const PLAYER_BAR_X = 10;
const PLAYER_BAR_Y = 10;

// 💨 二段跳相关常量
const DEFAULT_MAX_JUMPS = 1;       // 默认只能跳一次
const DOUBLE_JUMP_VALUE = 2;       // 鞋子道具给的跳跃次数

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

    // --- 🍪 Step 2e-1: 使用模块化 API 创建饼干人敌人 ---
    console.log('🍪 Creating Cookie Enemy via modular API...');
    this.cookieSprite = cookieEnemy.create(this);
    this.cookieHealthBlocks = cookieEnemy.createHealthBar(this);
    
    // 🔴 饼干人死亡时清除血条的方法
    const hideCookieHealthBar = () => {
        console.log('🗑️ [清理] 隐藏所有饼干人血条方块');
        this.cookieHealthBlocks.forEach(block => block.setVisible(false));
    };

    // --- 🦟 Step 2e-1: 使用模块化 API 创建跳蚤敌人 ---
    console.log('🦟 Creating Flea Enemy via modular API...');
    this.fleaSprite = fleaEnemy.create(this);
    this.fleaHealthBlocks = fleaEnemy.createHealthBar(this);
    
    // 🔴 跳蚤死亡时清除血条的方法
    const hideFleaHealthBar = () => {
        console.log('🗑️ [清理] 隐藏所有跳蚤血条方块');
        this.fleaHealthBlocks.forEach(block => block.setVisible(false));
    };

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

    // --- 🍪 Step 2e-1: 饼干人设置碰撞检测（模块化 API）---
    cookieEnemy.setupColliders(this, this.cookieSprite, ground, platforms, this.player);

    // --- 🦟 Step 2e-1: 跳蚤设置碰撞检测（模块化 API）---
    fleaEnemy.setupColliders(this, this.fleaSprite, ground, platforms, this.player);

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

    // ============ 血量系统 ============
    this.playerHP = 100;
    this.gameOver = false;  // 游戏结束标志

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
        
        // 💨 重置二段跳状态
        this.jumpsUsed = 0;
        this.lastJumpFrame = -1;
        
        // 🍪 重置饼干人位置
        if (this.cookieSprite) {
            this.cookieSprite.setPosition(600, 200);
            this.cookieSprite.setActive(true);
            this.cookieSprite.setVisible(true);
            this.cookieSprite.hp = cookieEnemy.config.hp;
            this.cookieSprite.setVelocityX(80);
        }
        
        // 🦟 重置跳蚤位置
        if (this.fleaSprite) {
            this.fleaSprite.setPosition(300, 180);
            this.fleaSprite.setActive(true);
            this.fleaSprite.setVisible(true);
            this.fleaSprite.hp = fleaEnemy.config.hp;
        }
        
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

        // --- 🍪 Step 2e-1: 使用模块化 API 更新饼干人 ---
        if (this.cookieSprite && this.cookieSprite.active) {
            cookieEnemy.update(this, this.cookieSprite, this.cookieHealthBlocks);
        }

        // --- 🦟 Step 2e-1: 使用模块化 API 更新跳蚤 ---
        if (this.fleaSprite && this.fleaSprite.active) {
            fleaEnemy.update(this, this.fleaSprite, this.fleaHealthBlocks);
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
        const cookieStatus = this.cookieSprite && this.cookieSprite.active 
            ? this.cookieSprite.hp.toString() 
            : 'dead';
        
        const fleaStatus = this.fleaSprite && this.fleaSprite.active
            ? this.fleaSprite.hp.toString()
            : 'dead';
        
        this.debugText.setText(
            `HP: ${this.playerHP}/100 | 🍪 Cookie: ${cookieStatus} | 🦟 Flea: ${fleaStatus}\n`
            + `位置：(${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n`  
            + `在地面：${this.player.body.touching.down} | 💨 Jumps: ${this.jumpsUsed}/${this.maxJumps}`
        );
    } catch (e) {
        // 忽略调试信息错误，不影响游戏
    }
}
