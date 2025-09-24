import { DIRECTIONS, TILE_SIZE } from '../constants.js';

const BULLET_WIDTH = 4;
const BULLET_LENGTH = 8;

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

export class Bullet {
  constructor({ x, y, direction, speed, power, owner, fromPlayer }) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.power = power;
    this.owner = owner;
    this.fromPlayer = fromPlayer;
    this.alive = true;
    this.width = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN ? BULLET_WIDTH : BULLET_LENGTH;
    this.height = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN ? BULLET_LENGTH : BULLET_WIDTH;
  }

  get rect() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
    };
  }

  update(dt) {
    if (!this.alive) return;
    const vector = directionToVector(this.direction);
    this.x += vector.x * this.speed * dt;
    this.y += vector.y * this.speed * dt;
    if (
      this.x < -this.width ||
      this.y < -this.height ||
      this.x > TILE_SIZE * 26 + this.width ||
      this.y > TILE_SIZE * 26 + this.height
    ) {
      this.alive = false;
    }
  }
}
