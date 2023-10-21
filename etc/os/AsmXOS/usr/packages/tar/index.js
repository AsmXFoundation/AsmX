const path = require('path');
const { exec, execSync } = require('child_process');
const ServerLog = require('../../../../../../server/log');

class CLI {
    static tar() {
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            let path = parameters[0];
            let name = parameters[1];

            if ([path, name].every(i => i == undefined)) {
                ServerLog.log("too many parameters\n", 'Exception');
            } if (['--watch'].includes(name)) {
                if (name == '--watch') {
                    if (process.platform == 'win32' || process.platform == 'linux') {
                        if (!path.endsWith('.tar')) path += '.tar';
                        let response = execSync(`tar -tf ${path}`);
                        console.log(response.toString('utf8'));
                    }
                }
            } else {
                if (name == undefined) name = path + '.tar';
                if (name && !name.endsWith('.tar')) name += '.tar';
            
                if (process.platform == 'win32') {
                    exec(`tar -cvf ${name} ${path}`, (err, stdout, stderr) => {
                        if (stdout && stdout.length > 0) console.log(stdout);
                    });
                } else if (process.platform == 'linux') {
                    exec(`tar -c ${name} ${path}`, (err, stdout, stderr) => {
                        if (stdout && stdout.length > 0) console.log(stdout);
                    });
                }
            }
        }
    }
}

module.exports = CLI;