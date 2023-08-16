const kernelCli = require("../../../cli");
const { getDirs, printDirs, getFiles } = require("../../../fs");
const ServerLog = require("../../../server/log");
const fs = require('fs');


class Cli {
    static flagUsage = true;
    static commandUsage = true;
    static doctorData = null;
    static counter = 0;
    static beforeCounter = 0;
    static isexit = false;
    static cli_args = [];
    static root = 'root';
    static separateCD = '@';
    static cdPath = 'asmxOS';

    flagUsage = true;
    commandUsage = true;
    doctorData = null;
    counter = 0;
    beforeCounter = 0;
    isexit = false;
    cli_args = [];
    root = 'root';
    separateCD = '@';
    cdPath = 'asmxOS';

    //============================================================================================
    // Main function
    //============================================================================================
    execute(args) {
        this.cli_args = args;

        if (this.root == 'root') {
            let flags = ['ls', 'graph', 'o', 'v', 'c'];

            for (const argument of args) {
                this.beforeCounter++;
                if (this.isexit) process.exit(1);

                if (!flags.includes(argument.slice(1)))
                if (this.counter == 0 && flags.includes(argument.slice(1)))
                    throw { error: 'Invalid argument ' + argument + ' in command ' };
        
                if (Object.getOwnPropertyNames(Cli.prototype).includes(argument)) return this[argument]();

                if (this.counter >= 1) {
                    if(this.flagUsage == false || this.commandUsage == false) console.log('Unexpected argument ' + argument);
                }

                if (flags.includes(args[1])) this[args[1]]();
                this.counter++;
            }

            if (this.counter == 0) console.log('get more information: asmx-cli usage');
        } else if (this.root == 'cli') {
            if (this.cdPath == 'asmx') {
                kernelCli.execute(['asmx-cli', ...args]);
            }
        }
    }


    cd() {
        const parameters = this.cli_args;
        const path = parameters[1];

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            this.cdPath = path;
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    mkdir() {
        const parameters = this.cli_args;
        const path = parameters[1];

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            if (this.root == 'root' && this.cdPath == 'miniOS') {
                fs.mkdir(__dirname + '/usr/' + path, () => {});
            } else fs.writeFile(path, ' ', () => {});
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    mkfile() {
        const parameters = this.cli_args;
        const path = parameters[1];

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            if (this.root == 'root' && this.cdPath == 'miniOS') {
                fs.writeFile(__dirname + '/usr/' + path, ' ', () => {});
            } else fs.writeFile(path, ' ', () => {});
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    cli() {
        const parameters = this.cli_args;

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
        } else if (parameters[1]) {
            this.root = 'cli';
            this.cdPath = parameters[1];
        } else {
            ServerLog.log('Insufficient number of arguments\n', 'Exception'); 
        }
    }


    neofetch() {
        console.log('\t\t\t\t\tarchitecture: AsmX');
        console.log('\t\t\t\t\tname os: AsmXOS');
        console.log('\t\t\t\t\tui: NeoUI');
    }


    //============================================================================================
    // CLI FLAGS
    //============================================================================================
    v() {
        process.stdout.write('AsmX v3.0');
        this.flagUsage = false;
        this.commandUsage = false;
    }


    c() {
        process.stdout.write('AsmXOS v1.0.0 ');
        console.log('\tAsmXOS Corporation. All rights reserved.');
        console.log('\t\tOpen source source: https://github.com/langprogramming-AsmX/AsmX');
        this.flagUsage = false;
        this.commandUsage = false;
    }

    ls() {
        if (this.root == 'root' && this.cdPath == 'asmXOS') {
            printDirs(getDirs(__dirname + '/usr'));
            printDirs(getFiles(__dirname + '/usr'));
        }
    }
    //============================================================================================
}

let cli = new Cli();

module.exports = cli;