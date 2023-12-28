const ArrayConstructor = require("./ArrayConstructor");
const BufferConstructor = require("./buffer/BufferConstructor");
const Iterator = require("./iterator");
const Vector = require("./vector");

class TypeConstructor {
    static is(value) {
        return [Vector, Iterator, ArrayConstructor, BufferConstructor].map(T => value instanceof T).includes(true);
    }

    static get(value) {
        const TypeConstructors = [Iterator, Vector, ArrayConstructor, BufferConstructor];
        let constructor_t = null;
        for (const T of TypeConstructors) if (value instanceof T) constructor_t = T;
        return constructor_t;
    }
}

module.exports = TypeConstructor;