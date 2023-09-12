const { question } = require("readline-sync");
const ServerLog = require("../../../../../../server/log");

class CLI {
    static print() {
        console.log(this.cli_args.slice(1).join(' '));
    }


    static input() {
        const parameters = this.cli_args.slice(1);
        return question(parameters[0]);
    }


    static log() {
        ServerLog.log(this.cli_args.slice(1).join(' ') + '\n', 'Log');
    }
}

module.exports = CLI;