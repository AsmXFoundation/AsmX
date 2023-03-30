const { ArgumentError } = require("./anatomics.errors");

class List {
    constructor(...items) {
        items.forEach(item => {
            if (!this.checkType(item)) {
                process.stdout.write(ArgumentError.ARGUMENT_INVALID_TYPE_ARGUMENT);
                process.exit();
            }
        });
        
        this.items = items;
        this.writable = true;
        this.readable = true;
        this.type = 'List';
    }

    checkType(item) {
        if (item === undefined || item === null) return true;
        if (Array.isArray(item)) return item.every(subItem => this.checkType(subItem));
        return item.constructor.name === this.type;
    }

    toList(){
        return this.items.slice();
    }

    get(index){
        return this.items[index];
    }

    [Symbol.hasInstance](instance) {
        return instance instanceof List;
    }
}

class ListItem {
    constructor(...items) {
        this.items = items;
        this.type = 'Item';
    }
}

class None extends Number {
    constructor() {
        this.value = undefined;
        this.type = 'None';
        return undefined;
    }
}

class Tuple extends List {
    constructor(...items) {
        super(...items);
        this.writable = false;
        this.readable = false;
        this.type = 'Tuple';
    }
}