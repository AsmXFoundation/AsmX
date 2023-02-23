let Token = require('./tokens');

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

/* The KeyWords class is a class that contains an array of tokens that are keywords. */
class KeyWords {
    [Symbol.iterator](){
        this.keywordsTokens = [new Token().KEYWORDS];
        return new iterator(this.keywordsTokens);
    }
}

/* The class Operators extends the class KeyWords and implements the iterator interface. */
class Operators extends KeyWords {
    constructor(){
        super();       
        this.operators = ['=', '>', '<'];
    }

    [Symbol.iterator]() {
        return new iterator(this.operators);
    }
}

/* The class MutationsOperators extends the class Operators and implements the iterator protocol. */
class MutationsOperators extends Operators {
    constructor(){
        super();
        this.operators = ['<=', '*=', '-=', '+=', '/=', '++'];
    }

    [Symbol.iterator]() {
        return new iterator(this.operators);
    }
}

/* The Types class is a subclass of the KeyWords class, and it has a method called Symbol.iterator that
returns an iterator object that iterates over the types array. */
class Types extends KeyWords {
   constructor(){
        super();
        this.types = ['Any', 'String', 'Int', 'Float', 'Bool', 'List', 'Unique'];
   }

    [Symbol.iterator]() {
        return new iterator(this.types);
    }
}

/* It's exporting the classes to be used in other files. */
module.exports = KeyWords;
module.exports = Operators;
module.exports = MutationsOperators;
module.exports = Types;