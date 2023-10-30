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


            static split(variable, args) {
                return variable?.value?.slice(1, -1)?.split(...args);
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