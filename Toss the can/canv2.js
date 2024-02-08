const assets_list = {
    "background": "assets/park.png",
    "platform": "assets/bin.png",
    "player": "assets/runner.png",
    "enemy": "assets/virus.png",
    "projectile": "assets/redcan.png",
    "collectible": "assets/abstract.png",
    "avoidable": "assets/bullet2.png",
};

const assetsLoader = {
    "background": "background",
    "projectile": "projectile",
    "platform": "platform",
};

const orientationSizes = {
    "landscape": {
        "width": 1280,
        "height": 720,
    },
    "portrait": {
        "width": 720,
        "height": 1280,
    }
}

// Custom UI Elements. Fill the code below based on the game idea.
const gameTitle = `Toss the Can`
const gameDescription = `Tap on projectile to toss and land it correctly
on desired object.`
const gameInstruction =
    `Instructions:
    1. Tap on object to toss it.`

// Custom Font Colors
const globalPrimaryFontColor = "#FFF";
const globalSecondaryFontColor = "#0F0"

// Game Orientation
const orientation = "landscape";

// Start Scene
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        startScenePreload(this);
        loadBlurredBg(this);

    }

    create() {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this);


        // Add UI elements
        this.add.text(this.width / 2, this.height / 2 - 300, gameTitle, { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, this.height / 2 - 200, gameDescription, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, this.height / 2 - 100, gameInstruction, { fontSize: '20px', fill: globalPrimaryFontColor }).setOrigin(0.5);

        const startButton = this.add.text(this.width / 2, this.height / 2, 'Start', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        startButton.setInteractive({ cursor: 'pointer' });
        startButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
    }

    preload() {
        // Load In-Game Assets from assetsLoader
        for (const key in assetsLoader) {
            this.load.image(key, assets_list[assetsLoader[key]]);
        }

        gameScenePreload(this);
        displayProgressLoader.call(this);
    }

    create() {
        this.difficulty = 1;
        this.difficultyDelay = 5000;
        this.spawnTimeDelay = 1500 * this.difficulty;
        this.startDelay = 2000;

        this.width = this.game.config.width;
        this.height = this.game.config.height;

        this.gameSceneBackground();

        // Add UI elements
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: globalPrimaryFontColor });
        this.missesText = this.add.text(10, 30, 'Missed: 0/10', { fontSize: '20px', fill: globalPrimaryFontColor });

        // Add input listeners
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
        const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '16px', fill: globalSecondaryFontColor }).setOrigin(1, 0);
        pauseButton.setInteractive({ cursor: 'pointer' });
        pauseButton.on('pointerdown', () => this.pauseGame());
        this.score = 0;
        this.missed = 0;

        this.landingTarget = this.physics.add.staticSprite(this.width - 200, this.height, 'platform')
            .setScale(0.3).setOrigin(0.5, 1).refreshBody();
        this.landingTarget.preFX.addShine(0.7);
        this.landingTarget.body.setSize(this.landingTarget.body.width / 1.5, this.landingTarget.body.height / 1.5);


        this.projectiles = this.physics.add.group({});
        // this.projectiles.setCollideWorldBounds(true);

        this.physics.add.collider(this.projectiles, this.projectiles);
        this.physics.add.collider(this.projectiles, this.landingTarget, this.projectileLanding, null, this);
        gameSceneCreate(this);
    }

    spawnProjectile() {
        for (var i = 0; i < 1; i++) {
            const projectile = this.projectiles.create(0, Phaser.Math.Between(this.height - 150, this.height / 2 - 150), 'projectile');
            projectile.setScale(0.1);
            projectile.body.setSize(projectile.body.width, projectile.body.height);
            projectile.setVelocity(Phaser.Math.Between(100, 150), Phaser.Math.Between(-250, -300));
            projectile.setAngularVelocity(900).setBounce(0.5);

            projectile.setInteractive();

            projectile.on("pointerdown", () => {

                projectile.emitter = this.add.particles(0, 0, 'projectile', {
                    frequency:2,
                    speed: 200,
                    lifespan: 300,
                    alpha: {
                        onEmit: (particle, key, t, value) => Phaser.Math.Percent(projectile.body.speed, 0, 300) * 1000
                    },
                    scale: { start: 0.015, end: 0 },
                    blendMode: 'ADD',
                });
                projectile.emitter.startFollow(projectile);
                this.time.delayedCall(200, () => {
                    projectile.emitter.stop();
                })

                projectile.setVelocityY(-250);
            }, this);
        }
    }

    projectileLanding(target, projectile) {
        if (projectile.body.touching.down && target.body.touching.up) {
            this.updateScore(10);
            this.scorePointAnim();
            projectile.destroy();
        } else {
            projectile.setAngularVelocity(60)
            this.updateMisses(1);
        }
    }

    update() {
        gameSceneUpdate(this);

        if (this.projectiles.getChildren().length) {
            this.projectiles.children.iterate((p) => {
                if (p == undefined) return;

                if (p.x > this.width || p.y > this.height) {
                    p.destroy();
                    this.updateMisses(1);
                    this.shakeTarget()
                }
            })
        }

        if (this.time.now > this.spawnTimeDelay && this.time.now > this.startDelay) {
            this.spawnProjectile();
            this.spawnTimeDelay = this.time.now + (2500 * this.difficulty);
        }

        if (this.time.now > this.difficultyDelay && this.difficulty > 0.1) {
            this.difficulty -= 0.02;
            this.difficultyDelay = this.time.now + 10000;
        }
    }

    shakeTarget() {
        this.tweens.add({
            targets: this.landingTarget,
            x: this.landingTarget.x + 10,
            yoyo: true,
            repeat: 2,
            duration: 50
        });
    }

    scorePointAnim() {
        let dx = this.landingTarget.x - 50;
        let dy = this.game.config.height - this.landingTarget.displayHeight;
        let scoreText = this.add.text(dx, dy, '+10', { fontSize: '40px', fill: globalSecondaryFontColor });

        this.tweens.add({
            targets: scoreText,
            y: dy - 100,
            duration: 800,
            ease: 'Power1',
            onComplete: function () {
                scoreText.destroy();
            }
        });
    }

    updateScore(points) {
        this.score += points;
        this.updateScoreText();
    }

    updateScoreText() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateMisses(misses) {
        this.missed += misses;
        this.updateMissesext();
        if (this.missed >= 10) {
            this.gameOver();
        }
    }

    updateMissesext() {
        this.missesText.setText(`Missed: ${this.missed}/10`);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score });
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    gameSceneBackground() {
        this.bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.bg.displayHeight = this.height;
        this.bg.displayWidth = this.width;
    }

}

