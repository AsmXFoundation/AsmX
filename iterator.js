class Iterator {
    _done = false;
    _value = undefined; // tile()
    _next = 0;
    _swap = 'void';
    _type = '(Iterator)';
    _slot = 'void';
    _call = null;

    slot(value) {
        this._slot = value;
        this._call = 'slot';
        return { swap: this._swap, slot: this._slot, type: this._type, next: this._next };
    }

    swap(value) {
        this._swap = value;
        this._slot = value;
        this._value = 'void';
        this._next = 0;
        this._call = 'swap';
        return { swap: this._swap, slot: this._slot, type: this._type, next: this._next };
    }

    tile() {
        this._value = this._slot[this._next];
        if ([null, undefined, NaN].includes(this._value)) this._value = 'void';
        if (this._slot.length == this._next) this._done = true;
        this._next++;
        this._call = 'tile';
        return { swap: this._swap, slot: this._slot, type: this._type, next: this._next, value: this._value, done: this._done };
    }

    view() {
        const methods_t = Object.getOwnPropertyNames(Iterator.prototype).filter(m => m != 'constructor').filter(m => !m.startsWith('_'));
        
        const properties = {
            swap: this._swap,
            slot: this._slot,
            type: this._type,
            next: this._next,
            value: this._value,
            done: this._done
        }

        const message = ['Iterator<T> {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        for (const method_t of methods_t) message.push(` ${method_t}<T>(...): object<IItrerator> => { },`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        console.log(message.join('\n'));
    }

    __view__() {
        if (this._call == 'tile') {
            return `Iterator { swap: ${this._swap}, slot: ${this._slot}, type: ${this._type}, next: ${this._next}, value: ${this._value}, done: ${this._done} }`;
        } else {
            return `Iterator { swap: ${this._swap}, slot: ${this._slot}, type: ${this._type}, next: ${this._next} }`;
        }
    }
}

module.exports = Iterator;