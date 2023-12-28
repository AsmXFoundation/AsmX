// const Type = require("../../types");

class BufferConstructor {
    _type = '(BufferConstructor)';
    _items = Buffer.alloc(1);
    _offset = 0x00;

    size() { return this._items.byteLength; }
    alloc(size) { this._items = Buffer.alloc(+size); }

    push(value) {
        const numberPatterns = [/(^[+-]?\d+$)/, /[/+-]?\d+(\.\d+)$/, /^0[xX][0-9a-fA-F]+/];
        let check = false;
        
        for (const pattern of numberPatterns) {
            if (pattern.test(value)) {
                check = true;
                break;
            }
        }

        if (check) {
            this._items.writeInt32BE(value, this._offset);
            this._offset += 4;
        } else {
            this._offset += this._items.write(value, this._offset);
        }
    }

    __new__({ count }) {
        if (count) {
            this._items = Buffer.alloc(count);
            return this;
        }
    }

    view() {
        const methods_t = Object.getOwnPropertyNames(BufferConstructor.prototype).filter(m => m != 'constructor').filter(m => !m.startsWith('_'));
        
        let buffer = '';
        for (const value of this._items.values()) buffer += `${value.toString(16)}, `;
        buffer = buffer.trim().slice(0, -1);

        const properties = {
            type: this._type,
            items: `{ ${buffer} }`,
            size: this.size()
        }

        const message = ['Buffer<T> {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        for (const method_t of methods_t) message.push(` ${method_t}<T>(...): any => { },`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        console.log(message.join('\n'));
    }


    __view__() {
        let buffer = '';
        for (const value of this._items.values()) buffer += `${value.toString(16)}, `;
        buffer = buffer.trim().slice(0, -1);

        const properties = {
            type: this._type,
            items: `{ ${buffer} }`,
            size: `${this.size()} `
        }

        const message = ['Buffer {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        return message.join('');
    }
}

module.exports = BufferConstructor;