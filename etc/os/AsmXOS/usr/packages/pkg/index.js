const fs = require('fs');
const ServerLog = require('../../../../../../server/log');

class CLI {
    static pkg() {
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const name = parameters[0];
            const flag = parameters[1];

            if ([name, flag].every(i => i == undefined)) {
                ServerLog.log("too many parameters\n", 'Exception');
            } else {
                if (flag && !['--is'].includes(flag)) ServerLog.log('flag not found\n', 'Exception');
                const isPkg = (name) => fs.existsSync(name);
                
                if (flag == '--is') {
                    if (/[a-zA-Z][a-zA-Z0-9_]+/.test(name)) {
                        ServerLog.log(isPkg(`${__dirname.slice(0, __dirname.lastIndexOf('\\'))}/${name}`) ? 'the package exists\n' : 'the package does not exist\n', 'Notify');
                    }
                }
            }
        }
    }
}

module.exports = CLI;