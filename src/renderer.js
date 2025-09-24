import { BOARD_TILES, TILE_SIZE, GRASS_ALPHA } from './constants.js';

const BASE64_TEXTURES = {
  brick: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNWIyYzFiIi8+PHBhdGggZD0iTTAgNGgxNk0wIDhoMTZNMCAxMmgxNiIgc3Ryb2tlPSIjOGYzZDFiIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMCAyaDE2TTAgNmgxNk0wIDEwaDE2TTAgMTRoMTYiIHN0cm9rZT0iIzQwMTkwZCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjM1Ii8+PHBhdGggZD0iTTQgMHY0TTEyIDB2NE00IDh2NE0xMiA4djQiIHN0cm9rZT0iIzhmM2QxYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
  steel: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzdmOGM4ZCIvPjxwYXRoIGQ9Ik0wIDhoMTYiIHN0cm9rZT0iI2IwYmVjNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTggMHYxNiIgc3Ryb2tlPSIjNTQ2ZTdhIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMiAyaDEydjEySDJ6IiBmaWxsPSJub25lIiBzdHJva2U9IiNjZmQ4ZGMiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC43Ii8+PC9zdmc+',
  water: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMGQ0N2ExIi8+PHBhdGggZD0iTTAgNGMyIDAgMi0yIDQtMnMyIDIgNCAyIDItMiA0LTIgMiAyIDQgMiIgc3Ryb2tlPSIjMTk3NmQyIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAxMGMyIDAgMi0yIDQtMnMyIDIgNCAyIDItMiA0LTIgMiAyIDQgMiIgc3Ryb2tlPSIjNDJhNWY1IiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC43Ii8+PC9zdmc+',
  grass: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMWI1ZTIwIi8+PHBhdGggZD0iTTIgMTRsMy04IDMgOCAzLTggMyA4IiBzdHJva2U9IiM0Y2FmNTAiIHN0cm9rZS13aWR0aD0iMS40IiBmaWxsPSJub25lIi8+PC9zdmc+',
  ice: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjY2ZkOGRjIi8+PHBhdGggZD0iTTAgOGgxNk04IDB2MTYiIHN0cm9rZT0iIzkwYTRhZSIgc3Ryb2tlLXdpZHRoPSIxLjIiLz48cGF0aCBkPSJNMiAyaDEydjEySDJ6IiBzdHJva2U9IiNlY2VmZjEiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==',
  player: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI2ZmYjMwMCIgc3Ryb2tlPSIjZmY2ZjAwIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjZmZlY2IzIi8+PHJlY3QgeD0iNyIgeT0iNiIgd2lkdGg9IjIiIGhlaWdodD0iNiIgZmlsbD0iIzNlMjcyMyIvPjwvc3ZnPg==',
  enemy_basic: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI2ZmNTI1MiIgc3Ryb2tlPSIjYzYyODI4IiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjZmY4YTgwIi8+PHJlY3QgeD0iNyIgeT0iNiIgd2lkdGg9IjIiIGhlaWdodD0iNiIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg==',
  enemy_fast: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI2ZmYWI0MCIgc3Ryb2tlPSIjZjU3YzAwIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjZmZlMDgyIi8+PHJlY3QgeD0iNyIgeT0iNiIgd2lkdGg9IjIiIGhlaWdodD0iNiIgZmlsbD0iIzNlMjcyMyIvPjwvc3ZnPg==',
  enemy_power: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iIzY0YjVmNiIgc3Ryb2tlPSIjMTk3NmQyIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjYmJkZWZiIi8+PHJlY3QgeD0iNyIgeT0iNiIgd2lkdGg9IjIiIGhlaWdodD0iNiIgZmlsbD0iIzEwMjAyNyIvPjwvc3ZnPg==',
  enemy_armor: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iIzkwYTRhZSIgc3Ryb2tlPSIjNTQ2ZTdhIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjZWNlZmYxIi8+PHJlY3QgeD0iNyIgeT0iNiIgd2lkdGg9IjIiIGhlaWdodD0iNiIgZmlsbD0iIzI2MzIzOCIvPjwvc3ZnPg==',
  shield: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgc3Ryb2tlPSIjODFkNGZhIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMWY1ZmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIyIDIiLz48L3N2Zz4=',
  base: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMzc0NzRmIi8+PHBvbHlnb24gcG9pbnRzPSIzLDEzIDgsMyAxMywxMyIgZmlsbD0iI2VjZWZmMSIgc3Ryb2tlPSIjYjBiZWM1IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
  bullet: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjgiIHJ4PSIxIiBmaWxsPSIjZWNlZmYxIiBzdHJva2U9IiNiMGJlYzUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+'
};

