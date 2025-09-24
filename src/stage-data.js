import { ENEMIES_PER_STAGE, ENEMY_TEMPLATES } from './constants.js';

function generateLayout(stageIndex) {
  const rows = [];
  for (let y = 0; y < 26; y += 1) {
    let row = '';
    for (let x = 0; x < 26; x += 1) {
      let tile = '.';
      if (y < 2) {
        tile = '.';
      } else {
        const pattern = (stageIndex + x + y) % 7 === 0;
        const diagonal = (stageIndex + y * 2 + x) % 9 === 0;
        const cross = (x % 4 === (stageIndex % 4) && y % 4 === 2);
        if (pattern && y < 20) tile = 'B';
        if (diagonal && y > 4 && y < 22) tile = 'B';
        if (stageIndex > 4 && y % 6 === 3 && x > 3 && x < 22) tile = 'W';
        if (stageIndex > 9 && (x + y) % 6 === 0 && y > 5 && y < 22) tile = 'G';
        if (stageIndex > 14 && (x % 5 === 0) && y > 6 && y < 23) tile = 'I';
        if (stageIndex > 19 && cross && y > 6 && y < 20) tile = 'S';
        if (stageIndex > 24 && (x === 8 || x === 17) && y > 5 && y < 18) tile = 'S';
      }
      if (y >= 22 && y <= 25 && x >= 10 && x <= 15) {
        tile = '.';
      }
      row += tile;
    }
    rows.push(row);
  }
  rows[23] = '..........BBBBB...........';
  rows[24] = '..........BBBBB...........';
  rows[25] = '............E.............';
  return rows;
}

function createEnemyLineup(stageIndex) {
  const stageNumber = stageIndex + 1;
  const armor = Math.min(2 + Math.floor(stageNumber / 4), 8);
  const power = Math.min(3 + Math.floor(stageNumber / 5), 8);
  const fast = Math.min(4 + Math.floor(stageNumber / 3), 10);
  let basic = ENEMIES_PER_STAGE - (armor + power + fast);
  if (basic < 0) {
    basic = Math.max(0, ENEMIES_PER_STAGE - (armor + power));
  }
  const lineup = [];
  for (let i = 0; i < basic; i += 1) lineup.push(ENEMY_TEMPLATES[0]);
  for (let i = 0; i < fast; i += 1) lineup.push(ENEMY_TEMPLATES[1]);
  for (let i = 0; i < power; i += 1) lineup.push(ENEMY_TEMPLATES[2]);
  for (let i = 0; i < armor; i += 1) lineup.push(ENEMY_TEMPLATES[3]);
  return lineup.slice(0, ENEMIES_PER_STAGE);
}

const STAGES = Array.from({ length: 35 }, (_, index) => ({
  index,
  layout: generateLayout(index),
  enemies: createEnemyLineup(index),
  aiFactor: Math.min(1, 0.2 + index * 0.025),
  world: index % 4,
}));

export function getStageData(index) {
  return STAGES[index % STAGES.length];
}

export { STAGES };
