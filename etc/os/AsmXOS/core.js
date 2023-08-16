const { question } = require("readline-sync");
const Cli = require("./cli");
const Tokenize = require("./parser");
const cli = require("./cli");

class MiniOS {
    type = 'MiniOS';
    arch = 'AsmX';
    version = 'v1.0.0';

    constructor() {}
    
    boot() {  
        for (const item of this.__logo()) this.createStream('output', { text: item });
       while (1) while (1) this.connect();
    }

    __logo() {
        return [
            '\t   _________________ \n',
            '\t  /                 \\\n',
            '\t /     ___________   \\\n',
            '\t|   /    _____    \\   |\n',
            '\t|__|   /      \\    |__|\n',
            '\t      |        |        \n',
            '\t      |        |        \n',
            '\t __    \\______/     __ \n',
            '\t|  |               |  |\n',
            '\t|   \\_____________/   |\n',
            '\t \\                   \/\n',
            '\t  \\_________________\/\n\n',
        ];
    }


    connect() {
        let isExit = true; 

        while (isExit) {
            let prompt = this.createStream('input', { text: ` ${cli.cd()} ~# ` }).trim();
            let answer = Cli.execute(prompt.split(' '));
            if (typeof answer == 'string') console.log(answer);
        }
    }


    createStream(type, data) {
        if (type == 'input') {
            return question(data?.text || '');
        } else if (type == 'output') {
            process.stdout.write(data?.text || '');
        }
    }
}

const miniOS = new MiniOS();

module.exports = miniOS;