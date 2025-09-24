import { POWERUP_TYPES } from '../constants.js';

const LABELS = {
  helmet: 'H',
  clock: 'C',
  shovel: 'S',
  star: '★',
  grenade: 'G',
  tank: '1',
  gun: 'M',
};

export class PowerUp {
  constructor({ x, y, type }) {
    if (!POWERUP_TYPES.includes(type)) {
      throw new Error(`Unknown power up: ${type}`);
    }
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 16;
    this.timer = 0;
    this.life = 10;
    this.alive = true;
    this.label = LABELS[type] || type[0].toUpperCase();
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.life) {
      this.alive = false;
    }
  }

  get rect() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.size,
      bottom: this.y + this.size,
    };
  }
}
