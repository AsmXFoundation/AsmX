/* It's a class that returns the next value in an array */
class iterator {
    constructor(keywordsTokens) {
        this._keywordsTokens = keywordsTokens;
        this._nextIdx = 0;
    }
    
    next() {
        if (this._nextIdx === this._keywordsTokens.length) return { done: true }
        
        const result = {
            value: this._keywordsTokens[this._nextIdx],
            done: false
        }
        
        this._nextIdx++;
        return result;
    }
}


/* The Types class is a subclass of the KeyWords class, and it has a method called Symbol.iterator that
returns an iterator object that iterates over the types array. */
class Types {
    static [Symbol.iterator]() {
        this.types = ['Any', 'String', 'Int', 'Float', 'Bool', 'List'];
        return new iterator(this.types);
    }
}

module.exports = Types;