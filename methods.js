const { Type } = require("./types");

class TypeMethod {
    static string() {
        return class {
            static slice(variable, args) {
                if (args.map(a => Type.check('int', a)).every(a => a == true)) {
                    const [start, end] = args.map(a => +a);
                    return variable?.value?.slice(1, -1)?.slice(start, end);
                }
            }

            static has(variable, args) {
                return variable?.value?.slice(1, -1)?.indexOf(Type.check('string', args[0]) ? args[0].slice(1, -1) : args[0]) > -1 ? true : false;
            }

            static index(variable, args) {
                return variable?.value?.slice(1, -1)?.indexOf(Type.check('string', args[0]) ? args[0].slice(1, -1) : args[0]);
            }

            static get(variable, args) {
                if (Type.check('int', args[0])) return variable?.value?.slice(1, -1)?.[+args[0]] ?? 'Void';
            }

            static hasSpace(variable, args) {
                return variable?.value?.slice(1, -1)?.indexOf(' ') > -1 ? true : false;
            }

            static hasInt(variable, args) {
                return /[0-9]/g.test(variable?.value?.slice(1, -1));
            }

            static hasChar(variable, args) {
                return /[a-zA-Z]/g.test(variable?.value?.slice(1, -1));
            }

            static hasSymbol(variable, args) {
                let symbols = [
                    '!', '@', '"', '\'', '$', 
                    ';', ':', 
                    '<', '>', '{', '}', '(', ')',
                    '+', '-', '*', '%', '/',
                    '?', '=', '.', ',', '^', '&', '|', '\\', '/', '#', '~', '`'
                ];

                let is = false;
                for (const char of symbols) if (is = variable?.value?.slice(1, -1).includes(char)) break;
                return is;
            }

            static split(variable, args) {
                return variable?.value?.slice(1, -1)?.split(...args);
            }

            static reverse(variable, args) {
                return variable?.value?.slice(1, -1)?.split('').reverse().join('');
            }

            static code(variable, args) {
                if (Type.check('int', args[0])) {
                    return variable?.value?.slice(1, -1)?.charCodeAt(+args[0]);
                }
            }


            static repeat(variable, args) {
                if (Type.check('int', args[0])) {
                    return variable?.value?.slice(1, -1)?.repeat(+args[0]);
                }
            }


            static trim(variable, args) {
                return variable?.value?.slice(1, -1)?.trim();
            }

            static upper(variable, args) {
                return variable?.value?.slice(1, -1)?.toUpperCase();
            }

            static lower(variable, args) {
                return variable?.value?.slice(1, -1)?.toLowerCase();
            }


            static title(variable, args) {
                let [str, ns, index] = [new String(variable?.value?.slice(1, -1)).valueOf(), '', 0];

                for (const char of str) {
                    ns += (index !== str.length - 1 && str[index - 1] == ' ') ? char.toUpperCase() : char; index++;
                }

                ns = ns[0].toUpperCase() + ns.slice(1);
                return ns;
            }


            static size(variable, args) {
                return variable?.value?.slice(1, -1)?.length;
            }
        }
    }
}

module.exports = TypeMethod;