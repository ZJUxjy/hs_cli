const EventListener = require('./EventListener');

class EventRegistry {
  constructor() {
    this.listeners = {};
  }

  register(event, handler, once = false) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    const listener = new EventListener(event, handler, once);
    this.listeners[event].push(listener);
    return listener;
  }

  trigger(event, game, source, ...args) {
    const listeners = this.listeners[event] || [];
    const results = [];

    for (const listener of listeners) {
      const result = listener.trigger(game, source, ...args);
      results.push(result);
      if (listener.once) {
        this.unregister(event, listener);
      }
    }

    return results;
  }

  unregister(event, listener) {
    if (!this.listeners[event]) return;
    const index = this.listeners[event].indexOf(listener);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }
}

module.exports = EventRegistry;
