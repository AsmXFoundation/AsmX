const readline = require('readline-sync');

/** 
 *  This class is a placeholder for the platform specific implementation of the input/output functionality 
**/
class PlatformIO {}

class FlowInput extends PlatformIO {
    constructor() {
        super();
    }


    /**
     * It takes a string as an argument and returns a function that takes a string as an argument and returns a string.
     * @param text - The text to display to the user.
     * @returns The readline.question() method is being returned.
     */
    static createInputStream(text) {
        return readline.question(text || '> ');
    }
}


class FlowOutput extends PlatformIO {
    constructor() {
        super();
    }


    /**
     * It takes a string as an argument and writes it to the console.
     * @param text - The text to be written to the output stream.
     */
    static createOutputStream(text) {
        console.log(text);
    }
}


module.exports = {
    FlowInput: FlowInput,
    FlowOutput: FlowOutput
}