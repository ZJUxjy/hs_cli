class EventListener {
  constructor(event, handler, once = false) {
    this.event = event;
    this.handler = handler;
    this.once = once;
  }

  trigger(game, source, ...args) {
    return this.handler(game, source, ...args);
  }
}

module.exports = EventListener;