// Pause Scene
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    preload() {
        pauseScenePreload(this);
        loadBlurredBg(this);

    }

    create() {
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this)
        // Add UI elements
        const resumeButton = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Resume', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        resumeButton.setInteractive({ cursor: 'pointer' });
        resumeButton.on('pointerdown', () => this.resumeGame());

        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }

    resumeGame() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        gameOverScenePreload(this);
        loadBlurredBg(this);


    }

    create(data) {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this);
        // Add UI elements
        this.add.text(this.width / 2, 100, 'GAME OVER', { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, 200, `Score: ${data.score}`, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);

        const restartButton = this.add.text(this.width / 2, this.height / 2, 'Restart', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        restartButton.setInteractive({ cursor: 'pointer' });
        restartButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

function loadBlurredBg(game) {
    if (typeof assetsLoader === 'undefined') return;
    game.blurredBg = Object.keys(assetsLoader).find(dataKey => dataKey.includes("background"));
    if (game.blurredBg) {
        game.load.image(game.blurredBg, assets_list[assetsLoader[game.blurredBg]]);
    }
}

function createBlurredBg(game) {
    if (!game.blurredBg) return;
    game.blurredBg = game.add.image(0, 0, game.blurredBg).setOrigin(0, 0);
    game.blurredBg.displayHeight = game.game.config.height;
    game.blurredBg.displayWidth = game.game.config.width;
    game.blurredBg.preFX.addGradient("black", "black", 0.3)
    game.blurredBg.preFX.addBlur(0, 2, 2, 0.3);
}

function displayProgressLoader() {
    let width = 320;
    let height = 50;
    let x = (this.game.config.width / 2) - 160;
    let y = (this.game.config.height / 2) - 50;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    const loadingText = this.make.text({
        x: this.game.config.width / 2,
        y: this.game.config.height / 2 + 20,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    }).setOrigin(0.5, 0.5);
    loadingText.setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0x364afe, 1);
        progressBar.fillRect(x, y, width * value, height);
    });
    this.load.on('fileprogress', function (file) {
        console.log(file.src);
    });
    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
    });
}


/*
------------------- GLOBAL CODE ENDS HERE -------------------
*/

// Configuration object
const config = {
    type: Phaser.AUTO,
    width: orientationSizes[orientation].width,
    height: orientationSizes[orientation].height,
    scene: [StartScene, GameScene, PauseScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    /*
    ADD CUSTOM CONFIG ELEMENTS HERE
    */
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
};

// Game instance
const game = new Phaser.Game(config);

// START SCENE PHASER FUNCTIONS
function startScenePreload(game) { }
function startSceneCreate(game) { }
function startSceneUpdate(game) { }

// PAUSE SCENE PHASER FUNCTIONS
function pauseScenePreload(game) { }
function pauseSceneCreate(game) { }
function pauseSceneUpdate(game) { }

// GAME OVER SCENE PHASER FUNCTIONS
function gameOverScenePreload(game) { }
function gameOverSceneCreate(game) { }
function gameOverSceneUpdate(game) { }

// GAME SCENE PHASER FUNCTIONS
function gameScenePreload(game) {
    for (const key in assetsLoader) {
        game.load.image(key, assetsLoader[key]);
    }
}

//CREATE FUNCTION FOR THE GAME SCENE
function gameSceneCreate(game) {
    // Use updateScore(10) to increment score
    // Use gameOver() for game over
}

//UPDATE FUNCTION FOR THE GAME SCENE
function gameSceneUpdate(game) {
    // Use updateScore(10) to increment score
    // Use gameOver() for game over
}