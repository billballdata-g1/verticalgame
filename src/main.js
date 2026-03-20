/**
 * Phaser 3 - 横版闯关游戏
 * Step 1: 基础框架 + 玩家移动
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
    // Step 1 先用色块，后期再换精灵图
}

// ============ Create: 创建游戏对象 ============
function create() {
    console.log('🎮 Creating game objects...');

    // --- 地面 (静态组 - 不会动的物体) ---
    const ground = this.physics.add.staticGroup();
    
    // 创建一个长条作为地面（深绿色）
    const floorGraphics = this.make.graphics({ x: 0, y: 0 });
    floorGraphics.fillStyle(0x2d5a3d);
    floorGraphics.fillRect(0, 0, 800, 40);
    const floorTexture = floorGraphics.generateTexture('floor', 800, 40);
    
    const floorSprite = this.add.sprite(400, 580, 'floor');
    ground.add(floorSprite);

    // --- 玩家 (红色方块) ---
    // 用图形生成纹理作为临时玩家
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xff6b6b); // 红色
    playerGraphics.fillRect(0, 0, 32, 48);
    const playerTexture = playerGraphics.generateTexture('player', 32, 48);
    
    this.player = this.physics.add.sprite(100, 450, 'player');
    
    // 玩家物理属性
    this.player.setBounce(0.1);              // 轻微弹跳
    this.player.setCollideWorldBounds(true); // 不会跑出屏幕边界
    this.player.body.setSize(28, 44);        // 碰撞箱稍小一点，更精确

    // --- 键盘输入 ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- 碰撞检测：玩家碰到地面 ---
    this.physics.add.collider(this.player, ground);

    // --- UI: 调试信息 ---
    this.debugText = this.add.text(20, 20, '', {
        fontSize: '14px',
        fill: '#333'
    }).setScrollFactor(0); // setScrollFactor(0) 让文字固定在屏幕上
}

// ============ Update: 每帧执行的游戏逻辑 (60fps) ============
function update() {
    const speed = 250;   // 移动速度 (像素/秒)
    
    // --- 左右移动 ---
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
    } else {
        this.player.setVelocityX(0); // 不按键时停下
    }

    // --- 跳跃 ---
    if (this.cursors.up.isDown || this.cursors.space.isDown) {
        if (this.player.body.touching.down) { // 只有在地面上才能跳
            this.player.setVelocityY(-500);   // 向上速度（负值=向上）
        }
    }

    // --- 调试信息 ---
    this.debugText.setText(
        `位置：(${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n`
        + `速度 X: ${Math.round(this.player.body.velocity.x)}\n`
        + `速度 Y: ${Math.round(this.player.body.velocity.y)}\n`  
        + `在地面：${this.player.body.touching.down}`
    );
}
