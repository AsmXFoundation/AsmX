// This module exports the Structure class
class Structure {
    static structures = [];
    static isparses = {};

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
     * Checks if the given `structurename` is a valid parse.
     *
     * @param {type} structurename - The name of the structure to check.
     * @return {type} - Returns `true` if the `structurename` is a valid parse; otherwise, returns `false`.
     */
    static isParse(structurename) {
        return this.isparses[structurename];
    }


    /**
     * This function adds a new structure to an array of structures.
     * @param structurename - The parameter "structurename" is a variable that represents the name of a
     * structure that is being added to an array called "structures". The function "new" is adding the
     * structure name to the array.
     */
    static new(structurename, isParse = true) {
        this.structures.push(structurename);
        this.isparses[structurename] = isParse;
    }
}


// Create new structures
Structure.new('label'); // Represents a label
Structure.new('unit'); // Represents a unit
Structure.new('subprogram'); // Represents a subprogram
Structure.new('enviroment'); // Represents an environment
Structure.new('for'); // Represents a for loop
Structure.new('exception'); // Represents an exception
Structure.new('try'); // Represents a try block
Structure.new('struct'); // Represents a struct
Structure.new('enum'); // Represents an enum
Structure.new('collection'); // Represents a collection
Structure.new('tion'); // Represents a tion

//
Structure.new('class'); // Represents a class
Structure.new('method', false); // Represents a method with optional parameter 'false'
Structure.new('constructor', false); // Represents a constructor with optional parameter 'false'
Structure.new('destructor'); // Represents a destructor
//

Structure.new('event'); // Represents an event
Structure.new('namespace'); // Represents a namespace
Structure.new('coroutine'); // Represents a coroutine

Structure.new('task'); // Represents a task
Structure.new('todolist'); // Represents a todolist

module.exports = Structure;