const FALLBACK_COLOR = {
  brick: '#8f3d1b',
  steel: '#90a4ae',
  water: '#1976d2',
  grass: '#2e7d32',
  ice: '#cfd8dc',
  player: '#ffb300',
  enemy_basic: '#e53935',
  enemy_fast: '#fb8c00',
  enemy_power: '#42a5f5',
  enemy_armor: '#78909c',
  base: '#cfd8dc',
  bullet: '#eceff1',
};

function loadTexture(key) {
  const img = new Image();
  img.src = BASE64_TEXTURES[key];
  return img;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = canvas.width;
    this.offscreen.height = canvas.height;
    this.offCtx = this.offscreen.getContext('2d');
    this.textures = {};
    Object.keys(BASE64_TEXTURES).forEach((key) => {
      this.textures[key] = loadTexture(key);
    });
  }

  drawTexture(ctx, key, x, y, size = TILE_SIZE) {
    const img = this.textures[key];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, size, size);
    } else {
      ctx.fillStyle = FALLBACK_COLOR[key] || '#888';
      ctx.fillRect(x, y, size, size);
      if (key === 'steel') {
        ctx.strokeStyle = '#bec3c7';
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
      }
    }
  }

  renderMap(map) {
    const ctx = this.offCtx;
    ctx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
    for (let y = 0; y < BOARD_TILES; y += 1) {
      for (let x = 0; x < BOARD_TILES; x += 1) {
        const tile = map.tiles[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        switch (tile.type) {
          case 'brick':
            this.drawTexture(ctx, 'brick', px, py);
            break;
          case 'steel':
            this.drawTexture(ctx, 'steel', px, py);
            break;
          case 'water':
            this.drawTexture(ctx, 'water', px, py);
            break;
          case 'base':
            this.drawTexture(ctx, 'base', px, py);
            break;
          case 'ice':
            this.drawTexture(ctx, 'ice', px, py);
            break;
          default:
            ctx.fillStyle = '#000';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            break;
        }
      }
    }
  }

  renderGrass(ctx, map) {
    ctx.save();
    ctx.globalAlpha = GRASS_ALPHA;
    for (const tile of map.getGrassTiles()) {
      const px = tile.x * TILE_SIZE;
      const py = tile.y * TILE_SIZE;
      this.drawTexture(ctx, 'grass', px, py);
    }
    ctx.restore();
  }

  drawTank(ctx, tank, type) {
    const key = type;
    this.drawTexture(ctx, key, tank.x, tank.y);
    if (tank.shieldTimer > 0) {
      const img = this.textures.shield;
      const size = TILE_SIZE + 4;
      const offset = (size - TILE_SIZE) / 2;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, tank.x - offset, tank.y - offset, size, size);
      } else {
        ctx.strokeStyle = '#81d4fa';
        ctx.beginPath();
        ctx.arc(tank.x + TILE_SIZE / 2, tank.y + TILE_SIZE / 2, TILE_SIZE / 1.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  drawBullet(ctx, bullet) {
    const img = this.textures.bullet;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, bullet.x, bullet.y, bullet.width, bullet.height);
    } else {
      ctx.fillStyle = FALLBACK_COLOR.bullet;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  drawExplosion(ctx, explosion) {
    ctx.save();
    ctx.globalAlpha = explosion.alpha;
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawPowerUp(ctx, powerup) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(powerup.x + 4, powerup.y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    ctx.restore();
    ctx.fillStyle = '#000';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(powerup.label || powerup.type[0].toUpperCase(), powerup.x + TILE_SIZE / 2, powerup.y + TILE_SIZE / 1.5);
  }

  drawBaseDamage(ctx, map) {
    if (!map.baseDestroyed) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 82, 82, 0.4)';
    ctx.fillRect((map.baseTile.x - 1) * TILE_SIZE, (map.baseTile.y - 1) * TILE_SIZE, TILE_SIZE * 3, TILE_SIZE * 3);
    ctx.restore();
  }

  render(state) {
    const { map, player, enemies, bullets, explosions, powerups } = state;
    this.renderMap(map);
    this.ctx.drawImage(this.offscreen, 0, 0);

    const ctx = this.ctx;

    if (powerups) {
      powerups.forEach((power) => {
        if (power.alive) this.drawPowerUp(ctx, power);
      });
    }

    if (player && player.alive) {
      this.drawTank(ctx, player, 'player');
    }

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      let key = 'enemy_basic';
      if (enemy.template.id === 'fast') key = 'enemy_fast';
      if (enemy.template.id === 'power') key = 'enemy_power';
      if (enemy.template.id === 'armor') key = 'enemy_armor';
      this.drawTank(ctx, enemy, key);
    });

    bullets.forEach((bullet) => {
      if (bullet.alive) this.drawBullet(ctx, bullet);
    });

    explosions.forEach((explosion) => {
      if (explosion.alive) this.drawExplosion(ctx, explosion);
    });

    this.renderGrass(ctx, map);
    this.drawBaseDamage(ctx, map);
  }
}
