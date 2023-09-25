const { log } = require("./server/log");

class EventEmulator {
    static events = [];
    static types = [];
    static map = {}; // [typeEvent]: [eventName]

    static newEvent(type) {
        !this.types.includes(type) && this.types.push(type);
    }


    static new(name, type, data) {
        if (!this.has(type, name)) {
            this.events.push({ name, type, data: data || {} });
            if (!Reflect.ownKeys(this.map).includes(type)) this.map[type] = [];
            this.map[type].push(name);
            this.types.push(type);
        }
    }


    static has(type, name) {
        return this.events.filter(event => event?.name == name && event?.type == type).length != 0;
    }


    static get(type, name) {
        if (this.has(type, name)) return this.events.filter(event => event?.name == name && event?.type == type);
    }


    static on(type, cb) {
        if (this.types.includes(type)) {
            const events = this.events.filter(event => event?.type == type);
            if (events.length > 0) cb(events, events[events.length - 1]);
        }
    }


    static isType(type) {
        return this.types.includes(type);
    }
}

EventEmulator.newEvent('set');
EventEmulator.newEvent('change');
EventEmulator.newEvent('push');

module.exports = EventEmulator;