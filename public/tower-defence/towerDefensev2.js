const assets_list = {
    "background": "tower-defence/assets/bg.png",
    "player": "tower-defence/assets/smg.png",
    "enemy": "tower-defence/assets/enemy.png",
    "projectile": "tower-defence/assets/bullet.png",
    "collectible": "tower-defence/assets/tower.png",
  };
  
  const assetsLoader = {
    "background": "background",
    "collectible": "collectible",
    "player": "player",
    "projectile": "projectile",
    "enemy": "enemy",
  };
  
  // Custom UI Elements
  const gameTitle = `Defend the Tower`
  const gameDescription = `Shoot the enemies before they destroy
  the tower`
  const gameInstruction =
    `Instructions:
  1. Touch or click to shoot bullets.
  2. Game gets over when tower's heath gets to 0`;
  
  
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
  
  // Game Scene
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
    }
  
    preload() {
      this.score = 0;
  
      // Load In-Game Assets from assetsLoader
      for (const key in assetsLoader) {
        this.load.image(key, assets_list[assetsLoader[key]]);
      }
  
      gameScenePreload(this);
      displayProgressLoader.call(this);
    }
  
    create() {
  
      this.width = this.game.config.width;
      this.height = this.game.config.height;
      this.bg = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
      this.bg.setScrollFactor(0);
      this.bg.displayHeight = this.game.config.height;
      this.bg.displayWidth = this.game.config.width;
  
      // Add UI elements
      this.scoreText = this.add.text(20, 40, 'Score: 0', { fontSize: '20px', fill: globalPrimaryFontColor });
  
      // Add input listeners
      this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
      const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '16px', fill: globalSecondaryFontColor }).setOrigin(1, 0);
      pauseButton.setInteractive({ cursor: 'pointer' });
      pauseButton.on('pointerdown', () => this.pauseGame());  
  
      gameSceneCreate(this);
  
      // this.player = this.add.sprite(300, 200, 'player').setScale(0.2);
    }
  
    update() {
      gameSceneUpdate(this);
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
    this.load.on('fileprogress', function(file) {
      console.log(file.src);
    });
    this.load.on('complete', function() {
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
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
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
  
  //CREATE FUNCTION FOR THE GAME SCENE
  function gameSceneCreate(game) {
    game.scoreText.setDepth(1); // Bring to the front
    game.healthText = game.add.text(20, 10, 'Tower Health : ', { fontSize: '20px', fill: globalPrimaryFontColor });
    game.healthText.setDepth(1); // Bring to the front
  
  
    const centerX = game.game.config.width / 2;
    const centerY = game.game.config.height / 2;
  
    game.tower = game.physics.add.image(100, centerY, 'collectible').setScale(0.26);
    game.tower.health = 100;
    game.tower.setImmovable(true).setCollideWorldBounds(true);
    game.tower.body.setSize(
      game.tower.body.width / 1.5,
      game.tower.body.height / 1.5
    );
  
    game.player = game.physics.add.image(250, centerY, 'player').setScale(0.13);
    game.player.flipX = true;
    game.player.setCollideWorldBounds(true);
  
    game.bullets = game.physics.add.group({
      defaultKey: 'projectile',
      active: false,
      maxSize: 15
    });
    // Enemies
    game.enemies = game.physics.add.group();
  
    game.input.on('pointerdown', fireBullet.bind(game), this);
  
    game.spawnEnemyEvent = game.time.addEvent({
      delay: 800,
      callback: spawnEnemy,
      callbackScope: game,
      loop: true
    });
  
  
    // game.cursors = game.input.keyboard.createCursorKeys();
  
    game.physics.add.collider(game.tower, game.enemies, function(tower, enemy) {
      updateTowerHealth.bind(game)(tower, enemy);
    });
  
    game.physics.add.collider(game.bullets, game.enemies, function(bullet, enemy) {
      game.tweens.add({
        targets: enemy,
        scale: 0,
        duration: 100,
        ease: 'Power2',
        onComplete: (tween, targets) => {
          targets[0].destroy();
        }
      });
      bullet.destroy(); // Destroy the bullet
      // enemy.destroy(); // Destroy the enemy
      game.updateScore(10);
    });
    makeHealthMeter.call(game);
  }
  
  //UPDATE FUNCTION FOR THE GAME SCENE
  function gameSceneUpdate(game) {
    let angle = Phaser.Math.Angle.Between(game.player.x, game.player.y, game.input.x, game.input.y);
    //rotation cannon
    game.player.setRotation(angle);
  }
  
  function updateTowerHealth(tower, enemy) {
    enemy.destroy();
  
    this.cameras.main.shake(150, 0.02);
    this.tower.health -= 10; // 10 is 10% of health
    if (this.tower.health <= 0) {
      this.gameOver();
    }
    if (this.tower.health <= 30) {
      this.healthMeter.fillColor = 0xff0000;
    }
    this.healthMeterText.text = this.tower.health;
    this.healthMeter.width = this.healthMeter.width - 15; // 15 is 10% of width ( = 150) as 10% of health is getting decreased on every hit
  }
  
  function makeHealthMeter(x = 200, y = 10, width = 150, height = 25) {
    // Create the power meter background (empty part)
    this.healthMeterBg = this.add.rectangle(x, y, width, height, 0x888888).setOrigin(0);
    this.healthMeter = this.add.rectangle(x, y, width, height, 0x00ff00).setOrigin(0);
    this.healthMeterText = this.add.text(x + 10, y + 6, this.tower.health, { fontSize: "16px", color: "black" }).setOrigin(0);
  }
  
  
  // Function to spawn and adjust enemy speed based on the level
  function spawnEnemy() {
    let spawnX = Math.random() * this.game.config.width;
    if (spawnX < 500) {
      spawnX = 600
    }
    let spawnY = Math.random() * this.game.config.height;
    var enemy = this.enemies.create(spawnX, spawnY, 'enemy').setScale(.11);
    enemy.body.setSize(
      enemy.body.width / 1.3,
      enemy.body.height / 1.3
    );
    this.physics.moveTo(enemy, this.tower.x, this.tower.y, 300);
  }
  
  function fireBullet(pointer) {
    let bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setScale(0.03);
      bullet.body.setSize(
        bullet.body.width / 1.5,
        bullet.body.height / 1.5
      );
      bullet.setActive(true);
      bullet.setVisible(true);
      this.physics.moveTo(bullet, pointer.x, pointer.y, 900);
      this.time.delayedCall(1500, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      });
    }
  }
  