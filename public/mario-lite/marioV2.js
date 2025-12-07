const assets_list = {
  "background": "mario-lite/assets/bg.png",
  "platform": "mario-lite/assets/brick.png",
  "player": "mario-lite/assets/mario.png",
  "enemy": "mario-lite/assets/enemy.png",
  "projectile": "mario-lite/assets/bullet.png",
  "collectible": "mario-lite/assets/coin.png",
  "mushroom": "mario-lite/assets/pwerup.png",
};

const assetsLoader = {
  "background": "background",
  "player": "player",
  "enemy": "enemy",
  "collectible": "collectible",
  "mushroom": "mushroom",
  "projectile": "projectile",
  "platform": "platform",
};
// Custom Font Colors
const globalPrimaryFontColor = "#FFF";
const globalSecondaryFontColor = "#0F0"

// Custom UI Elements
const gameTitle = `MARIO LITE`
const gameDescription = `A Platformer game where you collect powerups and kill enemies by
stomping them. Game ends after you reach 500m`
const gameInstruction =
  `Instructions:
    1. Use LEFT / RIGHT arrow key to move.
    2. Use UP arrow / Square button to jump
    3. Use SPACE/ round button to shoot and destroy enemies`;

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

// Touuch Screen Controls
const joystickEnabled = true;
const buttonEnabled = true;
const hideButtons = true;

// JOYSTICK DOCUMENTATION: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
const rexJoystickUrl = "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js";

// BUTTON DOCMENTATION: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/button/
const rexButtonUrl = "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js";


/*
------------------- GLOBAL CODE STARTS HERE -------------------
*/

