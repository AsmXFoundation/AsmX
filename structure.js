class Structure {
    static structures = [];

    /**
     * The function checks if a given line of code matches a specific pattern.
     * @param line - The input string that is being checked for a specific pattern.
     * @returns a boolean value (either true or false) depending on whether the input `line` matches
     * any of the patterns defined in the `structures` array.
     */
    static is(line) {
        let is = false;
         
        for (let structure of this.structures) {
            let pattern = new RegExp(`^\@[${structure[0].toLowerCase()}|${structure[0].toUpperCase()}]${structure.slice(1)}`);
            if (pattern.test(line)) is = true;
        }

        return is;
    }


    /**
     * The function extracts the name from a line starting with "@" in a JavaScript code.
     * @param line - The line parameter is a string that represents a line of code or text.
     * @returns The `getNameByLine` function is returning the first word after the "@" symbol in the
     * input `line` parameter. This assumes that the input `line` parameter starts with "@" followed by
     * a word.
     */
    static getNameByLine(line) {
        return line.match(/^\@(\w+)/);
    }


    /**
     * This function adds a new structure to an array of structures.
     * @param structurename - The parameter "structurename" is a variable that represents the name of a
     * structure that is being added to an array called "structures". The function "new" is adding the
     * structure name to the array.
     */
    static new(structurename) {
        this.structures.push(structurename);
    }
}


Structure.new('label');
Structure.new('unit');
Structure.new('subprogram');
Structure.new('enviroment');

module.exports = Structure;