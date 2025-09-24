export class Explosion {
  constructor(x, y, radius = 16) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = 0.4;
    this.timer = 0;
    this.alive = true;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.duration) {
      this.alive = false;
    }
  }

  get alpha() {
    return Math.max(0, 1 - this.timer / this.duration);
  }
}
