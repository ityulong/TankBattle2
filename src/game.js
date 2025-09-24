import {
  DIRECTIONS,
  ENEMY_SPAWN_LIMIT,
  ENEMY_SPAWN_POSITIONS,
  FRAME_MAX_DELTA,
  GAME_STATES,
  PLAYER_INITIAL_LIVES,
  PLAYER_SPAWN,
  POWERUP_DURATION,
  POWERUP_SEQUENCE,
  THEMES,
  getBattleThemeName,
} from './constants.js';
import { Input } from './input.js';
import { AudioManager } from './audio.js';
import { Renderer } from './renderer.js';
import { GameMap } from './map.js';
import { PlayerTank, EnemyTank } from './entities/tank.js';
import { Bullet } from './entities/bullet.js';
import { Explosion } from './entities/explosion.js';
import { PowerUp } from './entities/powerup.js';
import { getStageData } from './stage-data.js';
import { formatScore, formatStage, padNumber, randomInt, rectsOverlap } from './utils.js';

const PLAYER_KEYS = ['up', 'down', 'left', 'right'];
const STAGE_INTRO_DURATION = 2.5;

export class Game {
  constructor({ canvas, overlay, overlayTitle, overlayBody, hud, muteButton, volumeSlider }) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.overlayTitle = overlayTitle;
    this.overlayBody = overlayBody;
    this.hud = hud;
    this.muteButton = muteButton;
    this.volumeSlider = volumeSlider;

    this.input = new Input();
    this.audio = new AudioManager();
    this.renderer = new Renderer(canvas);

    this.state = GAME_STATES.MENU;
    this.lastTime = 0;
    this.running = false;

    this.player = new PlayerTank({ x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y });
    this.player.setLives(PLAYER_INITIAL_LIVES);

    this.enemies = [];
    this.bullets = [];
    this.explosions = [];
    this.powerups = [];

    this.enemyQueue = [];
    this.enemySpawnTimer = 0;
    this.enemySpawnPointIndex = 0;

    this.enemyFreezeTimer = 0;
    this.stageIndex = 0;
    this.stageCounter = 0;
    this.map = null;
    this.currentStageData = null;

    this.highScore = 0;

    this.killStats = { basic: 0, fast: 0, power: 0, armor: 0 };
    this.totalKills = 0;
    this.powerupIndex = 0;
    this.powerupBag = shuffleSequence();

    this.stateTimer = 0;
    this.pendingGameOverReturn = 0;
    this.stageIntroCountdownEl = null;

