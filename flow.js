const readline = require('readline-sync');
const fs = require("fs");

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
        return readline.question(text == '' ? '> ' : text);
    }


    /**
     * It reads a file and returns the contents of the file as a string
     * @param path - The path to the file you want to read.
     * @returns The file contents.
     */
    static createFileInputStream(path) {
        return fs.readFileSync(path, 'utf8');
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


    /**
     * It creates a file output stream.
     * @param path - The path to the file to be created.
     * @param text - The text to write to the file.
     */
    static createFileOutputStream(path, text) {
        fs.writeFileSync(path, text, { encoding: 'utf8' });
    }
}


module.exports = {
    FlowInput: FlowInput,
    FlowOutput: FlowOutput
}