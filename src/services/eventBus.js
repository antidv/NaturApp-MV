class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).delete(fn);
    if (this.listeners.get(event).size === 0) this.listeners.delete(event);
  }

  emit(event, payload) {
    if (!this.listeners.has(event)) return;
    for (const fn of Array.from(this.listeners.get(event))) {
      try {
        fn(payload);
      } catch (e) {
        console.error('EventBus handler error', e);
      }
    }
  }
}

const bus = new EventBus();
export default bus;