    this.setupUI();
  }

  setupUI() {
    this.muteButton.addEventListener('click', () => {
      const enabled = this.audio.toggleEnabled();
      this.updateMuteLabel(enabled);
      if (enabled) {
        this.audio.unlock();
      } else {
        this.audio.stopTheme();
      }
    });
    this.volumeSlider.addEventListener('input', (event) => {
      const value = Number.parseFloat(event.target.value);
      this.audio.setVolume(value);
    });
    this.overlay.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'start') {
        this.startNewGame();
      } else if (action === 'resume') {
        this.resumeGame();
      } else if (action === 'restart') {
        this.startNewGame();
      } else if (action === 'next-stage') {
        this.loadNextStage();
      }
    });
  }

  init() {
    this.input.attach();
    this.audio.prepare();
    this.audio.playTheme(THEMES.intro, { delay: 0 });
    this.updateMuteLabel(this.audio.enabled);
    this.updateHud();
    this.showMenu();
    this.input.once('fire', () => this.audio.unlock());
    this.canvas.addEventListener('click', () => this.audio.unlock(), { once: true });
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    const loop = (timestamp) => {
      if (!this.running) return;
      const delta = Math.min(FRAME_MAX_DELTA, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;
      this.update(delta);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  handleVisibilityLoss() {
    if (this.state === GAME_STATES.PLAYING) {
      this.pauseGame();
    }
  }

  update(delta) {
    this.stateTimer += delta;
    switch (this.state) {
      case GAME_STATES.MENU:
        break;
      case GAME_STATES.STAGE_INTRO:
        this.updateStageIntroCountdown(STAGE_INTRO_DURATION - this.stateTimer);
        if (this.stateTimer > STAGE_INTRO_DURATION) {
          this.beginStage();
        }
        break;
      case GAME_STATES.PLAYING:
        this.updatePlaying(delta);
        break;
      case GAME_STATES.PAUSED:
        break;
      case GAME_STATES.STAGE_CLEAR:
        break;
      case GAME_STATES.TALLY:
        break;
      case GAME_STATES.GAME_OVER:
        if (this.stateTimer > 5 && this.pendingGameOverReturn === 0) {
          this.pendingGameOverReturn = 1;
          this.showMenu();
        }
        break;
      default:
        break;
    }
    this.render();
  }

  render() {
    if (!this.map) return;
    this.renderer.render({
      map: this.map,
      player: this.player,
      enemies: this.enemies,
      bullets: this.bullets,
      explosions: this.explosions,
      powerups: this.powerups,
    });
  }

  showOverlay(title, html, actions = []) {
    this.overlayTitle.textContent = title;
    this.overlayBody.innerHTML = html;
    if (actions.length > 0) {
      const buttons = actions
        .map((action) => `<button type="button" data-action="${action.action}">${action.label}</button>`)
        .join('');
      this.overlayBody.insertAdjacentHTML('beforeend', `<div class="panel-actions">${buttons}</div>`);
    }
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('visible');
    this.stageIntroCountdownEl = this.overlayBody.querySelector('[data-countdown]');
  }

  hideOverlay() {
    this.overlay.classList.remove('visible');
    this.overlay.classList.add('hidden');
    this.overlayBody.innerHTML = '';
    this.stageIntroCountdownEl = null;
  }

  showMenu() {
    this.state = GAME_STATES.MENU;
    this.stateTimer = 0;
    this.audio.playTheme(THEMES.intro, { delay: 0 });
    this.showOverlay(
      '像素坦克大战',
      `<p>按下空格或点击开始游戏</p><p>音量：${Math.round(this.audio.volume * 100)}%</p>`,
      [
        { label: '开始游戏', action: 'start' },
      ],
    );
    this.input.once('fire', () => this.startNewGame());
  }

  startNewGame() {
    this.audio.unlock();
    this.hideOverlay();
    this.player.resetLevel();
    this.player.setLives(PLAYER_INITIAL_LIVES);
    this.player.score = 0;
    this.stageIndex = 0;
    this.stageCounter = 0;
    this.pendingGameOverReturn = 0;
    this.updateHud();
    this.loadStage(this.stageIndex);
  }

  loadStage(index) {
    const data = getStageData(index);
    this.currentStageData = data;
    this.map = new GameMap(data.layout);
    this.enemies = [];
    this.bullets = [];
    this.explosions = [];
    this.powerups = [];
    this.enemyQueue = [...data.enemies];
    this.enemySpawnTimer = 1.2;
    this.enemySpawnPointIndex = 0;
    this.enemyFreezeTimer = 0;
    this.killStats = { basic: 0, fast: 0, power: 0, armor: 0 };
    this.totalKills = 0;
    this.powerupIndex = 0;
    this.powerupBag = shuffleSequence();
    this.player.reset({ x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y });
    this.player.setDirection(DIRECTIONS.UP);
    this.state = GAME_STATES.STAGE_INTRO;
    this.stateTimer = 0;
    const countdown = STAGE_INTRO_DURATION.toFixed(1);
    this.showOverlay(
      `STAGE ${formatStage(index + 1)}`,
      `<p>战斗即将开始</p><p><span data-countdown>${countdown}</span> 秒</p>`,
    );
    this.audio.playTheme(THEMES.interlude, { delay: 0 });
    this.updateStageIntroCountdown(STAGE_INTRO_DURATION);
    this.updateHud();
  }

  beginStage() {
    this.hideOverlay();
    this.state = GAME_STATES.PLAYING;
    this.stateTimer = 0;
    const world = this.currentStageData ? this.currentStageData.world : 0;
    const battleTheme = getBattleThemeName(world);
    this.audio.playTheme(battleTheme, { delay: 2 });
  }

  resumeGame() {
    if (this.state !== GAME_STATES.PAUSED) return;
    this.hideOverlay();
    this.state = GAME_STATES.PLAYING;
    this.audio.playSfx('pause');
  }

  pauseGame() {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.state = GAME_STATES.PAUSED;
    this.stateTimer = 0;
    this.showOverlay('PAUSE', '<p>按空格或按钮继续</p>', [{ label: '继续', action: 'resume' }]);
    this.audio.playSfx('pause');
    this.input.once('fire', () => this.resumeGame());
    this.input.once('pause', () => this.resumeGame());
    this.input.once('start', () => this.resumeGame());
  }

  updatePlaying(delta) {
    if (!this.map) return;
    this.handlePlayerInput(delta);
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateExplosions(delta);
    this.updatePowerups(delta);
    this.map.update(delta);
    if (this.enemyFreezeTimer > 0) {
      this.enemyFreezeTimer -= delta;
      if (this.enemyFreezeTimer < 0) this.enemyFreezeTimer = 0;
    }
    this.spawnEnemies(delta);
    this.checkStageClear();
    if (this.map.baseDestroyed) {
      this.triggerGameOver();
    }
  }

  handlePlayerInput(delta) {
    if (!this.player.alive) return;
    let direction = null;
    for (const key of PLAYER_KEYS) {
      if (this.input.isDown(key)) {
        direction = key;
        break;
      }
    }
    if (direction) {
      const dir = mapKeyToDirection(direction);
      this.player.setDirection(dir);
      const speed = this.player.getSpeed() * delta;
      const vector = directionToVector(dir);
      this.player.move(this.map, vector.x * speed, vector.y * speed, [...this.enemies]);
    }
    if (this.input.consume('fire')) {
      this.playerFire();
    }
    if (this.input.consume('pause') || this.input.consume('start')) {
      this.pauseGame();
    }
    if (this.input.consume('mute')) {
      const enabled = this.audio.toggleEnabled();
      this.updateMuteLabel(enabled);
    }
  }

  playerFire() {
    if (!this.player.canFire(this.player.getFireLimit())) return;
    const bullet = this.createBullet(this.player);
    if (!bullet) return;
    this.bullets.push(bullet);
    this.player.onBulletFired(this.player.getCooldown());
    this.audio.playSfx('shoot');
  }

  createBullet(tank) {
    const origin = getBulletOrigin(tank);
    if (!origin) return null;
    const speed = tank.getBulletSpeed();
    const power = tank.getBulletPower ? tank.getBulletPower() : tank.bulletPower || 1;
    return new Bullet({
      x: origin.x,
      y: origin.y,
      direction: tank.direction,
      speed,
      power,
      owner: tank,
      fromPlayer: tank === this.player,
    });
  }

  updateEnemies(delta) {
    const others = [this.player, ...this.enemies];
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.update(delta);
      if (this.enemyFreezeTimer > 0) continue;
      if (this.player.alive && Math.random() < 0.02 + this.getDifficulty() * 0.05) {
        enemy.tryTarget(this.player);
      }
      enemy.updateAI(delta, this.map, this.player, others);
      if (enemy.wantToFire(this.player) && enemy.canFire(enemy.doubleShot ? 2 : 1)) {
        const bullet = this.createBullet(enemy);
        if (bullet) {
          this.bullets.push(bullet);
          enemy.onBulletFired(enemy.getCooldown());
        }
      }
    }
  }

  spawnEnemies(delta) {
    if (this.enemyQueue.length === 0) return;
    const aliveEnemies = this.enemies.filter((e) => e.alive).length;
    if (aliveEnemies >= ENEMY_SPAWN_LIMIT) return;
    this.enemySpawnTimer -= delta;
    if (this.enemySpawnTimer > 0) return;
    const template = this.enemyQueue.shift();
    const spawnPoint = ENEMY_SPAWN_POSITIONS[this.enemySpawnPointIndex % ENEMY_SPAWN_POSITIONS.length];
    this.enemySpawnPointIndex += 1;
    const position = {
      x: spawnPoint.x,
      y: spawnPoint.y,
    };
    const enemy = new EnemyTank({ x: position.x, y: position.y, template, difficulty: this.getDifficulty() });
    enemy.setDirection(DIRECTIONS.DOWN);
    if (!this.isOccupied(enemy.rect)) {
      this.enemies.push(enemy);
      if (this.enemyFreezeTimer > 0) {
        enemy.giveFreeze(this.enemyFreezeTimer);
      }
      this.enemySpawnTimer = 2.5;
    } else {
      this.enemyQueue.unshift(template);
      this.enemySpawnTimer = 1;
    }
  }

  getDifficulty() {
    return Math.min(1, 0.2 + this.stageCounter * 0.04);
  }

  isOccupied(rect) {
    if (!this.map.canMove(rect)) return true;
    for (const tank of [this.player, ...this.enemies]) {
      if (!tank.alive) continue;
      if (rectsOverlap(rect, tank.rect)) return true;
    }
    return false;
  }

  updateBullets(delta) {
    const toRemove = new Set();
    for (const bullet of this.bullets) {
      if (!bullet.alive) continue;
      bullet.update(delta);
      if (!bullet.alive) {
        this.finishBullet(bullet, toRemove);
        continue;
      }
      const collision = this.map.checkBulletCollision(bullet.rect, bullet.power);
      if (collision.hit) {
        this.createExplosion(bullet.rect.left + bullet.width / 2, bullet.rect.top + bullet.height / 2);
        this.finishBullet(bullet, toRemove);
        if (collision.base) {
          this.map.setBaseDestroyed();
        }
        continue;
      }
      if (bullet.fromPlayer) {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          if (rectsOverlap(bullet.rect, enemy.rect)) {
            const hit = enemy.hit(bullet.power);
            this.finishBullet(bullet, toRemove);
            if (hit) {
              this.handleEnemyDestroyed(enemy);
            }
            this.createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
            break;
          }
        }
      } else {
        if (this.player.alive && rectsOverlap(bullet.rect, this.player.rect)) {
          const destroyed = this.player.hit(bullet.power);
          if (destroyed) {
            this.handlePlayerDestroyed();
          }
          this.finishBullet(bullet, toRemove);
          this.createExplosion(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2);
        }
      }
    }
    this.resolveBulletClashes(toRemove);
    this.bullets = this.bullets.filter((b) => !toRemove.has(b) && b.alive);
  }

  resolveBulletClashes(toRemove) {
    for (let i = 0; i < this.bullets.length; i += 1) {
      const a = this.bullets[i];
      if (!a.alive || toRemove.has(a)) continue;
      for (let j = i + 1; j < this.bullets.length; j += 1) {
        const b = this.bullets[j];
        if (!b.alive || toRemove.has(b)) continue;
        if (a.fromPlayer === b.fromPlayer) continue;
        if (rectsOverlap(a.rect, b.rect)) {
          this.finishBullet(a, toRemove);
          this.finishBullet(b, toRemove);
          this.createExplosion((a.rect.left + b.rect.left) / 2 + 2, (a.rect.top + b.rect.top) / 2 + 2, 10);
        }
      }
    }
  }

  finishBullet(bullet, toRemove) {
    if (!bullet.alive) {
      if (!toRemove.has(bullet) && bullet.owner && typeof bullet.owner.onBulletDestroyed === 'function') {
        bullet.owner.onBulletDestroyed();
      }
      toRemove.add(bullet);
      return;
    }
    bullet.alive = false;
    if (bullet.owner && typeof bullet.owner.onBulletDestroyed === 'function') {
      bullet.owner.onBulletDestroyed();
    }
    toRemove.add(bullet);
  }

  createExplosion(x, y, radius = 16) {
    this.explosions.push(new Explosion(x, y, radius));
    this.audio.playSfx('explode');
  }

  updateExplosions(delta) {
    this.explosions.forEach((explosion) => explosion.update(delta));
    this.explosions = this.explosions.filter((explosion) => explosion.alive);
  }

  updatePowerups(delta) {
    this.powerups.forEach((power) => power.update(delta));
    this.powerups = this.powerups.filter((power) => power.alive);
    if (this.player.alive) {
      for (const power of this.powerups) {
        if (power.alive && rectsOverlap(power.rect, this.player.rect)) {
          power.alive = false;
          this.applyPowerup(power.type);
          this.audio.playSfx('pickup');
        }
      }
    }
  }

  applyPowerup(type) {
    switch (type) {
      case 'helmet':
        this.player.giveShield(POWERUP_DURATION.helmet);
        break;
      case 'clock':
        this.enemyFreezeTimer = Math.max(this.enemyFreezeTimer, POWERUP_DURATION.clock);
        for (const enemy of this.enemies) {
          enemy.giveFreeze(POWERUP_DURATION.clock);
        }
        break;
      case 'shovel':
        this.map.fortifyBase(POWERUP_DURATION.shovel);
        break;
      case 'star':
        this.player.upgradeLevel(1);
        break;
      case 'grenade':
        this.clearEnemies();
        break;
      case 'tank':
        this.player.addLife();
        break;
      case 'gun':
        this.player.upgradeLevel(3);
        break;
      default:
        break;
    }
    this.updateHud();
  }

  clearEnemies() {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      this.handleEnemyDestroyed(enemy);
      this.createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, 20);
    }
  }

  handleEnemyDestroyed(enemy) {
    enemy.alive = false;
    this.player.addScore(enemy.score);
    this.highScore = Math.max(this.highScore, this.player.score);
    this.totalKills += 1;
    this.killStats[enemy.template.id] += 1;
    this.updateHud();
    this.dropPowerupIfNeeded();
  }

  dropPowerupIfNeeded() {
    if (this.totalKills === 0) return;
    if (this.totalKills % 4 !== 0) return;
    const type = this.nextPowerupType();
    const position = this.findPowerupPosition();
    if (position) {
      this.powerups.push(new PowerUp({ x: position.x, y: position.y, type }));
    }
  }

  nextPowerupType() {
    if (this.powerupIndex >= this.powerupBag.length) {
      this.powerupBag = shuffleSequence();
      this.powerupIndex = 0;
    }
    const type = this.powerupBag[this.powerupIndex];
    this.powerupIndex += 1;
    return type;
  }

  findPowerupPosition() {
    if (!this.map) return null;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const tileX = randomInt(1, 24);
      const tileY = randomInt(1, 22);
      const rect = {
        left: tileX * 16,
        top: tileY * 16,
        right: tileX * 16 + 16,
        bottom: tileY * 16 + 16,
      };
      if (!this.map.canMove(rect)) continue;
      let occupied = false;
      for (const tank of [this.player, ...this.enemies]) {
        if (!tank.alive) continue;
        if (rectsOverlap(rect, tank.rect)) {
          occupied = true;
          break;
        }
      }
      if (!occupied) {
        return { x: rect.left, y: rect.top };
      }
    }
    return null;
  }

  updateHud() {
    if (!this.hud) return;
    this.hud.score.textContent = formatScore(this.player.score);
    this.hud.hiScore.textContent = formatScore(this.highScore);
    this.hud.stage.textContent = formatStage(this.stageIndex + 1);
    this.hud.lives.textContent = padNumber(this.player.lives, 2);
  }

  updateStageIntroCountdown(remaining) {
    if (!this.stageIntroCountdownEl) return;
    const value = Math.max(0, remaining);
    this.stageIntroCountdownEl.textContent = value.toFixed(1);
  }

  checkStageClear() {
    const aliveEnemies = this.enemies.filter((enemy) => enemy.alive).length;
    if (aliveEnemies === 0 && this.enemyQueue.length === 0) {
      this.state = GAME_STATES.TALLY;
      this.stateTimer = 0;
      const summary = `
        <p>敌军清零！</p>
        <ul class="tally">
          <li>普通型 × ${padNumber(this.killStats.basic, 2)}</li>
          <li>快速型 × ${padNumber(this.killStats.fast, 2)}</li>
          <li>火力型 × ${padNumber(this.killStats.power, 2)}</li>
          <li>重装型 × ${padNumber(this.killStats.armor, 2)}</li>
        </ul>`;
      this.showOverlay('STAGE CLEAR', summary, [{ label: '下一关', action: 'next-stage' }]);
      this.audio.playTheme(THEMES.interlude, { delay: 0 });
      this.input.once('fire', () => this.loadNextStage());
    }
  }

  loadNextStage() {
    if (this.state !== GAME_STATES.TALLY) return;
    this.hideOverlay();
    this.stageCounter += 1;
    this.stageIndex = (this.stageIndex + 1) % 35;
    this.loadStage(this.stageIndex);
  }

  handlePlayerDestroyed() {
    this.player.alive = false;
    if (this.player.lives > 0) {
      this.player.loseLife();
      this.updateHud();
      this.respawnPlayer();
    } else {
      this.triggerGameOver();
    }
  }

  respawnPlayer() {
    this.player.reset({ x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y });
    this.player.setDirection(DIRECTIONS.UP);
  }

  triggerGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.stateTimer = 0;
    const body = `<p>得分：${formatScore(this.player.score)}</p><p>最高：${formatScore(this.highScore)}</p>`;
    this.showOverlay('GAME OVER', body, [{ label: '重新开始', action: 'restart' }]);
    this.audio.playTheme(THEMES.gameover, { delay: 0 });
    this.input.once('fire', () => this.startNewGame());
  }

  updateMuteLabel(enabled) {
    this.muteButton.textContent = enabled ? '🔊 音频开启' : '🔇 已静音';
  }
}

