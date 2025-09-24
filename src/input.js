const keyMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'fire',
  Enter: 'start',
  KeyP: 'pause',
  KeyM: 'mute',
};

export class Input {
  constructor() {
    this.keys = new Map();
    this.onceListeners = new Map();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
    this.keys.clear();
    this.onceListeners.clear();
  }

  isDown(action) {
    return Boolean(this.keys.get(action));
  }

  consume(action) {
    if (this.keys.get(action)) {
      this.keys.set(action, false);
      return true;
    }
    return false;
  }

  once(action, handler) {
    if (!this.onceListeners.has(action)) {
      this.onceListeners.set(action, new Set());
    }
    this.onceListeners.get(action).add(handler);
  }

  _emitOnce(action) {
    const listeners = this.onceListeners.get(action);
    if (!listeners) return;
    listeners.forEach((cb) => cb());
    listeners.clear();
  }

  _handleKeyDown(event) {
    const action = keyMap[event.code];
    if (!action) return;
    this.keys.set(action, true);
    this._emitOnce(action);
  }

  _handleKeyUp(event) {
    const action = keyMap[event.code];
    if (!action) return;
    this.keys.set(action, false);
  }
}
