class Engine {
    constructor() {
        this.instruction = []; // { name: String, data: callback }
        this.unit = []; // { name: String, data: callback }
    }


    registerInstruction(name, cb) {
        cb && this.instruction.push({ name: name.toLowerCase(), cb: cb });
    }


    hasInstruction(name) {
        return this.instruction.filter(instruction => instruction?.name == name).length > 0;
    }


    getInstruction(name) {
        return this.hasInstruction(name) && this.instruction.filter(instruction => instruction?.name == name);
    }


    changeRegister(name, value) {
        class Register {
            constructor(name, value) {
                this.name = name;
                this.value = value;
            }

            instance(){ return 'Register' };
        }

        return new Register(name, value);
    }


    callUnit(name, args) {
        class CallUnit {
            constructor(name, args) {
                this.name = name;
                this.args = args;
            }

            instance(){ return 'CallUnit' };
        }

        return new CallUnit(name, args);
    }


    callInstruction(name, data) {
        console.log(this.getInstruction(name));
    }


    registerUnit(name, cb) {
        cb && this.unit.push({ name, cb: cb });
    }

    return(value) {
        class Return {
            constructor(value) { this.value = value; }
            instance(){ return 'Return' };
        }

        return new Return(value);
    }

    hasUnit(name) {
        return this.unit.filter(unit => unit?.name == name).length > 0;
    }


    getUnit(name) {
        return this.hasUnit(name) && this.unit.filter(unit => unit?.name == name);
    }
}

const engine = new Engine();

module.exports = engine;