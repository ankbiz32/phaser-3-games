const assets_list = {
  "background": "assets/starry.jpg",
  "player": "assets/silver.png",
  "enemy": "assets/enemy.png",
  "collectible": "assets/collectible.png",
};

const assetsLoader = {
  "background": "background",
  "player": "player",
  "enemy": "enemy",
  "collectible": "collectible",
};

// Custom UI Elements
const gameTitle = `SILVER SURFER`
const gameDescription = `Silver surfer is hovering in space. Avoid not to collide
with planets. He has limited fuel, so keep collecting the fuel.`
const gameInstruction =
  `Instructions:
  1. Touch and hold to hover.
  2. Tilt device to landscape for best experience.`;

// Custom Font Colors
const globalPrimaryFontColor = "#FFF";
const globalSecondaryFontColor = "#0F0"

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

    const startButton = this.add.text(this.width / 2, this.height / 2, 'Start', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
    startButton.setInteractive({ cursor: 'pointer' });
    startButton.on('pointerdown', () => this.scene.start('GameScene'));
  }
}

// Game Scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    gameScenePreload(this);
    displayProgressLoader.call(this);
  }

  create() {
    this.score = 0;

    this.width = this.game.config.width;
    this.height = this.game.config.height;
    gameSceneBackground(this);

    // Add UI elements
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: globalPrimaryFontColor });

    // Add input listeners
    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '16px', fill: globalSecondaryFontColor }).setOrigin(1, 0);
    pauseButton.setInteractive({ cursor: 'pointer' });
    pauseButton.on('pointerdown', () => this.pauseGame());

    gameSceneCreate(this);
  }

  update(time, delta) {
    gameSceneUpdate(this, time, delta);
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
      gravity: { y: 100 },
      debug: false,
    },
  },
};

// Game instance
const game = new Phaser.Game(config);
globalThis.__PHASER_GAME__ = game;

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

let INIT_PLAYER_SPEED,
  PLAYER_SPEED = INIT_PLAYER_SPEED,
  INIT_ENEMY_SPEED,
  LEVEL_SCORE_THRESHOLD, // Difficulty level increases after every 50 score
  ENEMY_SPEED_INCREMENTER,
  SCORE_UPDATE_TIMER, // in millisec, score increases every 500ms
  timer,
  ENEMY_SPEED = INIT_ENEMY_SPEED,
  DIFFICULTY_LEVEL,
  BG_SCROLL_INIT,
  SPAWNER_LEVEL,
  SPAWN_TIMER, // in millisec
  SPAWN_DELAY_PERCENT_THRESHOLD, // decrement 
  SPAWN_DIFFICULTY_THRESHOLD, // Every 5 difficulty level, spawner level will increase
  POWER_UP_TIMER

// GAME SCENE PHASER FUNCTIONS
function gameScenePreload(game) {
  // Load In-Game Assets from assetsLoader
  for (const key in assetsLoader) {
    game.load.image(key, assets_list[assetsLoader[key]]);
  }
}

//FUNCTION FOR THE GAME SCENE BACKGROUND
function gameSceneBackground(game) {
  game.bg = game.add
    .tileSprite(0, 0, game.game.config.width, game.game.config.height, "background")
    .setOrigin(0, 0)
    .setScrollFactor(1);

}

//CREATE FUNCTION FOR THE GAME SCENE
function gameSceneCreate(game) {
  game.pointerTouched = false;
  setVariables();
  createTimer(game);
  game.levelText = game.add.text(10, 35, 'Level: 1', { fontSize: '20px', fill: globalPrimaryFontColor });

  game.enemies = game.physics.add.group();
  game.collectibles = game.physics.add.group();

  game.player = game.physics.add.image(50, 150, "player").setOrigin(0, 0);
  game.player.setScale(0.3);
  game.player.setImmovable(true);
  game.player.body.setSize(game.player.body.width / 1.5, game.player.body.height / 1.5);

  game.physics.add.collider(game.player, game.enemies, targetHit, null, game)
  game.physics.add.collider(game.player, game.collectibles, collectPowerUp, null, game)
  game.cursor = game.input.keyboard.createCursorKeys();

  game.emitter = game.add.particles(game.player.displayWidth / 2, game.player.displayHeight , 'enemy', {
    speed: 80,
    lifespan: 500,
    alpha: {
      onEmit: (particle, key, t, value) => Phaser.Math.Percent(game.player.body.speed, 0, 300) * 1000
    },
    scale: { start: 0.03, end: 0 },
    blendMode: 'ADD',
  });
  game.emitter.startFollow(game.player);

  // Set up game timer
  game.timerEvent = game.time.addEvent({
    delay: 1000,
    callback: onSecondElapsed,
    callbackScope: game,
    loop: true
  });

  game.enemyTimer = game.time.addEvent({
    delay: SPAWNER_LEVEL * SPAWN_TIMER,
    callback: spawnEnemy,
    callbackScope: game,
    loop: true
  });

  game.collectibleTimer = game.time.addEvent({
    delay: POWER_UP_TIMER,
    callback: spawnCollectible,
    callbackScope: game,
    loop: true
  });

  game.input.on('pointerdown', () => {
    game.pointerTouched = true;
    game.emitter.start();
  }, this);
  
  game.input.on('pointerup', () => {
    game.pointerTouched = false;
    game.emitter.stop();
  }, this);
}

