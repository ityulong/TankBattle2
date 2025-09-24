import { BOARD_TILES, TILE_SIZE, BASE_REGION } from './constants.js';

const TILE_TYPES = {
  '.': { type: 'empty', passable: true, bulletStop: false },
  'B': { type: 'brick', passable: false, bulletStop: false },
  'S': { type: 'steel', passable: false, bulletStop: true },
  'W': { type: 'water', passable: false, bulletStop: true },
  'G': { type: 'grass', passable: true, bulletStop: false },
  'I': { type: 'ice', passable: true, bulletStop: false },
  'E': { type: 'base', passable: false, bulletStop: true },
};

function cloneTile(key) {
  const def = TILE_TYPES[key] || TILE_TYPES['.'];
  return {
    key,
    type: def.type,
    passable: def.passable,
    bulletStop: def.bulletStop,
    hp: def.type === 'brick' ? 1 : def.type === 'steel' ? 2 : 0,
  };
}

export class GameMap {
  constructor(layout) {
    this.width = BOARD_TILES;
    this.height = BOARD_TILES;
    this.tiles = layout.map((line) => [...line].map((ch) => cloneTile(ch)));
    this.grassTiles = [];
    this.baseTile = null;
    this.baseDestroyed = false;
    this.fortifyTimer = 0;
    this.originalWalls = [];
    this._scan();
  }

  _scan() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const tile = this.tiles[y][x];
        if (tile.type === 'grass') {
          this.grassTiles.push({ x, y });
        }
        if (tile.type === 'base') {
          this.baseTile = { x, y };
        }
      }
    }
    this._cacheBaseWalls();
  }

  _cacheBaseWalls() {
    if (!this.baseTile) return;
    const positions = [];
    for (let y = BASE_REGION.top / TILE_SIZE; y < BASE_REGION.bottom / TILE_SIZE; y += 1) {
      for (let x = BASE_REGION.left / TILE_SIZE; x < BASE_REGION.right / TILE_SIZE; x += 1) {
        if (y === this.baseTile.y && x === this.baseTile.x) continue;
        const tile = this.tiles[y][x];
        if (tile.type === 'brick' || tile.type === 'steel' || tile.type === 'empty') {
          positions.push({ x, y });
        }
      }
    }
    this.originalWalls = positions;
  }

  resetFortification() {
    this.fortifyTimer = 0;
    this.originalWalls.forEach(({ x, y }) => {
      this.tiles[y][x] = cloneTile('B');
    });
  }

  fortifyBase(duration) {
    if (!this.originalWalls.length) return;
    this.originalWalls.forEach(({ x, y }) => {
      this.tiles[y][x] = cloneTile('S');
    });
    this.fortifyTimer = duration;
  }

  update(dt) {
    if (this.fortifyTimer > 0) {
      this.fortifyTimer -= dt;
      if (this.fortifyTimer <= 0) {
        this.resetFortification();
      }
    }
  }

  toRect(x, y, size = TILE_SIZE) {
    return {
      left: x,
      top: y,
      right: x + size,
      bottom: y + size,
    };
  }

  insideBounds(rect) {
    return rect.left >= 0 && rect.top >= 0 && rect.right <= this.width * TILE_SIZE && rect.bottom <= this.height * TILE_SIZE;
  }

  tileAtPixel(x, y) {
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return null;
    return this.tiles[ty][tx];
  }

  tilesWithin(rect) {
    const minX = Math.max(0, Math.floor(rect.left / TILE_SIZE));
    const maxX = Math.min(this.width - 1, Math.floor((rect.right - 0.001) / TILE_SIZE));
    const minY = Math.max(0, Math.floor(rect.top / TILE_SIZE));
    const maxY = Math.min(this.height - 1, Math.floor((rect.bottom - 0.001) / TILE_SIZE));
    const list = [];
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        list.push({ x, y, tile: this.tiles[y][x] });
      }
    }
    return list;
  }

  canMove(rect) {
    if (!this.insideBounds(rect)) return false;
    const tiles = this.tilesWithin(rect);
    for (const { tile } of tiles) {
      if (!tile.passable || tile.type === 'water' || tile.type === 'base') {
        return false;
      }
    }
    return true;
  }

  checkBulletCollision(rect, power) {
    const tiles = this.tilesWithin(rect);
    for (const { x, y, tile } of tiles) {
      if (tile.type === 'empty' || tile.type === 'grass' || tile.type === 'ice') continue;
      if (tile.type === 'brick') {
        this.tiles[y][x] = cloneTile('.');
        return { hit: true, base: false };
      }
      if (tile.type === 'steel') {
        if (power > 1) {
          this.tiles[y][x] = cloneTile('.');
        }
        return { hit: true, base: false };
      }
      if (tile.type === 'water') {
        return { hit: true, base: false };
      }
      if (tile.type === 'base') {
        this.baseDestroyed = true;
        return { hit: true, base: true };
      }
    }
    return { hit: false, base: false };
  }

  getGrassTiles() {
    return this.grassTiles;
  }

  setBaseDestroyed() {
    this.baseDestroyed = true;
  }
}
