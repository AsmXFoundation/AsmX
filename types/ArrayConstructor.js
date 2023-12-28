class ArrayConstructor {
    _type = '(ArrayConstructor)';
    _items = [];

    size() { return this._items.length; }
    at(index){ return this._items.at(index); }
    swap(index, value) { this._items[index] = value; }
    push(value) { this._items.push(value); }
    pop() { this._items.pop(); }

    view() {
        const methods_t = Object.getOwnPropertyNames(ArrayConstructor.prototype).filter(m => m != 'constructor').filter(m => !m.startsWith('_'));
        
        const properties = {
            type: this._type,
            items: `{ ${this._items.join(', ')} }`,
            size: this>this.size()
        }

        const message = ['Array<T> {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        for (const method_t of methods_t) message.push(` ${method_t}<T>(...): any => { },`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        console.log(message.join('\n'));
    }


    __view__() {
        const properties = {
            type: this._type,
            items: `{ ${this._items.join(', ')} }`,
            size: `${this.size()} `
        }

        const message = ['Array {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        return message.join('');
    }
}

module.exports = ArrayConstructor;