function shuffleSequence() {
  const items = [...POWERUP_SEQUENCE];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function mapKeyToDirection(key) {
  switch (key) {
    case 'up':
      return DIRECTIONS.UP;
    case 'down':
      return DIRECTIONS.DOWN;
    case 'left':
      return DIRECTIONS.LEFT;
    case 'right':
      return DIRECTIONS.RIGHT;
    default:
      return DIRECTIONS.UP;
  }
}

function directionToVector(direction) {
  switch (direction) {
    case DIRECTIONS.UP:
      return { x: 0, y: -1 };
    case DIRECTIONS.RIGHT:
      return { x: 1, y: 0 };
    case DIRECTIONS.DOWN:
      return { x: 0, y: 1 };
    case DIRECTIONS.LEFT:
      return { x: -1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function getBulletOrigin(tank) {
  const size = tank.size;
  switch (tank.direction) {
    case DIRECTIONS.UP:
      return { x: tank.x + size / 2 - 2, y: tank.y - 4 };
    case DIRECTIONS.DOWN:
      return { x: tank.x + size / 2 - 2, y: tank.y + size - 2 };
    case DIRECTIONS.LEFT:
      return { x: tank.x - 4, y: tank.y + size / 2 - 2 };
    case DIRECTIONS.RIGHT:
      return { x: tank.x + size - 2, y: tank.y + size / 2 - 2 };
    default:
      return null;
  }
}
