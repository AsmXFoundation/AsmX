class Structure {
    static structures = [];

    static is(line) {
        let is = false;
         
        for (let structure of this.structures) {
            let pattern = new RegExp(`^\.[${structure[0].toLowerCase()}|${structure[0].toUpperCase()}]${structure.slice(1)}`);
            if (pattern.test(line)) is = true;
        }

        return is;
    }

    static getNameByLine(line) {
        return line.match(/^\.(\w+)/);
    }

    static new(structurename) {
        this.structures.push(structurename);
    }
}


Structure.new('section');

module.exports = Structure;