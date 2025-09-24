import { HUD_SCORE_PAD } from './constants.js';

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function rectsOverlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

export function padNumber(value, length = HUD_SCORE_PAD) {
  return value.toString().padStart(length, '0');
}

export function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatScore(value) {
  return padNumber(Math.max(0, Math.floor(value)), HUD_SCORE_PAD);
}

export function formatStage(value, length = 2) {
  return padNumber(Math.max(1, value), length);
}

export function toTile(value) {
  return Math.floor(value / 16);
}

export function debounceFrame(callback) {
  let scheduled = false;
  return (...args) => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        callback(...args);
      });
    }
  };
}

export function createMatrix(width, height, initial) {
  const matrix = new Array(height);
  for (let y = 0; y < height; y += 1) {
    const row = new Array(width);
    for (let x = 0; x < width; x += 1) {
      row[x] = typeof initial === 'function' ? initial(x, y) : initial;
    }
    matrix[y] = row;
  }
  return matrix;
}

export function normalizeDirection(dir) {
  return ((dir % 4) + 4) % 4;
}

export function once(fn) {
  let called = false;
  return (...args) => {
    if (!called) {
      called = true;
      fn(...args);
    }
  };
}
