const readline = require('readline-sync');
const fs = require("fs");


class PlatformIO {}

class FlowInput extends PlatformIO {
    constructor() {
        super();
    }

    static createInputStream(text) {
        return readline.question(text == '' ? '> ' : text);
    }


    static createFileInputStream(path) {
        return fs.readFileSync(path, 'utf8');
    }
}


class FlowOutput extends PlatformIO {
    constructor() {
        super();
    }

    static createOutputStream(text) {
        console.log(text);
    }


    static createFileOutputStream(path, text) {
        fs.writeFileSync(path, text, { encoding: 'utf8' });
    }
}


module.exports = {
    FlowInput: FlowInput,
    FlowOutput: FlowOutput
}