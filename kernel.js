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

question('AsmX file compiler asmX ~' , (answer) => {
    if (answer.endsWith('.asmx') || answer.endsWith('.asmX')) {
        ServerLog.log(`COMPILING ${answer} FILE...\n`, 'Compiler');
        ServerLog.log('you can enable Server Log using `@Issue true` \n', 'Notify');

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
            // console.log(e);
        }
    }
}