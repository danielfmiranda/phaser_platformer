const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 608,
    height: 400,
    scale: {
        // mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload,
        create,
        update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 650},
            debug: false,
        },
    }
};


var stars;
var bombs;
var score = 0;
var scoreText;
var gameOver = false;
var iter = 0;
var background;


const game = new Phaser.Game(config);

function preload() {

    this.load.image('sky', 'assets/background/Brown.png');
    // this.load.image('background', 'assets/images/background.png');
    this.load.image('spike', 'assets/images/spike.png');
    // At last image must be loaded with its JSON
    // this.load.atlas('player', 'assets/images/kenney_player.png', 'assets/images/kenney_player_atlas.json');


    this.load.image('bomb', 'assets/enemies/16bit_bomb1.png');


    this.load.spritesheet('star', 'assets/Fruits/Pineapple.png', {
        frameWidth: 32,
        frameHeight: 32
    });


    //load the tilesheet
    this.load.image('tiles', 'assets/tilesets/Terrain (16x16).png');


    this.load.spritesheet('dude', 'assets/images/Virtual Guy/Run (32x32).png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('dudeIdle', 'assets/images/Virtual Guy/Idle (32x32).png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('dudeJump', 'assets/images/Virtual Guy/Jump (32x32).png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('startPoint', 'assets/checkpoints/Start (Moving) (64x64).png', {
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('endPoint', 'assets/checkpoints/End (Pressed) (64x64).png', {
        frameWidth: 64,
        frameHeight: 64
    });


    // Load the export Tiled JSON
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/level3.json');

}

function create() {

    background = this.add.tileSprite(0, 0, 1800, 1200, 'sky');


    // const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    // backgroundImage.setScale(2, 0.8);
    const map = this.make.tilemap({key: 'map'});
    const tileset = map.addTilesetImage('daniel_simple_tileset', 'tiles');
    const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);

    this.startPoint = this.physics.add.sprite(75, 272, 'startPoint');
    this.physics.add.collider(this.startPoint, platforms);


    this.player = this.physics.add.sprite(85, 300, 'dude');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);


    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 8}),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'startPointIdle',
        frames: this.anims.generateFrameNumbers('startPoint', {start: 0, end: 8}),
        frameRate: 5,
        repeat: -1
    });


    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('dudeIdle', {start: 0, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('dudeJump', {start: 0, end: 8}),
        frameRate: 10,
    });


    this.anims.create({
        key: 'fruit_idle',
        frames: this.anims.generateFrameNumbers('star', {start: 0, end: 16}),
        frameRate: 10,
        repeat: -1
    });


    this.cursors = this.input.keyboard.createCursorKeys();


    // ADDING ALL THE SPIKE INFORMATION USING SPIKES OBJECT LATER
    // this.spikes = this.physics.add.group({
    //     allowGravity: false,
    //     immovable: true
    // });
    //
    // const spikeObjects = map.getObjectLayer('Spikes')['objects'];
    //
    // spikeObjects.forEach(spikeObject => {
    //     // Add new spikes to our sprite group, change the start y position to meet the platform
    //     const spike = this.spikes.create(spikeObject.x, spikeObject.y + 200 - spikeObject.height, 'spike').setOrigin(0, 0);
    // });
    //
    //
    // this.physics.add.collider(this.player, this.spikes, playerHit, null, this);

    this.stars = this.physics.add.group({
        key: 'star',
        repeat: 6,
        // setXY: {x: 60, y: 0, stepX: Phaser.Math.Between(20, 100)}
    });

    this.stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.anims.play('fruit_idle', true);
        child.setX(Phaser.Math.Between(1, 590));


    });


    bombs = this.physics.add.group();


    scoreText = this.add.text(16, 16, 'score: 0', {
        fontFamily: 'Arial',
        fontSize: '20px',
        marginLeft: '200px',
        fill: '#000',
    });


    this.physics.add.collider(this.stars, platforms);
    this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(this.player, bombs, hitBomb, null, this);
    var x = (this.player.x < 400) ? Phaser.Math.Between(0, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;

}

function update() {


    background.tilePositionY = -iter * 20;
    iter += 0.01;


    this.startPoint.play('startPointIdle', true);


    // Control the player with left or right keys
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
        if (this.player.body.onFloor()) {
            this.player.play('walk', true);
        }
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        if (this.player.body.onFloor()) {
            this.player.play('walk', true);
        }
    } else {
        // If no keys are pressed, the player keeps still
        this.player.setVelocityX(0);
        // Only show the idle animation if the player is footed
        // If this is not included, the player would look idle while jumping
        if (this.player.body.onFloor()) {
            this.player.play('idle', true);
        }
    }

// Player can jump while walking any direction by pressing the space bar
// or the 'UP' arrow
    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
        this.player.setVelocityY(-300);
        this.player.play('jump', true);
    }

    if (this.player.body.velocity.x > 0) {
        this.player.setFlipX(false);
    } else if (this.player.body.velocity.x < 0) {
        // otherwise, make them face the other side
        this.player.setFlipX(true);
    }

}


function collectStar(player, star) {
    // star.anims.play('collected', true);

    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (this.stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        this.stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }


}


function hitBomb(player, bomb) {
    player.setTint(0xff0000);
    player.setVelocity(0, 0);
    player.setX(85);
    player.setY(300);
    player.play('idle', true);
    player.setAlpha(0);
    let tw = this.tweens.add({
        targets: player,
        alpha: 1,
        duration: 100,
        ease: 'Linear',
        repeat: 5,
    });

    gameOver = true;
    score = 0;
    scoreText.setText('Score: ' + score);
    this.scene.start();


}

function resetGame(player, bomb) {
    // this.physics.pause();

}