const PLAYER_STATE = {
  SMALL: 0,
  BIG: 1,
  BULLETS: 2,
}

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
    createBlurredBg(this);
    this.width = this.game.config.width;
    this.height = this.game.config.height;

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
    super('GameScene');
  }

  init() {
    this.cursors = null;
    this.player = null;
    this.platforms = null;
    this.enemies = null;
    this.nextEnemyTime = 0;
    this.nextBricksTime = 0;
    this.scoreText = null;
    this.powerUps = null;
    this.score = 0;
    this.width = this.game.config.width;
    this.height = this.game.config.height;
  }

  preload() {
    gameScenePreload(this);

    for (const key in assetsLoader) {
      this.load.image(key, assets_list[assetsLoader[key]]);
    }

    if (joystickEnabled) this.load.plugin('rexvirtualjoystickplugin', rexJoystickUrl, true);
    if (buttonEnabled) this.load.plugin('rexbuttonplugin', rexButtonUrl, true);

    displayProgressLoader.call(this);
  }

  create() {
    this.input.addPointer(3);
    this.score = 0;
    this.meter = 0;
    this.finishPoint = 20000;
    this.playerState = PLAYER_STATE.SMALL; // 0 : small | 1 : Big | 2 : Big + Bullets
    this.brickSize = 50;
    gameSceneBackground(this);

    this.bg = this.add.tileSprite(0, 0, this.finishPoint + 200, this.game.config.height, 'background').setOrigin(0, 0);
    this.bg.setScrollFactor(1);

    this.endPole = this.add.sprite(this.finishPoint, 100, 'platform').setOrigin(0, 0);
    this.endPole.setScrollFactor(1);
    this.endPole.displayHeight = this.game.config.height;
    this.endPole.displayWidth = 40;
    // Add UI elements
    this.meterText = this.add.text(16, 16, 'Meter: 0m', { fontSize: '25px', fill: '#ffffff' });
    this.meterText.setScrollFactor(0);
    this.scoreText = this.add.text(16, 45, 'Coins: 0', { fontSize: '25px', fill: '#ffffff' });
    this.scoreText.setScrollFactor(0);

    this.finishText = this.add.text(this.finishPoint - 30, 50, 'FINISH', { fontSize: '25px', fill: globalSecondaryFontColor }).setScrollFactor(1);
    // Add input listeners
    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '16px', fill: globalSecondaryFontColor }).setOrigin(1, 0);
    pauseButton.setInteractive({ cursor: 'pointer' }).setScrollFactor(0);
    pauseButton.on('pointerdown', () => this.pauseGame());

    gameSceneCreate(this);

    this.physics.world.bounds.setTo(0, 0, this.finishPoint + 200, this.game.config.height);
    this.physics.world.setBoundsCollision(true);


    this.player = this.physics.add.sprite(0, 0, 'player').setScale(0.17).setBounce(0.1).setCollideWorldBounds(true);
    this.player.body.setSize(this.player.body.width / 1.5, this.player.body.height);
    this.player.setGravityY(500);
    this.player.power_state = PLAYER_STATE.SMALL;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.bullets = this.physics.add.group({
      defaultKey: 'projectile',
      active: false,
      maxSize: 25
    });

    this.ground = this.add.tileSprite(0, this.game.config.height, this.finishPoint + 200, 50, 'platform');
    this.physics.add.existing(this.ground);
    this.ground.body.immovable = true;
    this.ground.body.allowGravity = false;
    this.ground.body.setCollideWorldBounds(true);
    this.ground.setOrigin(0, 0).setDepth(10);

    this.platforms = this.physics.add.staticGroup();
    let y = this.game.config.height - this.ground.displayHeight - this.player.displayHeight - 120;
    let x = this.player.x + this.game.config.width / 2 + 100;
    let platform = this.platforms.create(x, y, 'platform');
    platform.displayHeight = platform.displayWidth = this.brickSize;
    platform.refreshBody();
    let i = 5;
    while (i) {
      x = x + platform.displayWidth + 1;
      platform = this.platforms.create(x, y, 'platform');
      platform.displayHeight = platform.displayWidth = this.brickSize;
      platform.refreshBody();
      i--;
    }

    this.physics.add.collider(this.player, this.platforms, this.hitBrick, null, this);
    this.physics.add.collider(this.player, this.ground);

    this.enemies = this.physics.add.group();
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.ground);

    this.powerUps = this.physics.add.group();
    this.cameras.main.setBounds(0, 0, this.finishPoint + 200, this.game.config.height);
    this.physics.add.collider(this.powerUps, this.ground);
    this.physics.add.collider(this.powerUps, this.platforms);

    this.cameras.main.startFollow(this.player);

    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    this.highestX = this.player.x;
    this.physics.add.collider(this.player, this.enemies, this.onPlayerEnemyCollision, null, this);
    this.physics.add.collider(this.bullets, this.enemies, this.bulletHit, null, this);
    this.physics.add.collider(this.bullets, this.platforms);
    this.physics.add.collider(this.bullets, this.ground);

    this.playerMovedBackFrom = this.player.x;
    this.canSpawnEnemies = true;
    this.createMobileButtons();
    console.log(this.joystickKeys)
  }

  update(time, delta) {
    gameSceneUpdate(this, time, delta);
    if(this.hideButtons){
      if(this.joyStick){this.joystick.visible = false};
    }
    if(this.player.x > this.endPole.x - 20){
      this.player.setTint(0x00ff00);
      this.physics.pause();
      this.time.delayedCall(1000, () => {
        this.gameOver();
      });
    }

    if ((this.cursors.left.isDown || this.joystickKeys.left.isDown) && this.player.x > this.cameras.main.scrollX) {
      this.player.leftShoot = true;
      if (this.canSpawnEnemies) this.canSpawnEnemies = false;
      if (this.playerMovedBackFrom < this.player.x) {
        this.playerMovedBackFrom = this.player.x;
      }
      this.cameras.main.stopFollow();
      this.player.flipX = true;
      // if(this.player.x > this.game.canvas.width)
      this.player.setVelocityX(-160);

    } else if (this.cursors.right.isDown || this.joystickKeys.right.isDown) {
      this.player.leftShoot = false;
      if (!this.canSpawnEnemies) this.canSpawnEnemies = true;
      if (this.player.x > this.playerMovedBackFrom) {
        this.cameras.main.startFollow(this.player);
      }

      this.player.setVelocityX(160);
      this.player.flipX = false;

    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.buttonA.button.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-650);
    }
    if (time > this.nextEnemyTime) {
      this.spawnEnemy();
      this.nextEnemyTime = time + Phaser.Math.Between(2000, 6000);
    }
    if (this.nextBricksTime && time > this.nextBricksTime && (this.cursors.right.isDown || this.joystickKeys.right.isDown )) {
      this.nextBricksTime = time + Phaser.Math.Between(6000, 15000);
      let bricksNum = Phaser.Math.Between(2, 5);
      this.spawnBricks(bricksNum);
      if (Phaser.Math.Between(0, 5)) {
        this.spawnBricks(3, this.brickSize * bricksNum + 200, Phaser.Math.Between(150, 250));
      }
    }
    if (this.nextBricksTime == 0 && this.player.x > this.game.config.width) {
      this.nextBricksTime = time;
    }

    if (this.player.x > this.highestX) {
      this.highestX = this.player.x;
      this.meter = Math.abs(Math.round(this.player.x / 100));
      this.meterText.setText('Meter: ' + this.meter + 'm');
    }

  }

  spawnBricks(numOfBricks = 2, XOffset = 100, YOffset = 0) {

    if (!this.canSpawnEnemies) return;
    let y = this.game.config.height - this.ground.displayHeight - this.player.displayHeight - 100 - YOffset;
    let x = this.player.x + this.game.config.width / 2 + 100 + XOffset;
    let platform = this.platforms.create(x, y, 'platform');
    platform.displayHeight = platform.displayWidth = this.brickSize;
    platform.refreshBody();
    while (numOfBricks - 1) {
      x = x + platform.displayWidth + 1;
      platform = this.platforms.create(x, y, 'platform');
      let coinProbability = Phaser.Math.Between(1, 10) % 3 === 0; // 33% chance
      let mushroomProbability = Phaser.Math.Between(1, 10) % 4 === 0; // 20% chance
      if (coinProbability) {
        platform.setTint(0xffff00);
        platform.coin = Phaser.Math.Between(1, 5)
      } else if (mushroomProbability) {
        platform.setTint(0x00ff00);
        platform.mushroom = 1;

      }
      platform.displayHeight = platform.displayWidth = this.brickSize;
      platform.refreshBody();
      numOfBricks--
    }
  }

  hitBrick(player, brick) {
    if (player.body.touching.up && brick.body.touching.down) {
      this.tweens.add({
        targets: brick,
        y: brick.y - 10,
        duration: 50,
        ease: 'Linear',
        yoyo: true
      })
      if (brick.mushroom) {
        delete brick.mushroom;
        brick.setTint(0xffffff);
        let powerUp = this.powerUps.create(brick.x, brick.y - 70, 'mushroom').setScale(0);
        this.tweens.add({
          targets: powerUp,
          scaleY: 0.15,
          scaleX: 0.15,
          duration: 100,
          ease: 'Power1',
          onComplete: () => {
            powerUp.setVelocityX(50);
          }
        })
      }
      if (brick.coin) {
        brick.coin--;
        this.updateScore(1);
        if (!brick.coin) {
          delete brick.mushroom;
          brick.setTint(0xffffff);
        }
        let powerUp = this.powerUps.create(brick.x, brick.y - brick.displayHeight, 'collectible').setScale(0);
        this.tweens.add({
          targets: powerUp,
          scaleY: 0.1,
          scaleX: 0.1,
          duration: 90,
          ease: 'Power1',
          yoyo: true,
          onComplete: (tween, targets) => {
            targets[0].destroy();
          },
        })
      }
    }
  }

  spawnEnemy() {

    if (!this.canSpawnEnemies) return;
    let x = this.player.x + this.game.config.width / 2;
    let y = 70;

    let enemy = this.enemies.create(x, y, 'enemy').setScale(.09);
    enemy.setVelocityX(-100);
    enemy.setGravityY(100);
    // enemy.setCollideWorldBounds(true);
    enemy.setBounceX(0.1);
  }

  collectPowerUp(player, powerUp) {
    powerUp.destroy();

    if (player.power_state === PLAYER_STATE.SMALL) {
      player.power_state++;
      this.tweens.add({
        targets: this.player,
        scaleY: player.scaleX + 0.05,
        scaleX: player.scaleY + 0.05,
        duration: 100,
        ease: 'Power1',
      })
    } else if (player.power_state === PLAYER_STATE.BIG) {
      player.power_state++;
      player.setTint(0xff00ff);
      this.input.keyboard.on('keydown-SPACE', this.shootBullet, this);
    } else {
      this.updateScore(10);
    }

  }

  shootBullet() {
    if (this.player.power_state === PLAYER_STATE.BULLETS) {
      let bullet = this.bullets.get(this.player.x, this.player.y);
      if (bullet) {
        bullet.setActive(true).setVisible(true).setScale(0.04).setVelocityX(this.player.leftShoot ? -300 : 300)
        this.time.delayedCall(5000, () => {
          if (bullet.active) {
            bullet.setActive(false).setVisible(false);
            bullet.body.stop();
          }
        });
      }
    }
  }

  bulletHit(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    enemy.destroy();
    this.updateScore(1);
  }

  onPlayerEnemyCollision(player, enemy) {
    if (player.body.touching.down && enemy.body.touching.up) {
      enemy._scaleY = 0.01;
      enemy.refreshBody();
      this.time.delayedCall(
        300, () => {
          enemy.destroy();
        }
      )
    } else {
      this.input.keyboard.off('keydown-SPACE', this.shootBullet, this);
      if (player.power_state === PLAYER_STATE.BULLETS) {
        player.power_state--;
        player.setTint(0xffffff);

        this.cameras.main.shake(50);
        enemy.destroy();
      } else if (player.power_state === PLAYER_STATE.BIG) {
        player.power_state--;
        this.tweens.add({
          targets: player,
          scaleY: player.scaleX - 0.03,
          scaleX: player.scaleY - 0.03,
          duration: 100,
          ease: 'Power1',
        })
        this.cameras.main.shake(100);
        enemy.destroy();
      } else {
        player.setTint(0xff0000);
        this.physics.pause();
        this.cameras.main.shake(200);
        this.time.delayedCall(500, () => {
          this.gameOver();
        });
      }
    }
  }

  createMobileButtons() {
    const joyStickRadius = 80;

    if (joystickEnabled) {
      this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: joyStickRadius * 1.5,
        y: this.height - (joyStickRadius * 1.6),
        radius: 80,
        base: this.add.circle(0, 0, 80, 0x888888, 0.5),
        thumb: this.add.circle(0, 0, 40, 0xcccccc, 0.5),
        // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
      });

      this.joystickKeys = this.joyStick.createCursorKeys();
    }

    if (buttonEnabled) {
      this.buttonA = this.add.rectangle(this.width - 60, this.height - 60, 100, 100, 0xcccccc, 0.5)
      this.buttonA.button = this.plugins.get('rexbuttonplugin').add(this.buttonA, {
        mode: 1,
        clickInterval: 10,
      });
      this.buttonA.setDepth(11).setScrollFactor(0);
      this.buttonB = this.add.circle(this.width - 60, this.height - 220, 60, 0xcccccc, 0.5)
      this.buttonB.button = this.plugins.get('rexbuttonplugin').add(this.buttonB, {
        mode: 1,
        clickInterval: 5,
      });
      this.buttonB.setDepth(11).setScrollFactor(0);
      this.buttonB.button.on('down', this.shootBullet, this);
    }
  }

  updateScore(points) {
    this.score += points;
    this.updateScoreText();
  }

  updateScoreText() {
    this.scoreText.setText(`Coins: ${this.score}`);
  }

  gameOver() {
    this.scene.start('GameOverScene', { score: this.score, meter: this.meter });
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
    loadBlurredBg(this)
  }

  create() {
    createBlurredBg(this);
    this.width = this.game.config.width;
    this.height = this.game.config.height;
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
    loadBlurredBg(this);
    gameOverScenePreload(this);

  }

  create(data) {
    createBlurredBg(this);
    this.width = this.game.config.width;
    this.height = this.game.config.height;
    // Add UI elements
    this.add.text(this.width / 2, 100, 'GAME OVER', { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
    this.add.text(this.width / 2, 200, `Meter: ${data.meter}m`, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);
    this.add.text(this.width / 2, 260, `Coins: ${data.score}`, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);

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
  /* ADD CUSTOM CONFIG ELEMENTS HERE */
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
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
}

//FUNCTION FOR THE GAME SCENE BACKGROUND
function gameSceneBackground(game) {
}

//CREATE FUNCTION FOR THE GAME SCENE
function gameSceneCreate(game) {
}

//UPDATE FUNCTION FOR THE GAME SCENE
function gameSceneUpdate(game, time, delta) {
}
