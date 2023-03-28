class Type {
    constructor(...types) {
        this.types = types;
    }

    new(type) {
        this.types.push({ name: type });
    }

    delete(type) {
        return this.types = this.types.filter(typeInList => typeInList.name === type);
    }
}


class Signature extends Type {

}


/* A class that is used to create a virtual machine. */
class LowLevelVirtualMachine {
    
}