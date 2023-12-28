const ArrayConstructor = require("./types/ArrayConstructor");
const BufferConstructor = require("./types/buffer/BufferConstructor");
const Iterator = require("./types/iterator");
const Vector = require("./types/vector");

class Type {
    static types = [];
    static value = null;


    /**
     * Check if a given type exists in the list of types.
     *
     * @param {type} type - The type to check for existence.
     * @return {boolean} Returns true if the type exists, false otherwise.
     */
    static has(type) {
        let is = false;
        this.types.forEach(t => { if (t.name == type) is = true });
        return is;
    }

    
    /**
     * Checks if the given value matches the specified type.
     *
     * @param {string} type - The type to check against.
     * @param {any} value - The value to be checked.
     * @return {boolean} Returns true if the value matches the type, otherwise false.
     */
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


    /**
     * Retrieves the rule associated with the given type.
     *
     * @param {type} type - The type for which to retrieve the rule.
     * @return {type} The rule associated with the given type.
     */
    static getRule(type) {
        return this.types.filter(t => t.name == type)['rule'];
    }

    
    /**
     * Creates a new type with the given name and rule and adds it to the types array.
     *
     * @param {string} name - The name of the type.
     * @param {rule} rule - The rule for the type.
     */
    static new(name, rule) {
        this.types.push({ name, rule });
    }


    /**
     * Checks the type and value of the given input.
     *
     * @param {string} type - The type of the value to be checked.
     * @param {any} value - The value to be checked.
     * @return {boolean} Returns true if the type and value match the specified conditions, otherwise false.
     */
    static otherTypesCheck(type, value) {
        let check = false;
        this.value = null;

        if (['Object', 'object'].includes(type)) {
            check = typeof value === 'object' && !Array.isArray(value) ? true : false;
        }
        
        else if (['List', 'list'].includes(type)) {
            if (typeof value === 'object' && Array.isArray(value)) check = true;
            else if (value == '[]') check = true;
            else check = false;
        } 
        
        else if (['Iterator', 'iterator'].includes(type)) {
            if (typeof value === 'object' && !Array.isArray(value)) check = true;
            else if (value == '{}') check = true;
            else check = false;

            if (check) this.value = new Iterator();
        } 
        
        else if (['Vector', 'vector'].includes(type)) {
            if (typeof value === 'object' && !Array.isArray(value)) check = true;
            else if (value == '{}') check = true;
            else if (Type.check('int', value)) check = true;
            else check = false;
            
            if (check) {
                const vector = new Vector();
                if (Type.check('int', value)) this.value = vector.__new__({ count: +value });
                else this.value = vector;
            }
        } 
        
        else if (['Array', 'array'].includes(type)) {
            if (typeof value === 'object' && Array.isArray(value)) check = true;
            else if (value == '[]') check = true;
            else check = false;

            if (check) this.value = new ArrayConstructor();
        }

        else if (['Buffer', 'buffer'].includes(type)) {
            if (typeof value === 'object' && !Array.isArray(value)) check = true;
            else if (value == '{}') check = true;
            else if (Type.check('int', value)) check = true;
            else check = false;
            
            if (check) {
                const buffer = new BufferConstructor();
                if (Type.check('int', value)) this.value = buffer.__new__({ count: +value });
                else this.value = buffer;
            }
        }
        
        else if (['RegExpr', 'regexpr'].includes(type)) {
            check = typeof value === 'string' && Type.check('string', value) && [value[1] == '/' ? 1 : -1, value.slice(2).lastIndexOf('/')].every(condition => condition > -1);
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


// Create instances of the Type class with different types and regular expressions
Type.new('String', /'[^"]*'/); // Matches single quoted strings
Type.new('String', /"[^']*"/); // Matches double quoted strings
Type.new('Int', /(^[+-]?\d+$)/); // Matches integer numbers
Type.new('Float', /[/+-]?\d+(\.\d+)$/); // Matches floating point numbers
Type.new('Hex', /^0[xX][0-9a-fA-F]+/); // Matches hexadecimal numbers
Type.new('Bool', /true|false/); // Matches boolean values

Type.new('string', /'[^"]*'/); // Matches single quoted strings (case-insensitive)
Type.new('string', /"[^']*"/); // Matches double quoted strings (case-insensitive)
Type.new('int', /(^[+-]?\d+$)/); // Matches integer numbers (case-insensitive)
Type.new('float', /[/+-]?\d+(\.\d+)$/); // Matches floating point numbers (case-insensitive)
Type.new('hex', /^0[xX][0-9a-fA-F]+/); // Matches hexadecimal numbers (case-insensitive)
Type.new('bool', /true|false/); // Matches boolean values (case-insensitive)

module.exports = {
    Type
}