//UPDATE FUNCTION FOR THE GAME SCENE
function gameSceneUpdate(game, time, delta) {
  if (game.player.y > game.game.config.height || game.player.y < 0 - game.player.displayHeight) {
    targetHit.bind(game)(game.player);
  }

  game.bg.tilePositionX += BG_SCROLL_INIT;
  timer += delta;
  while (timer > SCORE_UPDATE_TIMER) {
    game.updateScore(10);
    timer -= SCORE_UPDATE_TIMER;
    DIFFICULTY_LEVEL = Math.floor(game.score / LEVEL_SCORE_THRESHOLD);
    updateLevelText(game)
    if (DIFFICULTY_LEVEL) {
      ENEMY_SPEED = INIT_ENEMY_SPEED + DIFFICULTY_LEVEL * ENEMY_SPEED_INCREMENTER;
    }
    if (DIFFICULTY_LEVEL > SPAWN_DIFFICULTY_THRESHOLD) {
      SPAWN_DIFFICULTY_THRESHOLD += 10;
      SPAWNER_LEVEL++;
      newEnemyTimer(game, SPAWNER_LEVEL);
    }
  }
  if (game.pointerTouched) {
    PLAYER_SPEED -= 4;
    if (PLAYER_SPEED > INIT_PLAYER_SPEED) PLAYER_SPEED -= 8;
    game.player.setVelocityY(PLAYER_SPEED);
  } else {
    PLAYER_SPEED += 10;
    if (PLAYER_SPEED < INIT_PLAYER_SPEED) PLAYER_SPEED += 20;
    game.player.setVelocityY(PLAYER_SPEED);
  }
}

function createTimer(game) {
  game.gameInitTimer = game.gameTimer = 40; // 40 seconds
  game.timerBar = null;
  game.timerEvent = null;

  game.timerText = game.add.text(10, 60, 'Fuel: ' + game.gameTimer, { fontSize: '20px', fill: '#FFF' });

  // Create timer bar
  game.timerBar = game.add.graphics();
  game.timerBar.fillStyle(0x00ff00, 1);
  game.timerBar.fillRect(10, 90, 100, 20);
}

function onSecondElapsed() {
  this.gameTimer--;
  updateTimer(this);
  if (this.gameTimer <= 0) {
    this.timerEvent.remove();
    targetHit.bind(this)(this.player);
  }
}


function manipulateTime(game, seconds) {
  game.gameTimer += seconds;
  updateTimer(game);
}

function updateTimer(game) {
  game.timerText.setText('Fuel: ' + game.gameTimer);
  updateTimerBar(game);
}

function updateTimerBar(game) {
  game.timerBar.clear();
  if (game.gameTimer <= 5) {
    game.timerBar.fillStyle(0xff0000, 1);
  } else {
    game.timerBar.fillStyle(0x00ff00, 1);
  }
  let newWidth = 100 * (game.gameTimer / game.gameInitTimer);
  if (newWidth > 100) {
    newWidth = 100;
  }
  game.timerBar.fillRect(10, 90, newWidth, 20);
}

function newEnemyTimer(game) {
  let newTimer = SPAWN_TIMER - ((SPAWNER_LEVEL / SPAWN_DELAY_PERCENT_THRESHOLD) * SPAWN_TIMER);
  if (newTimer) {
    game.enemyTimer.remove();
    game.enemyTimer = game.time.addEvent({
      delay: SPAWN_TIMER - ((SPAWNER_LEVEL / 10) * SPAWN_TIMER),
      callback: spawnEnemy,
      callbackScope: game,
      loop: true
    });
  } else {
    SPAWN_DELAY_PERCENT_THRESHOLD = 10;
  }

}

function spawnCollectible() {
  const y = Phaser.Math.Between(5, this.game.config.height * 0.98);
  const x = this.game.config.width + 50;
  const collectble = this.collectibles.create(x, y, "collectible");
  collectble.body.allowGravity = false;
  collectble.body.setSize(collectble.body.width / 1.5, collectble.body.height / 1.5);
  collectble.setVelocity(ENEMY_SPEED, 0);
  collectble.setScale(0.2).setOrigin(0, 0).refreshBody();
}

function spawnEnemy() {
  const y = Phaser.Math.Between(5, this.game.config.height * 0.98);
  const x = this.game.config.width + 50;
  const enemy = this.enemies.create(x, y, "enemy");
  enemy.body.allowGravity = false;
  enemy.body.setSize(enemy.body.width / 1.5, enemy.body.height / 1.5);
  enemy.setVelocity(ENEMY_SPEED, 0);
  enemy.setScale(0.25).setOrigin(0, 0).refreshBody();
}

function collectPowerUp(player, collectible) {
  collectible.destroy();
  manipulateTime(this, 5);
}

function targetHit(player, enemy) {
  setVariables();
  this.physics.pause();
  player.setTint(0xff0000);
  this.cameras.main.shake(200);
  this.time.delayedCall(600, () => {
    this.gameOver();
  })
}

function setVariables(player, enemy) {
  game.score = 0;
  INIT_PLAYER_SPEED = -200;
  PLAYER_SPEED = INIT_PLAYER_SPEED;
  INIT_ENEMY_SPEED = -200;
  LEVEL_SCORE_THRESHOLD = 100; // Difficulty level increases after every 50 score
  ENEMY_SPEED_INCREMENTER = -100;
  SCORE_UPDATE_TIMER = 1000; // in millisec, score increases every 500ms
  timer = 0;
  ENEMY_SPEED = INIT_ENEMY_SPEED;
  DIFFICULTY_LEVEL = 0;
  BG_SCROLL_INIT = 0.9;

  SPAWNER_LEVEL = 1;
  SPAWN_TIMER = 1300; // in millisec
  SPAWN_DELAY_PERCENT_THRESHOLD = 10; // decrement 
  SPAWN_DIFFICULTY_THRESHOLD = 3; // Every 5 difficulty level, spawner level will increase
  POWER_UP_TIMER = 4000;

}

function updateLevelText(game) {
  game.levelText.text = 'Level: ' + (DIFFICULTY_LEVEL + 1);

}