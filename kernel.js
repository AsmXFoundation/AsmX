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
            registers: Object.getOwnPropertyNames(new Compiler([])),
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


question('AsmX file compiler asmX ~' , (answer) => {
    if (answer.endsWith('.asmx') || answer.endsWith('.asmX')) {
        ServerLog.log(`COMPILING ${answer} FILE...\n`, 'Compiler');
        ServerLog.log('you can enable Server Log using `@Issue true` \n', 'Notify');
        Fax.news();

        let timer = setInterval(() => {
            progressBar.tick();
            progressBar.complete && new CompilerAsmX({ src: answer });
            progressBar.complete && clearInterval(timer);
        }, 10);
    } else {
        new FileError({
            message: FileError.FILE_EXTENSION_INVALID
        })
    }
});


class CompilerAsmX {
    constructor(config) {
        this.config = config;
        this.tokens = [];
        
        try {
            let file = fs.readFileSync(this.config.src, { encoding: 'utf8' });
            let parser = Parser.parse(file);
            new Compiler(parser);
        } catch (e) {
            new FileError({ message: FileError.FILE_NOT_FOUND });
            console.log(e);
        }
    }
}