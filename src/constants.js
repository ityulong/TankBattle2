export const TILE_SIZE = 16;
export const BOARD_TILES = 26;
export const CANVAS_SIZE = TILE_SIZE * BOARD_TILES;

export const DIRECTIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

export const GAME_STATES = {
  MENU: 'menu',
  STAGE_INTRO: 'stage-intro',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STAGE_CLEAR: 'stage-clear',
  TALLY: 'tally',
  GAME_OVER: 'game-over',
};

export const PLAYER_INITIAL_LIVES = 3;
export const PLAYER_RESPAWN_SHIELD = 2;
export const PLAYER_SPEED = 92;
export const PLAYER_BULLET_SPEED = 220;
export const ENEMY_BULLET_SPEED = 180;
export const PLAYER_FIRE_COOLDOWN = 0.28;
export const PLAYER_FIRE_COOLDOWN_L3 = 0.15;
export const ENEMY_SPAWN_LIMIT = 4;
export const ENEMIES_PER_STAGE = 20;
export const ENEMY_SHIELD_TIME = 1.5;
export const ENEMY_SPAWN_POSITIONS = [
  { x: TILE_SIZE, y: TILE_SIZE },
  { x: TILE_SIZE * 12 + TILE_SIZE / 2, y: TILE_SIZE },
  { x: TILE_SIZE * (BOARD_TILES - 2), y: TILE_SIZE },
];

export const BASE_POSITION = {
  x: TILE_SIZE * 12,
  y: TILE_SIZE * (BOARD_TILES - 2),
};

export const PLAYER_SPAWN = {
  x: TILE_SIZE * 12,
  y: TILE_SIZE * (BOARD_TILES - 6),
};

export const BASE_REGION = {
  left: TILE_SIZE * 11,
  top: TILE_SIZE * (BOARD_TILES - 3),
  right: TILE_SIZE * 15,
  bottom: TILE_SIZE * (BOARD_TILES - 1),
};

export const POWERUP_TYPES = [
  'helmet',
  'clock',
  'shovel',
  'star',
  'grenade',
  'tank',
  'gun',
];

export const POWERUP_DURATION = {
  helmet: 10,
  clock: 5,
  shovel: 15,
  star: 0,
  grenade: 0,
  tank: 0,
  gun: 0,
};

export const SHOVEL_RESTORE_TIME = 3;

export const ENEMY_TYPES = {
  basic: {
    id: 'basic',
    score: 100,
    speed: 64,
    bulletPower: 1,
    hp: 1,
    doubleShot: false,
  },
  fast: {
    id: 'fast',
    score: 200,
    speed: 86,
    bulletPower: 1,
    hp: 1,
    doubleShot: false,
  },
  power: {
    id: 'power',
    score: 300,
    speed: 72,
    bulletPower: 2,
    hp: 1,
    doubleShot: true,
  },
  armor: {
    id: 'armor',
    score: 400,
    speed: 62,
    bulletPower: 2,
    hp: 3,
    doubleShot: false,
  },
};

export const ENEMY_TEMPLATES = [
  ENEMY_TYPES.basic,
  ENEMY_TYPES.fast,
  ENEMY_TYPES.power,
  ENEMY_TYPES.armor,
];

export const POWERUP_SEQUENCE = [
  'helmet',
  'star',
  'shovel',
  'clock',
  'grenade',
  'tank',
  'gun',
];

export const VOLUME_DEFAULT = 0.7;

export const FRAME_MAX_DELTA = 0.05;

export const HUD_SCORE_PAD = 6;
export const HUD_STAGE_PAD = 2;

export const GRASS_ALPHA = 0.75;

export const THEMES = {
  intro: 'intro',
  battle: 'battle',
  interlude: 'interlude',
  gameover: 'gameover',
  pause: 'pause',
};

export const NOTE_FREQUENCIES = {
  A0: 27.5,
};
