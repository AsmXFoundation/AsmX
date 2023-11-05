class Vector {
    _type = '(Vector)';
    _items = [];
    _capacity = 0;
    _size = 0;
    _swap = 'void';

    __new__({ count }) {
        if (count) {
            this._capacity = count * 2;
            for (let index = 0; index < this._capacity; index++) this._items.push(0);
            return this;
        }
    }

    front() { return this._items[0]; }
    back() { return this._items[this._size - 1]; }
    size() { return this._size; }
    capacity() { return this._capacity; }
    at(index){ return this._items[index] ?? 0; }

    swap(index, value) {
        this._swap = value;
        this._call = 'swap';
        this._items[index] = value;
    }

    push_back(value) {
        this._items[this._size] = value;

        if (this._size == this._capacity - 1) {
            for (let index = this._size; index < (this._size * 2) + 1; index++) this._items[this._size + index] = 0;
            this._capacity = this._items.length;
        } else if ([this._size == 0, this._capacity == 0].every(c => c == true)) {
            this._items[this._size + 1] = 0;
            this._capacity = 2;
        } else if (this._size == this._capacity) {
            for (let index = this._size; index < this._size * 2; index++) this._items[this._size + index] = 0;
            this._capacity = this._size * 2;
        }

        this._size++;
    }

    push_front(value) {
        this._items.unshift(value);
        this._size++;
    }

    pop_back() {
        this._items[this._size > 0 ? this._size - 1 : 0] = 0;
        if (this._size > 0) this._size--;
    }

    pop_front() {
        this._items.shift();
        if (this._size > 0) this._size--;
    }

    view() {
        const methods_t = Object.getOwnPropertyNames(Vector.prototype).filter(m => m != 'constructor').filter(m => !m.startsWith('_'));
        
        const properties = {
            type: this._type,
            items: `{ ${this._items.join(', ')} }`,
            size: this._size,
            capacity: this._capacity
        }

        const message = ['Vector<T> {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        for (const method_t of methods_t) message.push(` ${method_t}<T>(...): IVectorResponse => { },`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        console.log(message.join('\n'));
    }


    __view__() {
        const properties = {
            type: this._type,
            items: `{ ${this._items.join(', ')} }`,
            size: this._size,
            capacity: this._capacity
        }

        const message = ['Vector {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        return message.join('');
    }
}

module.exports = Vector;