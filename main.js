import { Game } from './src/game.js';

const canvas = document.getElementById('battlefield');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayBody = document.getElementById('overlay-body');
const hud = {
  score: document.getElementById('hud-score'),
  hiScore: document.getElementById('hud-hi-score'),
  stage: document.getElementById('hud-stage'),
  lives: document.getElementById('hud-lives'),
};

const muteButton = document.getElementById('mute-toggle');
const volumeSlider = document.getElementById('volume-slider');

const game = new Game({
  canvas,
  overlay,
  overlayTitle,
  overlayBody,
  hud,
  muteButton,
  volumeSlider,
});

game.init();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.handleVisibilityLoss();
  }
});

window.addEventListener('keydown', (ev) => {
  if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
      'Enter',
      'KeyP',
      'KeyM',
    ].includes(ev.code)
  ) {
    ev.preventDefault();
  }
});

window.addEventListener('load', () => {
  game.start();
});
