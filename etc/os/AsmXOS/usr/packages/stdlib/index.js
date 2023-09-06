const ServerLog = require("../../../../../../server/log");

class CLI {
    static print() {
        console.log(this.cli_args.slice(1).join(' '));
    }


    static log() {
        ServerLog.log(this.cli_args.slice(1).join(' ') + '\n', 'Log');
    }
}

module.exports = CLI;