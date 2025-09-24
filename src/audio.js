import { BATTLE_THEMES, THEMES, VOLUME_DEFAULT } from './constants.js';

const NOTE_INDEX = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const REST_SYMBOLS = new Set(['R', 'REST', '-', '0']);

function sanitizeNote(value) {
  return value
    .trim()
    .normalize('NFKC')
    .replace(/♯|＃/g, '#')
    .replace(/♭/g, 'b');
}

export function parseNote(value) {
  if (typeof value === 'number') {
    if (Number.isFinite(value) && value > 0) return value;
    throw new Error('Invalid numeric frequency');
  }
  if (typeof value !== 'string') {
    throw new Error('Note must be a string');
  }
  const normalized = sanitizeNote(value);
  if (normalized.length === 0) {
    throw new Error('Note must not be empty');
  }
  if (REST_SYMBOLS.has(normalized.toUpperCase())) {
    return null;
  }
  const match = normalized.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Cannot parse note ${value}`);
  }
  const [, rawLetter, accidental, octaveRaw] = match;
  const letter = rawLetter.toUpperCase();
  const offset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  const octave = Number.parseInt(octaveRaw, 10);
  if (!Number.isInteger(octave)) {
    throw new Error(`Invalid octave in note ${value}`);
  }
  const base = NOTE_INDEX[letter];
  if (base === undefined) {
    throw new Error(`Invalid note letter ${letter}`);
  }
  const midi = (octave + 1) * 12 + base + offset;
  return 440 * 2 ** ((midi - 69) / 12);
}

const THEME_LIBRARY = {
  [THEMES.intro]: {
    loop: true,
    layers: [
      {
        tempo: 0.36,
        volume: 0.35,
        waveform: 'square',
        steps: [
          ['C4', 1],
          ['E4', 1],
          ['G4', 1],
          ['C5', 1],
          ['REST', 0.5],
          ['G4', 1],
          ['E4', 1],
          ['C4', 1.5],
        ],
      },
      {
        tempo: 0.72,
        volume: 0.18,
        waveform: 'triangle',
        steps: [
          ['C3', 2],
          ['G2', 2],
          ['C3', 2],
          ['G2', 2],
        ],
      },
    ],
  },
  [THEMES.interlude]: {
    loop: false,
    layers: [
      {
        tempo: 0.32,
        volume: 0.4,
        waveform: 'square',
        steps: [
          ['C4', 1],
          ['F4', 1],
          ['A4', 1],
          ['C5', 1],
          ['REST', 0.5],
          ['C5', 1],
          ['A4', 1],
          ['F4', 1],
          ['C4', 1.5],
        ],
      },
    ],
  },
  [THEMES.gameover]: {
    loop: false,
    layers: [
      {
        tempo: 0.45,
        volume: 0.35,
        waveform: 'triangle',
        steps: [
          ['C4', 2],
          ['REST', 0.5],
          ['G3', 1],
          ['C4', 2],
          ['REST', 0.5],
          ['G3', 1],
          ['E3', 3],
        ],
      },
    ],
  },
  [THEMES.pause]: {
    loop: false,
    layers: [
      {
        tempo: 0.2,
        volume: 0.45,
        waveform: 'square',
        steps: [
          ['C5', 0.5],
          ['REST', 0.2],
          ['C4', 0.8],
        ],
      },
    ],
  },
};

const BATTLE_THEME_DEFS = [
  {
    loop: true,
    layers: [
      {
        tempo: 0.28,
        volume: 0.4,
        waveform: 'square',
        steps: [
          ['E4', 1],
          ['REST', 0.5],
          ['F4', 0.5],
          ['G4', 1],
          ['REST', 0.5],
          ['G4', 0.5],
          ['A4', 1],
          ['REST', 0.5],
          ['B4', 0.5],
          ['C5', 1.5],
        ],
      },
      {
        tempo: 0.28,
        volume: 0.25,
        waveform: 'square',
        steps: [
          ['E3', 1],
          ['REST', 0.5],
          ['F3', 0.5],
          ['G3', 1],
          ['REST', 0.5],
          ['G3', 0.5],
          ['A3', 1],
          ['REST', 0.5],
          ['B3', 0.5],
          ['C4', 1.5],
        ],
      },
    ],
  },
  {
    loop: true,
    layers: [
      {
        tempo: 0.3,
        volume: 0.42,
        waveform: 'square',
        steps: [
          ['A4', 1],
          ['REST', 0.5],
          ['C5', 0.5],
          ['D5', 1],
          ['REST', 0.5],
          ['E5', 0.5],
          ['C5', 1],
          ['REST', 0.5],
          ['D5', 0.5],
          ['A4', 1.5],
        ],
      },
      {
        tempo: 0.6,
        volume: 0.2,
        waveform: 'triangle',
        steps: [
          ['A3', 2],
          ['E3', 2],
          ['F3', 2],
          ['E3', 2],
        ],
      },
    ],
  },
  {
    loop: true,
    layers: [
      {
        tempo: 0.24,
        volume: 0.38,
        waveform: 'square',
        steps: [
          ['G4', 0.75],
          ['A4', 0.75],
          ['B4', 0.75],
          ['D5', 0.75],
          ['REST', 0.5],
          ['B4', 0.5],
          ['G4', 0.5],
          ['E4', 1.5],
        ],
      },
      {
        tempo: 0.48,
        volume: 0.22,
        waveform: 'sawtooth',
        steps: [
          ['G3', 1],
          ['REST', 0.5],
          ['A3', 0.5],
          ['B3', 1],
          ['REST', 0.5],
          ['B3', 0.5],
          ['D4', 1],
          ['REST', 0.5],
          ['E4', 0.5],
          ['G3', 1],
        ],
      },
    ],
  },
  {
    loop: true,
    layers: [
      {
        tempo: 0.32,
        volume: 0.4,
        waveform: 'square',
        steps: [
          ['D4', 1],
          ['REST', 0.5],
          ['F4', 0.5],
          ['A4', 1],
          ['REST', 0.5],
          ['G4', 0.5],
          ['B4', 1],
          ['REST', 0.5],
          ['A4', 0.5],
          ['D5', 1.5],
        ],
      },
      {
        tempo: 0.32,
        volume: 0.2,
        waveform: 'square',
        steps: [
          ['D3', 1],
          ['REST', 0.5],
          ['F3', 0.5],
          ['A3', 1],
          ['REST', 0.5],
          ['G3', 0.5],
          ['B3', 1],
          ['REST', 0.5],
          ['A3', 0.5],
          ['D4', 1.5],
        ],
      },
      {
        tempo: 0.64,
        volume: 0.18,
        waveform: 'triangle',
        steps: [
          ['D2', 2],
          ['A2', 2],
          ['G2', 2],
          ['A2', 2],
        ],
      },
    ],
  },
];

BATTLE_THEMES.forEach((name, index) => {
  const base = BATTLE_THEME_DEFS[index % BATTLE_THEME_DEFS.length];
  const layers = base.layers.map((layer) => ({
    ...layer,
    steps: layer.steps.map((step) => [...step]),
  }));
  THEME_LIBRARY[name] = { loop: base.loop, layers };
});

const SFX_LIBRARY = {
  shoot: {
    waveform: 'square',
    gain: 0.35,
    steps: [
      { freq: 'C5', duration: 0.09 },
      { freq: 'G4', duration: 0.05 },
    ],
  },
  explode: {
    waveform: 'sawtooth',
    gain: 0.4,
    steps: [
      { freq: 200, duration: 0.08 },
      { freq: 120, duration: 0.12 },
      { freq: 80, duration: 0.16 },
    ],
  },
  pickup: {
    waveform: 'triangle',
    gain: 0.32,
    steps: [
      { freq: 'C5', duration: 0.08 },
      { freq: 'E5', duration: 0.08 },
      { freq: 'G5', duration: 0.1 },
    ],
  },
  pause: {
    waveform: 'square',
    gain: 0.28,
    steps: [
      { freq: 'C4', duration: 0.1 },
      { freq: 'C5', duration: 0.1 },
    ],
  },
};

export class AudioManager {
  constructor() {
    this.enabled = true;
    this.volume = VOLUME_DEFAULT;
    this.context = null;
    this.masterGain = null;
    this.themeHandles = [];
    this.pendingTheme = null;
    this.unlocked = false;
    this.lastTheme = null;
  }

  prepare() {
    if (this.context) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      this.enabled = false;
      return;
    }
    this.context = new Context();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.context.destination);
  }

  async unlock() {
    this.prepare();
    if (!this.context) return;
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    this.unlocked = true;
    if (this.pendingTheme) {
      const { name, options } = this.pendingTheme;
      this.pendingTheme = null;
      this.playTheme(name, options);
    }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) {
      this.stopTheme();
    } else if (this.lastTheme && this.unlocked) {
      const { name, options } = this.lastTheme;
      this.playTheme(name, options);
    }
  }

  toggleEnabled() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setVolume(value) {
    this.volume = value;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.context.currentTime, 0.05);
    }
  }

  stopTheme() {
    this.themeHandles.forEach((handle) => handle.stop());
    this.themeHandles = [];
  }

  playTheme(name, options = {}) {
    const def = THEME_LIBRARY[name];
    if (!def) return;
    this.lastTheme = { name, options: { ...options } };
    if (!this.enabled) {
      this.pendingTheme = { name, options };
      return;
    }
    this.prepare();
    if (!this.context) return;
    if (!this.unlocked) {
      this.pendingTheme = { name, options };
      return;
    }
    this.stopTheme();
    const delay = options.delay ?? 0;
    def.layers.forEach((layer) => {
      const handle = this._playLayer(layer, delay, def.loop);
      this.themeHandles.push(handle);
    });
  }

  _playLayer(layer, delay, shouldLoop) {
    const tempo = layer.tempo ?? 0.35;
    const waveform = layer.waveform ?? 'square';
    const volume = layer.volume ?? 0.3;
    const context = this.context;
    const startTime = context.currentTime + delay;
    const sources = [];
    let time = startTime;
    for (const step of layer.steps) {
      const [note, beats = 1] = step;
      const freq = note ? parseNote(note) : null;
      const duration = Math.max(beats * tempo, 0.05);
      if (freq) {
        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0.0001, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + Math.min(0.03, duration / 2));
        gainNode.gain.setTargetAtTime(0.0001, time + duration, 0.04);
        gainNode.connect(this.masterGain);

        const osc = context.createOscillator();
        osc.type = waveform;
        osc.frequency.setValueAtTime(freq, time);
        osc.connect(gainNode);
        osc.start(time);
        osc.stop(time + duration + 0.1);
        sources.push({ osc, gainNode });
      }
      time += duration;
    }
    const totalDuration = time - startTime;
    let loopTimer = null;
    const handle = {
      stop: () => {
        if (loopTimer) clearTimeout(loopTimer);
        sources.forEach(({ osc }) => {
          try {
            osc.stop();
          } catch (err) {
            // ignore
          }
        });
      },
    };
    if (shouldLoop) {
      loopTimer = setTimeout(() => {
        const idx = this.themeHandles.indexOf(handle);
        if (idx >= 0) {
          this.themeHandles.splice(idx, 1);
        }
        const next = this._playLayer(layer, 0, true);
        this.themeHandles.push(next);
      }, totalDuration * 1000);
    }
    return handle;
  }

  playSfx(name) {
    if (!this.enabled) return;
    this.prepare();
    if (!this.context || !this.unlocked) return;
    const def = SFX_LIBRARY[name];
    if (!def) return;
    const now = this.context.currentTime + 0.01;
    let time = now;
    for (const step of def.steps) {
      const duration = Math.max(step.duration, 0.05);
      const freq = parseNote(step.freq);
      if (freq) {
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(def.gain, time + 0.01);
        gain.gain.setTargetAtTime(0.0001, time + duration, 0.05);
        gain.connect(this.masterGain);
        const osc = this.context.createOscillator();
        osc.type = def.waveform;
        osc.frequency.setValueAtTime(freq, time);
        osc.connect(gain);
        osc.start(time);
        osc.stop(time + duration + 0.1);
      }
      time += duration * 0.9;
    }
  }
}
