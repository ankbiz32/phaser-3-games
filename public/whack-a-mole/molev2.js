const assets_list = {
    "background": "assets/bg.png",
    "platform": "assets/bg2.png",
    "player": "assets/bg.png",
    "enemy": "assets/mole.png",
    "projectile": "assets/bg2.png",
    "collectible": "assets/powerup.png",
    "avoidable": "assets/bg2.png",
};

const assetsLoader = {
    "background": "background",
    "enemy": "enemy",
};

// Custom UI Elements
const gameTitle = `Whack a Mole`;
const gameDescription = `Reaction arcade game. `;
const gameInstruction =
    `   Instructions:
        1. Click the moles to killlll them.
        2. Set the highest score in the given time.`;

// Custom Font Colors
const globalPrimaryFontColor = "#FFF";
const globalSecondaryFontColor = "#0F0";

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

        const startButton = this.add.text(this.width / 2, this.height / 1.8, 'Start', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        startButton.setInteractive({ cursor: 'pointer' });
        startButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.rows = 4;
        this.columns = 4;
        this.rectWidth = 120;
        this.rectHeight = 70;
        this.spacing = 40;
        this.indexInUse = [];
        this.randomPositions = [];
    }

    preload() {
        gameScenePreload(this);
        for (const key in assetsLoader) {
            this.load.image(key, assets_list[assetsLoader[key]]);
        }
        displayProgressLoader.call(this);
    }

    create() {
        this.score = 0;
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.initTimeLimit = 50;
        this.timeLimit = this.initTimeLimit;

        this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.bg.displayHeight = this.game.config.height;
        this.bg.displayWidth = this.game.config.width;

        // Add UI elements
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: globalPrimaryFontColor });
        this.scoreText.setDepth(11);

        // Add input listeners
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
        const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '32px', fill: globalSecondaryFontColor, backgroundColor: "black" }).setOrigin(1, 0);
        pauseButton.setInteractive({ cursor: 'pointer' });
        pauseButton.on('pointerdown', () => this.pauseGame());

        gameSceneCreate(this);
        // To check if rows and columns won't get out of the game canvas area
        this.totalWidth = this.columns * this.rectWidth + ((this.columns - 1) * this.spacing);
        this.totalHeight = this.rows * this.rectHeight + ((this.rows - 1) * this.spacing);
        if (this.totalWidth > this.game.config.width) {
            let extraWidth = this.totalWidth - this.game.config.width;
            this.rectWidth = this.rectWidth - (extraWidth / this.columns);
        }
        if (this.totalHeight > this.game.config.height) {
            let extraHeight = this.totalHeight - this.game.config.height;
            this.rectHeight = this.rectHeight - (extraHeight / this.rows);
        }

        this.startPosX = ((this.game.config.width - this.totalWidth) / 2) + this.rectWidth / 2;
        this.startPosY = ((this.game.config.height - this.totalHeight) / 2) + this.rectHeight / 2;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.randomPositions.push({
                    x: this.startPosX + (j * (this.rectWidth + this.spacing)),
                    y: this.startPosY + (i * (this.rectHeight + this.spacing))
                })
            }
        };
        this.timerText = this.add.text(16, 50, 'Time: ' + this.timeLimit, { fontSize: '24px', fill: '#fff' });

        this.randomPositions.forEach((pos) => {
            let ellipse = this.add.ellipse(pos.x, pos.y, this.rectWidth, this.rectHeight, 0x462e1a , 1);
        })

        this.moleGroup = this.add.group();

        this.createSpawnerEvent(700);

        this.timerEvent = this.time.addEvent({
            delay: 500,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    createSpawnerEvent(time) {
        if (this.spawnerEvent) this.spawnerEvent.destroy();
        this.spawnerEvent = this.time.addEvent({
            delay: time,
            callback: this.spawnMole,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.timeLimit -= 1;
        this.timerText.setText('Time: ' + this.timeLimit);

        if (this.timeLimit === 0) {
            this.endGame();
        } else if (this.timeLimit === Math.floor(this.initTimeLimit / 2)) {
            this.createSpawnerEvent(500)
        } else if (this.timeLimit === Math.floor(this.initTimeLimit / 2.5)) {
            this.createSpawnerEvent(300)
        }
    }

    hitMole(mole) {
        if (mole.missed) return;
        this.updateScore(10);
        mole.killed = true;
        this.tweens.add({
            targets: mole,
            displayHeight: 5,
            duration: 200,
            ease: 'Power2',
            onComplete: (tween, targets) => {
                targets[0].destroy();
            }
        });
    }

    spawnMole() {
        let randomIndex = Phaser.Math.Between(0, this.randomPositions.length - 1);

        // Avoids mole to spawn in the same place
        if (this.indexInUse.includes(randomIndex)) return;

        this.indexInUse.push(randomIndex);
        const randomPosition = this.randomPositions[randomIndex];
        const mole = this.moleGroup.create(randomPosition.x, randomPosition.y - 10, 'enemy');
        mole.killed = false;
        mole.missed = false;
        mole.setAlpha(0).setScale(0.21).setInteractive({ cursor: 'pointer' });
        this.tweens.add({
            targets: mole,
            alpha: 1,
            y: randomPosition.y - 25,
            duration: 300,
            ease: 'Power2',
        });
        mole.on('pointerdown', () => this.hitMole(mole), this);

        // Hide the mole after a certain time
        this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            let indexToBeRemoved = this.indexInUse.indexOf(randomIndex);
            this.indexInUse.splice(indexToBeRemoved, 1);
            if (mole.killed) return;
            mole.missed = true;
            this.tweens.add({
                targets: mole,
                alpha: 0,
                y: randomPosition.y + 10,
                duration: 300,
                ease: 'Power2',
                onComplete: (tween, targets) => {
                    targets[0].destroy();
                }
            });
        });
    }

    endGame() {
        this.spawnerEvent.destroy();
        this.timerEvent.destroy();
        this.gameOver();
    }

    updateScore(points) {
        this.score += points;
        this.updateScoreText();
    }

    updateScoreText() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score });
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
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
        createBlurredBg(this);
        // Add UI elements
        const resumeButton = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Resume', { fontSize: '42px', fill: globalSecondaryFontColor, backgroundColor: "black", padding: { top: 7, left: 15, right: 15, bottom: 7 } }).setOrigin(0.5);
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
        createBlurredBg(this);
        // Add UI elements
        this.add.text(this.width / 2, 100, 'GAME OVER', { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, 200, `Scored: ${data.score}`, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);

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
    // backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [StartScene, GameScene, PauseScene, GameOverScene],
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
}

//CREATE FUNCTION FOR THE GAME SCENE
function gameSceneCreate(game) {
}

//UPDATE FUNCTION FOR THE GAME SCENE
function gameSceneUpdate(game, time, delta) {
}