const { question } = require("readline-sync");
const Cli = require("./cli");
const Tokenize = require("./parser");
const cli = require("./cli");

class AsmXOS {
    type = 'AsmXOS';
    arch = 'AsmX';
    version = 'v1.0.0';

    constructor() {}
    
    boot() {  
        for (const item of this.__logo()) this.createStream('output', { text: item });
       while (1) while (1) this.connect();
    }


    __logo() { 
        return [
           `  /$$$$$$                          /$$   /$$        /$$$$$$   /$$$$$$ \n`,
           ` /$$__  $$                        | $$  / $$       /$$__  $$ /$$__  $$\n`,
           `| $$  \\ $$  /$$$$$$$ /$$$$$$/$$$$ |  $$/ $$/      | $$  \\ $$| $$  \\__/\n`,
           `| $$$$$$$$ /$$_____/| $$_  $$_  $$ \\  $$$$/       | $$  | $$|  $$$$$$ \n`,
           `| $$__  $$|  $$$$$$ | $$ \\ $$ \\ $$  >$$  $$       | $$  | $$ \\____  $$\n`,
           `| $$  | $$ \\____  $$| $$ | $$ | $$ /$$/\\  $$      | $$  | $$ /$$  \\ $$\n`,
           `| $$  | $$ /$$$$$$$/| $$ | $$ | $$| $$  \\ $$      |  $$$$$$/|  $$$$$$/\n`,
           `|__/  |__/|_______/ |__/ |__/ |__/|__/  |__/       \\______/  \\______/ \n`
                                                                                 
        ];
    }


    connect() {
        let isExit = true; 

        while (isExit) {
            let prompt = this.createStream('input', { text: ` ${cli.cd(1)} ~# ` }).trim();
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

const asmxOS = new AsmXOS();

module.exports = asmxOS;