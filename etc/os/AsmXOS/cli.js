const kernelCli = require("../../../cli");
const { getDirs, printDirs, getFiles } = require("../../../fs");
const ServerLog = require("../../../server/log");
const fs = require('fs');
const Color = require("../../../utils/color");
const config = require("../../../config");


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
            } else if (this.cdPath == 'cide') {
                require('../../../tools/cide/cli').execute(['cide-cli', ...args]);
            }
        }
    }


    help() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
        const forgecolor = {};
        let theme;

        if (config.INI_VARIABLES?.CLI_THEME != 'common') {
            theme = require(`../../../etc/cli/theme/${config.INI_VARIABLES?.CLI_THEME}/theme.json`);
        } else theme = {};

        const edit = {
            separator: theme?.edit?.separator ? theme?.edit?.separator : '-'
        };

        for (const property of ['cli', 'title', 'document', 'command', 'params', 'flag', 'separator', 'argument']) {
            forgecolor[property] = (theme?.forgecolor)?.[property] ? Reflect.ownKeys(Color).slice(3).includes(`FG_${theme?.forgecolor[property]}`) ? Color[`FG_${theme?.forgecolor[property]}`] : theme?.forgecolor[property] : Color.FG_GRAY;
        }

        let cli = `${forgecolor?.cli || Color.FG_GRAY}cide-cli${Color.RESET}`;
        let doc = (text) => `${forgecolor.document}${text}${Color.RESET}`;
        let cmd = (text) => `${forgecolor.command}${text}${Color.RESET}`;
        let params = (text) => `${forgecolor.params}${text}${Color.RESET}`;
        let arg = (text) => `${forgecolor.argument}${text}${Color.RESET}`;
        let flag = (text) => `${forgecolor.flag}${text}${Color.RESET}`;
        let separator = (text) => `${forgecolor.separator}${text}${Color.RESET}`;

        function buildText(cli, command, separate, text, tabs, other = undefined) {
            return `${cli} ${cmd(command)} ${other || ''}${tabs ? '\t'.repeat(tabs) : '\t\t\t'}${separate ? separator(separate) : ''} ${text ? doc(text) : ''}`;
        }

        log(theme?.forgecolor?.text || Color.FG_GRAY);
        log(`USAGE:`);
        log(`-`.repeat(96));
        log(`${cli} [cmd] [options] -[flags] [options]`);
        log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to learn the basic about the OS', 2));
        log(buildText(cli, 'cli', edit.separator, 'The command allows you to navigate to the desired CLI', 2, `${arg('name')}`));
        log(buildText(cli, 'help', edit.separator, 'The command allows you to get a reference for the mini operating system'));
        log(buildText(cli, 'mkfile', edit.separator, 'The command allows you to create a file', 2, `${arg('./file')}`));
        log(buildText(cli, 'mkdir', edit.separator, 'The command allows you to create a folder', 2, `${arg('./name')}`));
        log(buildText(cli, 'cd', edit.separator, 'The command allows you to find out the path', 3));
        log(buildText(cli, 'cd', edit.separator, 'The command allows you to set the path', 2, `${arg('./path')}`));
        log(`FLAGS:`);
        log(`${flag('-ls')}`);
        log(`${flag('-c')}`);
        log(`${flag('-v')}`);
        log(`${`-`.repeat(96)}`);
        log(``);
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
        console.log(`\t\t\t\t\tui: ${config.INI_VARIABLES?.CLI_THEME || 'common (default)'}`);
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