class JavaScript {
    static modules = {};

    static set(name, modulename) {
        this.modules[name] = require(modulename);
    }


    static call(name, funcname, args) {
        if (args)
            return this.modules[name]?.[funcname]?.(...args);
        else
            return this.modules[name]?.[funcname]?.();
    }


    static isModule(name) {
        return Reflect.ownKeys(this.modules).includes(name);
    }
}

module.exports = JavaScript;