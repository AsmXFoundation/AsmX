const Iterator = require("./types/iterator");
const Vector = require("./types/vector");

class Type {
    static types = [];
    static value = null;

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
        this.value = null;

        if (['Object', 'object'].includes(type)) {
            check = typeof value === 'object' && !Array.isArray(value) ? true : false;
        } else if (['List', 'list'].includes(type)) {
            if (typeof value === 'object' && Array.isArray(value)) check = true;
            else if (value == '[]') check = true;
            else check = false;
        } else if (['Iterator', 'iterator'].includes(type)) {
            if (typeof value === 'object' && !Array.isArray(value)) check = true;
            else if (value == '{}') check = true;
            else check = false;

            if (check) this.value = new Iterator();
        } else if (['Vector', 'vector'].includes(type)) {
            if (typeof value === 'object' && !Array.isArray(value)) check = true;
            else if (value == '{}') check = true;
            else if (Type.check('int', value)) check = true;
            else check = false;
            
            if (check) {
                const vector = new Vector();
                if (Type.check('int', value)) this.value = vector.__new__({ count: +value });
                else this.value = vector;
            }
        } else if (/i[0-9]+/.test(type)) {
            check = this.isIntX(+type.slice(1), value);
        } else if (/s[0-9]+/.test(type)) {
            check = this.isStringX(+type.slice(1), value.slice(1, -1));
        }

        return check;
    }


    static isIntX(t, num) {
        return 0 < num ? (Math.pow(2, t) - 1) >= num : false;
    }


    static isStringX(num, str) {
        return num >= str.length;
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
    Type
}