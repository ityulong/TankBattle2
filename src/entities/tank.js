import {
  DIRECTIONS,
  PLAYER_BULLET_SPEED,
  ENEMY_BULLET_SPEED,
  PLAYER_FIRE_COOLDOWN,
  PLAYER_FIRE_COOLDOWN_L3,
  PLAYER_SPEED,
  PLAYER_RESPAWN_SHIELD,
  TILE_SIZE,
  ENEMY_SHIELD_TIME,
} from '../constants.js';
import { clamp } from '../utils.js';

const SIZE = TILE_SIZE;

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

export class Tank {
  constructor({ x, y, speed, hp = 1 }) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.hp = hp;
    this.direction = DIRECTIONS.UP;
    this.cooldown = 0;
    this.size = SIZE;
    this.alive = true;
    this.shieldTimer = 0;
    this.activeBullets = 0;
  }

  get rect() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.size,
      bottom: this.y + this.size,
    };
  }

  setDirection(dir) {
    this.direction = dir;
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer < 0) this.shieldTimer = 0;
    }
  }

  move(map, dx, dy, tanks) {
    if (!this.alive) return false;
    const next = {
      left: this.x + dx,
      top: this.y + dy,
      right: this.x + dx + this.size,
      bottom: this.y + dy + this.size,
    };
    if (!map.canMove(next)) return false;
    for (const other of tanks) {
      if (other === this || !other.alive) continue;
      const rect = other.rect;
      if (!(rect.right <= next.left || rect.left >= next.right || rect.bottom <= next.top || rect.top >= next.bottom)) {
        return false;
      }
    }
    this.x += dx;
    this.y += dy;
    return true;
  }

  hit(power = 1) {
    if (!this.alive) return false;
    if (this.shieldTimer > 0) {
      return false;
    }
    this.hp -= power;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  giveShield(duration) {
    this.shieldTimer = Math.max(this.shieldTimer, duration);
  }

  canFire(limit) {
    return this.cooldown <= 0 && this.activeBullets < limit;
  }

  onBulletFired(cooldown) {
    this.cooldown = cooldown;
    this.activeBullets += 1;
  }

  onBulletDestroyed() {
    this.activeBullets = Math.max(0, this.activeBullets - 1);
  }
}

export class PlayerTank extends Tank {
  constructor({ x, y }) {
    super({ x, y, speed: PLAYER_SPEED, hp: 1 });
    this.level = 1;
    this.lives = 0;
    this.score = 0;
    this.respawnDelay = 0;
  }

  reset(position) {
    this.x = position.x;
    this.y = position.y;
    this.direction = DIRECTIONS.UP;
    this.alive = true;
    this.hp = 1;
    this.cooldown = 0;
    this.activeBullets = 0;
    this.giveShield(PLAYER_RESPAWN_SHIELD);
  }

  setLives(lives) {
    this.lives = lives;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  addLife() {
    this.lives += 1;
  }

  addScore(points) {
    this.score += points;
  }

  upgradeLevel(amount = 1) {
    this.level = clamp(this.level + amount, 1, 3);
  }

  resetLevel() {
    this.level = 1;
  }

  getSpeed() {
    const bonus = (this.level - 1) * 0.15;
    return this.speed * (1 + bonus);
  }

  getFireLimit() {
    return this.level >= 2 ? 2 : 1;
  }

  getBulletPower() {
    return this.level >= 3 ? 2 : 1;
  }

  getCooldown() {
    return this.level >= 3 ? PLAYER_FIRE_COOLDOWN_L3 : PLAYER_FIRE_COOLDOWN;
  }

  getBulletSpeed() {
    return PLAYER_BULLET_SPEED;
  }
}

export class EnemyTank extends Tank {
  constructor({ x, y, template, difficulty = 0 }) {
    super({ x, y, speed: template.speed * (0.85 + difficulty * 0.3), hp: template.hp });
    this.template = template;
    this.difficulty = difficulty;
    this.score = template.score;
    this.doubleShot = template.doubleShot;
    this.bulletPower = template.bulletPower;
    this.spawnShield = ENEMY_SHIELD_TIME;
    this.turnTimer = 0;
    this.fireTimer = 0;
    this.aiTimer = 0;
    this.giveShield(ENEMY_SHIELD_TIME);
  }

  update(dt) {
    super.update(dt);
  }

  giveFreeze(duration) {
    this.aiTimer = Math.max(this.aiTimer, duration);
  }

  isFrozen() {
    return this.aiTimer > 0;
  }

  updateAI(dt, map, player, tanks) {
    if (!this.alive) return;
    if (this.aiTimer > 0) {
      this.aiTimer -= dt;
      return;
    }
    const speed = this.speed * dt;
    if (!this.tryMove(map, speed, tanks)) {
      this.chooseNewDirection();
    }
    this.fireTimer -= dt;
  }

  tryMove(map, speed, tanks) {
    const vector = directionToVector(this.direction);
    if (vector.x === 0 && vector.y === 0) return false;
    const dx = vector.x * speed;
    const dy = vector.y * speed;
    const moved = this.move(map, dx, dy, tanks);
    if (!moved) {
      return false;
    }
    return true;
  }

  chooseNewDirection() {
    const options = [DIRECTIONS.UP, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT];
    const next = options[Math.floor(Math.random() * options.length)];
    this.direction = next;
  }

  tryTarget(player) {
    if (!player || !player.alive) return;
    const alignedVertically = Math.abs(player.x - this.x) < TILE_SIZE / 2;
    const alignedHorizontally = Math.abs(player.y - this.y) < TILE_SIZE / 2;
    if (alignedVertically) {
      this.direction = player.y < this.y ? DIRECTIONS.UP : DIRECTIONS.DOWN;
    } else if (alignedHorizontally) {
      this.direction = player.x < this.x ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
    }
  }

  wantToFire(player) {
    if (!player || !player.alive) return false;
    const alignedX = Math.abs(player.x - this.x) < TILE_SIZE / 2;
    const alignedY = Math.abs(player.y - this.y) < TILE_SIZE / 2;
    if (alignedX || alignedY) {
      const distance = alignedX ? Math.abs(player.y - this.y) : Math.abs(player.x - this.x);
      const threshold = 120 + this.difficulty * 120;
      if (distance < threshold) {
        return Math.random() < 0.65;
      }
    }
    return Math.random() < 0.1 + this.difficulty * 0.35;
  }

  canFire(limit) {
    const effectiveLimit = this.doubleShot ? 2 : Math.min(1, limit);
    return super.canFire(effectiveLimit);
  }

  getCooldown() {
    return 0.4 - Math.min(0.25, this.difficulty * 0.15);
  }

  getBulletSpeed() {
    return ENEMY_BULLET_SPEED;
  }
}
