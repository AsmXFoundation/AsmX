const { ArgumentError } = require("./exception");

class Type {
    static types = [];

    static has(type) {
        let is = false;
        this.types.forEach(t => { if (t.name == type) is = true });
        return is;
    }

    static check(type, value) {
        let rules = this.types.filter(t => t.name == type);
        let check = false;

        if (Array.isArray(rules)) {
            for (let index = 0; index < rules.length; index++) {
                if (rules[index].rule.test(value)) {
                    check = true;
                    break;
                }
            }  
    
            // rules.forEach(rule => check = rule.rule.test(value));
        } else {
            check = rules[0]['rule'].test(value);
        }

        return check;
    }

    static getRule(type) {
        return this.types.filter(t => t.name == type)['rule'];
    }

    static new(name, rule) {
        this.types.push({ name, rule });
    }


    static otherTypesCheck(type, value) {
        let check = false;

        if (['Object', 'object'].includes(type)) {
            // if (typeof value === 'object' && !Array.isArray(value)) check = true;
            // else check = false;

            check = typeof value === 'object' && !Array.isArray(value) ? true : false;
        } else if (['List', 'list'].includes(type)) {
            if (typeof value === 'object' && Array.isArray(value)) check = true;
            else if (value == '[]') check = true;
            else check = false;
        }

        return check;
    }
}


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


class Tuple extends List {
    constructor(...items) {
        super(...items);
        this.writable = false;
        this.readable = false;
        this.type = 'Tuple';
    }
}


Type.new('String', /'[^"]*'/);
Type.new('String', /"[^']*"/);
Type.new('Int', /(^[+-]?\d+$)/);
Type.new('Float', /[/+-]?\d+(\.\d+)$/);
Type.new('Hex', /^0[xX][0-9a-fA-F]+/);
Type.new('Bool', /true|false/);

Type.new('string', /'[^"]*'/);
Type.new('string', /"[^']*"/);
Type.new('int', /(^[+-]?\d+$)/);
Type.new('float', /[/+-]?\d+(\.\d+)$/);
Type.new('hex', /^0[xX][0-9a-fA-F]+/);
Type.new('bool', /true|false/);

module.exports = {
    Type,
    Tuple,
    List
}