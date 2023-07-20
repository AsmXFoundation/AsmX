const { Type } = require("./types");

class Interface {
    static interfaces = [];
    static customs = [];

    /**
     * @param {object} IArguments interface types arguments. example { argumentName: T }
     * @param {string} structureType name structure type
     * @param {string} structureName structure name
     */
    static create(IArguments, structureType, structureName) {
        this.interfaces.push({ IArguments, structureType, structureName });
    }


    static createCustomInterface(obj, structureType, structureName) {
        this.customs.push({ obj, structureType, structureName });
    }
    

    static checkField(structure = { name, type }, fieldname, fieldvalue) {
        let i7e = Interface.getInterface(structure.type, structure.name);
        return Type.check(i7e?.IArguments[fieldname], fieldvalue);
    }


    static getInterface(structureType, structureName) {
        return this.interfaces.filter(iface => iface.structureType == structureType && iface.structureName == structureName)[0];
    }


    static getCustomInterface(structureType, structureName) {
        return this.customs.filter(iface => iface.structureType == structureType && iface.structureName == structureName)[0];
    }
}

module.exports = Interface;