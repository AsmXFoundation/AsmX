// kernel -> code -> micro -> kernel run
const { MicroParser } = require("./parser");
const { exec } = require('child_process');
const Color = require('../utils/color');
const Cli = require("../cli");
const fs = require("fs");


class Micro {
    constructor(source) {
        this.source = source;
        this.mode = 'micro';
        if (this.source == undefined) this.mode = 'cli';

        if (this.source == undefined || this.mode == 'cli') {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdout.write(`${Color.FG_CYAN}root@micro $${Color.FG_WHITE} `);
            process.stdin.read();

            process.stdin.on('data', (data) => {
                new Micro(MicroParser.parse(data.trim()));
                process.stdout.write(`${Color.FG_CYAN}root@micro $${Color.FG_WHITE} `);
            });

            this.mode = 'micro';
        } else {
            if (Array.isArray(this.source)) {
                for (let index = 0; index < this.source.length; index++) {
                    const trace = this.source[index];
                    let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                    this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                }
            }
        }
    }


    static run(source) {
        this.source = source;
        this.mode = 'micro';
        if (this.source == undefined) this.mode = 'cli';

        if (this.source == undefined || this.mode == 'cli') {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdout.write(`${Color.FG_CYAN}root@micro $${Color.FG_WHITE} `);
            process.stdin.read();

            process.stdin.on('data', (data) => {
                new Micro(MicroParser.parse(data.trim()));
                process.stdout.write(`${Color.FG_CYAN}root@micro $${Color.FG_WHITE} `);
            });

            this.mode = 'micro';
        } else {
            if (Array.isArray(this.source)) {
                for (let index = 0; index < this.source.length; index++) {
                    const trace = this.source[index];
                    let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                    this.indexTrace = index;
                    this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                }
            }
        }
    }


    static compileSectionStatement(statement, index, trace) {
        const body = statement.slice(1);
        let sectionInfo = MicroParser._parseSectionStatement(statement[0])['section'];
        const [name, cli] = sectionInfo['name'].split('-');
        let buildCmds = [];
        let requestCmds = [];

        if (cli == 'cli') {
            for (const line of body) {
                let cmd = line.substring(0, line.indexOf(' '));
                let arg = line.substring(line.indexOf(' '));
                buildCmds.push({ cmd, arg });
            }

            if (['app', 'exe', 'arm'].includes(name)) {
                for (const line of buildCmds) {
                    // requestCmds.push(`asmx-cli ${line.cmd} ${line.cmd == 'run' ? '' : name} ${line.arg}`);
                    requestCmds.push({ cli: 'asmx-cli', args: [line.cmd, name, line.arg] })
                }
            }

            for (const cmd of requestCmds) {
                let pathResolve = __dirname.slice(0, __dirname.lastIndexOf('\\'));
                pathResolve = pathResolve.slice(0, pathResolve.lastIndexOf('\\'));

                this.source[index]['section'][1] = null;
                this.source[index]['section'] = this.source[index]['section'].filter(t => t);
                let cm = `${cmd.cli} ${cmd.args.join(' ')}`.toString().split(' ').filter(t => t !== '');
                Micro.run(this.source.slice(index));

                Cli.execute(cm);
            }

        } else {
            process.stdout.write('Not found `cli` signature');
            process.exit(1);
        }
    }


    static compileMsgStatement(statement, index, trace) {
        console.log(statement.message);
    }


    static compilePrintStatement(statement, index, trace) {
        process.stdout.write(statement.message);
    }


    static compileExitStatement(statement, index, trace) {
        process.exit(1);
    }


    static compileDelayStatement(statement, index, trace) {
        setTimeout(() => {}, Number(statement.time));
    }


    static compileTarStatement(statement, index, trace) {
        let name = statement.name;
        let archive = statement.archive;
 
        if (process.platform == 'win32') {
            exec(`tar -cvzf ${name} ${archive}`, (err, stdout, stderr) => {
                if (stdout && stdout.length > 0) console.log(stdout);
            });
        } else if (process.platform == 'linux') {
            exec(`tar -c ${name} ${archive}`, (err, stdout, stderr) => {
                if (stdout && stdout.length > 0) console.log(stdout);
            });
        }
    }
}



if (process.argv[2] == 'asmx-cli') {
    if (process.argv[3] == 'micro') {
        process.argv[4] && Micro.run(MicroParser.parse(fs.readFileSync(process.argv[4], { encoding: 'utf8' })));
    }
}


module.exports = Micro;