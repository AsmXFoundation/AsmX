//===========================================================================================
//      The Kernel is responsible for loading and executing the functions in the Kernel
//===========================================================================================

const fs = require('fs');
const ProgressBar = require('progress');

const Parser = require('./parser');
const Color = require('./utils/color');
const Compiler = require('./compiler');
const { FileError } = require('./anatomics.errors');
const ServerLog = require('./server/log');
const { getTotalSize } = require('./fs');
const config = require('./config');
const Analysis = require('./analysis');
const Garbage = require('./garbage');

let argv  = process.argv;

log = (message, callback) => process.stdout.write(message, callback);

let progressBar = new ProgressBar(`[${Color.FG_CYAN}:bar${Color.RESET}] :percent :etas`, {
    complete: '#',
    incomplete: ' ',
    width: 20,
    total: 100
});

log('COMPILER AsmX \n');


/**
 * It asks a question, waits for the user to answer, and then calls a callback function with the
 * answer.
 * @param message - The message to display to the user.
 * @param callback - The function to call when the user has entered their answer.
 */
function question(message, callback) {
    log(message);
    let answer;
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on("data", function(data) {
        answer = data.toString();
        callback(answer.trim());
        process.stdin.destroy();
    });
}


class Fax {
    static news() {
        const faxs = {
            instructions: Object.getOwnPropertyNames(Parser),
            registers: Object.getOwnPropertyNames(Compiler),
            sentence: [
                '✨ The first version of the AsmX programming language was released on February 23, 2023\n',
                `The AsmX core size is ${Math.floor(getTotalSize('./') / (1024 * 1024))} megabytes (mb) \n`
            ],
        }

        faxs.instructions = faxs.instructions.filter(instruction => /parse\w+Statement/.test(instruction)).length;
        faxs.registers = faxs.registers.filter(register => /\$\w+/.test(register)).length;

        let randomize = (struct) => {
            let call = (structure) => Math.floor(Math.random()* (structure - 0) + 0);
            return (struct instanceof Object) ? call(Reflect.ownKeys(struct).length) : call(struct.length - 1);
        }

        let faxsKeys = Reflect.ownKeys(faxs);
        const fax = faxsKeys[randomize(faxs)];
        const tag = 'Fun faxs';
        ServerLog.newTag(tag, Color.FG_CYAN);

        if (fax == 'sentence' && Array.isArray(faxs[fax])) {
            const faxsV2 = faxs[fax];
            ServerLog.log(faxsV2[randomize(faxs[fax])], tag);
        } else {
            ServerLog.log(`fun fax: AsmX have ${faxs[fax]} ${fax}\n`, tag);
        }
    }
}

function callCompiler(pathfile) {
    if (pathfile.endsWith('.asmx') || pathfile.endsWith('.asmX') || pathfile.endsWith('.🚀')) {
        ServerLog.log(`COMPILING ${pathfile} FILE...\n`, 'Compiler');
        ServerLog.log('you can enable Server Log using `@Issue true` \n', 'Notify');
        Fax.news();

        let timer = setInterval(() => {
            progressBar.tick();
            if (progressBar.complete){
                new CompilerAsmX({ src: pathfile });
                clearInterval(timer); 
                if (config.INI_VARIABLES?.ANALYSIS) Analysis.protocol();
                if (config.INI_VARIABLES?.GARBAGE) Garbage.protocol();
            }
        }, 10);
    } else if (pathfile == "analysis") {
        ServerLog.log(`Status: ${config.INI_VARIABLES.ANALYSIS ? 'on' : 'off'}\n`, 'Info');
        question(`${Color.BRIGHT}[${Color.FG_GREEN}Question${Color.FG_WHITE}][y/n]: Are you sure you want to change? : ` , (answer) => {
            if (answer == "yes" || answer == "y") {
                config.print('ANALYSIS', !config.INI_VARIABLES.ANALYSIS);
                config.commit();
                console.log('Analysis: ' ,config.INI_VARIABLES.ANALYSIS);
            } else if (answer == "no" || answer == "n") {
                process.exit();
            }
        });
    } else if (pathfile == "garbage") {
        ServerLog.log(`Status: ${config.INI_VARIABLES.GARBAGE ? 'on' : 'off'}\n`, 'Info');
        question(`${Color.BRIGHT}[${Color.FG_GREEN}Question${Color.FG_WHITE}][y/n]: Are you sure you want to change? : ` , (answer) => {
            if (answer == "yes" || answer == "y") {
                config.print('GARBAGE', !config.INI_VARIABLES.GARBAGE);
                config.commit();
                console.log('Garbage: ' ,config.INI_VARIABLES.GARBAGE);
            } else if (answer == "no" || answer == "n") {
                process.exit();
            }
        });
    } else {
        new FileError({ message: FileError.FILE_EXTENSION_INVALID });
    }
}

if (argv.length == 2)  question('AsmX file compiler asmX ~' , (answer) => { callCompiler(answer); });
if (argv.length == 3) callCompiler(argv[2]);

class CompilerAsmX {
    constructor(config) {
        this.config = config;
        this.tokens = [];
        
        try {
            let file = fs.readFileSync(this.config.src, { encoding: 'utf8' });
            let parser = Parser.parse(file);
            new Compiler(parser);
        } catch (exception) {
            if (exception instanceof RangeError) {
                new Error('[StackException]: You must specify a range before calling this function');
            }

            // console.log(exception);

            new FileError({ message: FileError.FILE_NOT_FOUND });
        }
    }
}