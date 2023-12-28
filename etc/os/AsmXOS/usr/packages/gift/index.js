const ServerLog = require("../../../../../../server/log");
const Gift = require("../../../../../../utils/gift");

class CLI {
    static gift() {
        if (this.cli_args.slice(1).length > 1) { 
            ServerLog.log("not enough arguments / too many arguments or parameters", 'Exception');
            process.exit(1);
        }

        Gift.get();
        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }
}

module.exports = CLI;