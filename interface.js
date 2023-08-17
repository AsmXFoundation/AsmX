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
    

    static getIndex() {
        return this.interfaces.length - 1;
    }


    static getIndexByType(structureType) {
        return this.interfaces.filter(iface => iface.structureType == structureType).length - 1;
    }


    static getInterfaceByIndex(structureType, structureName, index) {
        return this.getInterfaces(structureType, structureName)[index];
    }


    static checkField(structure = { name, type }, fieldname, fieldvalue) {
        let i7e = Interface.getInterface(structure.type, structure.name);
        return Type.check(i7e?.IArguments[fieldname], fieldvalue);
    }


    static getInterfaces(structureType, structureName) {
        return this.interfaces.filter(iface => iface.structureType == structureType && iface.structureName == structureName);
    }


    static getInterface(structureType, structureName) {
        return this.getInterfaces(structureType, structureName)[0];
    }


    static getInterface(structureType, structureName) {
        let i7es = this.getInterfaces(structureType, structureName);
        return i7es[i7es.length - 1];
    }

    
    static getCustomInterfaces(structureType, structureName) {
        return this.customs.filter(iface => iface.structureType == structureType && iface.structureName == structureName);
    }
    

    static getCustomInterface(structureType, structureName) {
        return this.getCustomInterfaces(structureType, structureName)[0];
    }


    static getLastCustomInterface(structureType, structureName) {
        let i7es = this.getCustomInterfaces(structureType, structureName);
        return i7es[i7es.length - 1];
    }


    static getFirstCustomInterface(structureType, structureName) {
        return this.getCustomInterface(structureType, structureName);
    }


    static getCustomIndexByType(structureType) {
        return this.customs.filter(iface => iface.structureType == structureType).length - 1;
    }


    static getCustomInterfaceByIndex(structureType, structureName, index) {
        return this.getCustomInterfaces(structureType, structureName)[index];
    }
    

    static getCustomIndex() {
        return this.customs.length - 1;
    }
}

module.exports = Interface;