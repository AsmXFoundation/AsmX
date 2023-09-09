const fs = require('fs');

const Compiler = require("../../../../../../compiler");
const Parser = require("../../../../../../parser");

class CLI {
    static asmx() {
        const parameters = this.cli_args.slice(1);
        let file = parameters[0];
        if (!file.endsWith('.asmx')) file += '.asmx';
        if (fs.existsSync(file)) new Compiler(Parser.parse(fs.readFileSync(file, { encoding: 'utf8' })));
    }
}

module.exports = CLI;