const fs = require('fs');
const readline = require('readline');
const path = require('path');
const ProgressBar = require('progress');

const Parser = require('./parser');
const Color = require('./utils/color');
const Compiler = require('./compiler');

print = (message, callback) => process.stdout.write(message, callback);

let progressBar = new ProgressBar(`[${Color.FG_CYAN}:bar${Color.RESET}] :percent :etas`, {
    complete: '#',
    incomplete: ' ',
    width: 20,
    total: 100
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

print('COMPILER x64 asm');
rl.question('MarsX file compiler asmX ~' , (answer) => {
    print(answer);
    
    if (answer.endsWith('.asmx') || answer.endsWith('.asmX')) {
        print('\nCOMPILING asmX FILE...\n');

        let timer = setInterval(() => {
            progressBar.tick();
            progressBar.complete && new CompilerAsmX({ src: answer });
            progressBar.complete && clearInterval(timer);
        }, 10);

        rl.close();
    } else {
        print('\nINVALID EXTENSION FILE\n');
    }
});


class CompilerAsmX {
    constructor(config) {
        this.config = config;
        this.tokens = [];
        let file = fs.readFileSync(this.config.src, { encoding: 'utf8' });
        let parser = Parser.parse(file);
        new Compiler(parser);
    }
}