const fs = require('fs');
const os = require("os");

const kernelCli = require("../../../cli");
const { getDirs, printDirs, getFiles, getFileSize, sizeBytes } = require("../../../fs");
const ServerLog = require("../../../server/log");
const Color = require("../../../utils/color");
const config = require("../../../config");
const { exec, execSync } = require('child_process');
const Theme = require('../../../tools/theme');


class Cli {
    static flagUsage = true;
    static commandUsage = true;
    static counter = 0;
    static beforeCounter = 0;
    static isexit = false;
    static cli_args = []; 
    static root = 'root';
    static separateCD = '@';
    static cdPath = 'asmxOS';

    flagUsage = true;
    commandUsage = true;
    counter = 0;
    beforeCounter = 0;
    isexit = false;
    cli_args = [];
    root = 'root';
    separateCD = '@';
    cdPath = 'asmxOS';

    variable = {
        $SHELL: 'AsmX OS',
        $PATH: '',
        $OSTYPE: 'AsmX OS',
        $HOME: 'usr/',
        $MEM: os.freemem().toString()
    }

    //============================================================================================
    // Main function
    //============================================================================================
    execute(args) {
        args = args.filter(t => t.trim() !== '');
        this.cli_args = args;
        const HISTORY_PATH = `${__dirname}/usr/.history`;

        if (!fs.existsSync(HISTORY_PATH)) {
            fs.mkdirSync(HISTORY_PATH);
        } else {
            if (new Date().getHours() >= 22) fs.writeFileSync(HISTORY_PATH, '');
            let currentContent = fs.readFileSync(HISTORY_PATH).toString('utf8');
            fs.writeFileSync(HISTORY_PATH, `${currentContent}\n${args.join(' ')}`);
        }

        let isRoot = (this.pwdConfig ? this.pwdConfig?.root ? this.pwdConfig?.root : this.root : this.root) == 'root';

        const OPERATOR_AND = args.indexOf('&&');

        if (OPERATOR_AND > -1) {
            let cmds = [];
            let i = 0;
            let answer = [];

            for (const arg of args) {
                if (arg == '&&') i++;
                if (cmds[i] == undefined) cmds[i] = [];
                if (arg != '&&') cmds[i].push(arg);
            }

            for (const thread of cmds) answer.push(this.execute(thread));

            return {
                response: answer.filter(Boolean),
                type: 'thread'
            }
        } else {
            if (isRoot) {
                let flags = ['ls', 'graph', 'o', 'v', 'c'];

                let packages = getDirs(`${__dirname}/usr/packages`);
                let packagesCommands = [];
                for (const pkg of packages) packagesCommands.push({ name: pkg, commands: Reflect.ownKeys(require(`${__dirname}/usr/packages/${pkg}/index`)).filter(p => !['length', 'name', 'prototype'].includes(p)) });

                for (const argument of args) {
                    this.beforeCounter++;
                    if (this.isexit) process.exit(1);

                if (Reflect.ownKeys(this.variable).includes(argument)) {
                    if (args.length > 1) ServerLog.log(`${argument} is not a command \n`, 'Exception');
                    else return this.variable[argument];
                }

                    if (!flags.includes(argument.slice(1)))
                    if (this.counter == 0 && flags.includes(argument.slice(1)))
                        throw { error: 'Invalid argument ' + argument + ' in command ' };

                    if (Object.getOwnPropertyNames(Cli.prototype).includes(argument)) {
                        return this[argument]();
                    } else {
                        for (const pkg of packagesCommands)
                            if (pkg.commands.includes(argument)) return require(`${__dirname}/usr/packages/${pkg.name}/index`)[argument]['call'](this);
                    }

                    if (this.counter >= 1) {
                        if (this.flagUsage == false || this.commandUsage == false) console.log('Unexpected argument ' + argument);
                    }

                    if (flags.includes(argument.slice(1))) this[argument.slice(1)]();
                    this.counter++;
                }

                if (this.counter == 0) console.log('get more information: asmx-cli usage');
            } else if (this.root == 'cli') {
                if (this.cdPath == 'asmx') {
                    kernelCli.execute(['asmx-cli', ...args]);
                } else if (this.cdPath == 'cide') {
                    require('../../../tools/cide/cli').execute(['cide-cli', ...args]);
                } else if (this.cdPath == 'app') {
                    require('../../../bin/app/cli').execute(['app-cli', ...args]);
                } else if (this.cdPath == 'apm') {
                    require('../../../tools/apm/cli').execute(['apm-cli', ...args]);
                }
            }
        }
    }


    help() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
        log(Color.FG_GRAY);
        let cli = `asmxos-cli`;
        log(`USAGE:`);
        log(`-`.repeat(96));
        log(`${cli} [cmd] [options] -[flags] [options]`);
        Theme.setCallbackPrint(log);
        Theme.print(cli, 'neofetch', 'The command allows you to learn the basic about the OS', 2);
        Theme.print(cli, 'neofetch', 'The command allows you to learn the basic about the OS', 1, { flag: '--help' });
        Theme.print(cli, 'history', 'The command allows you to find out the history of requests', 2);
        Theme.print(cli, 'cli', 'The command allows you to navigate to the desired CLI', 2, { arg: 'name' });
        Theme.print(cli, 'doge', 'The command allows you to display the contents of the file', 2, { arg: 'name' });
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages', 2);
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages', 2, { flag: '-ls' });
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages with a lot of information', 1, { flag: '-info' });
        Theme.print(cli, 'help', 'The command allows you to get a reference for the mini operating system', 2);
        Theme.print(cli, 'touch', 'The command allows you to create a file', 1, { arg: 'name' });
        Theme.print(cli, 'leaf', 'The command allows you to create a text file', 1, { arg: 'name' });
        Theme.print(cli, 'mkdir', 'The command allows you to create a folder', 2, { arg: './name' });
        Theme.print(cli, 'colors', 'The command allows you to get colors', 2);
        Theme.print(cli, 'cd', 'The command allows you to find out the path', 3);
        Theme.print(cli, 'cd', 'The command allows you to set the path', 2, { arg: './path' });
        log(`-`.repeat(96) + '\n');
    }


    history() {
        const parameters = this.cli_args.slice(1);
        const HISTORY_PATH = `${__dirname}/usr/.history`;
        const flag = parameters[0];

        if (parameters.length > 1) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const content_t = () => fs.readFileSync(HISTORY_PATH).toString('utf8').split('\n');
            const existHistory = (cb) => { if (fs.existsSync(HISTORY_PATH)) cb() };

            if (flag) {
                if (['--unique', '--count'].includes(flag)) {
                    if (flag == '--unique') {
                        let list = new Set();
                        existHistory(_ => content_t().map(line => list.add(line)));
                        list.forEach(item => console.log(item));
                        list.clear();
                    } else if (flag == '--count') {
                        existHistory(_ => console.log(String(content_t().length)));
                    }
                } else
                    ServerLog.log('flag not found', 'Exception');
            } else {
                existHistory(_ => content_t().map(line => console.log(line)));
            }
        }
    }


    packages() {
        const parameters = this.cli_args.slice(1);
        let packages = getDirs(`${__dirname}/usr/packages`);

        if (parameters.length == 0) {
            for (const pkg of packages) console.log(`${pkg}.pkg`);
        } else {
            const flag = parameters[0];
            const flags = ['-ls', '-info'];

            if (flags.includes(flag)) {
                if (flag == '-ls') {
                    for (const pkg of packages) console.log(` ${pkg}.pkg`);
                } else if (flag == '-info') {
                    for (const pkg of packages)
                        console.log(` \x1b[38;5;45m/usr/packages/${pkg}/\x1b[38;5;0m      \x1b[38;5;44m${pkg}.pkg\x1b[38;5;0m    ${pkg}       (.pkg)     ${getFileSize(`${__dirname}/usr/packages/${pkg}/index.js`)}`);
                }
            } else {
                ServerLog.log('flag not found', 'Exception');
            }
        }
    }


    doge() {
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 3) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const file = parameters[0];
            const path = `${__dirname}/${this.variable['$HOME']}${file}`;
            const encodeList = ['utf8', 'utf-8', 'hex', 'base64', 'binary', 'utf16le', 'ucs2', 'ucs-2', 'ascii', 'base64url', 'latin1'];
            const encodeFlag = parameters[1] == '--encode';
            const encode = parameters[2];
            if (fs.existsSync(path)) return fs.readFileSync(path).toString(encodeFlag ? encodeList.includes(encode) ? encode : 'utf8' : 'utf8');
        }
    }


    grep() {
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 3) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const file = parameters[0];
            const path = `${__dirname}/${this.variable['$HOME']}${file}`;
            let template, flag;

            if (['--count', '-l', '--help'].includes(parameters[1])) {
                flag = parameters[1];
                template = parameters.slice(2);
            } else template = parameters.slice(1);

            if (fs.existsSync(path)) {
                let content = fs.readFileSync(path).toString();
                let answer = [];

                if (flag == '--count') {
                    let count = 0;

                    content.split('\n').forEach(line => {
                        if (line.matchAll(new RegExp(template, 'g')))
                            for (const token of line.matchAll(new RegExp(template, 'g'))) count += token[0] ? 1 : 0;
                    });

                    return String(count);
                }

                for (const line of content.split('\n')) {
                    answer.push(new RegExp(template, 'g').test(line) ? line.replaceAll(template, (v) => `\x1b[38;5;231m${v}\x1b[0m`) : flag == '-l' ? false : line);
                }

                answer = answer.filter(Boolean);
                return answer.join('\n');
            }
        }
    }


    pwd() {
        const parameters = this.cli_args.slice(1);
        const flag = parameters[0];

        if (parameters.length > 1) {
            ServerLog.log("too many parameters", 'Exception');
        } else {
            if (flag) {
                if (['--hide', '--visible'].includes(flag)) {
                    if (flag == '--hide') {
                        if (this.pwdConfig == undefined) {
                            this.pwdConfig = {
                                root: this.root,
                                separateCD: this.separateCD,
                                cdPath: this.cdPath
                            }

                            this.root = '';
                            this.separateCD = '';
                            this.cdPath = '';
                        }
                    } else if (flag == '--visible') {
                        if (this.pwdConfig) {
                            this.root = this.pwdConfig.root;
                            this.separateCD = this.pwdConfig.separateCD;
                            this.cdPath = this.pwdConfig.cdPath;
                            this.pwdConfig = undefined;
                        }
                    }
                } else {
                    ServerLog.log('flag not found\n', 'Exception');
                }
            } else {
                let conf;
                if (fs.existsSync('etc/config/neofetch.conf')) conf = JSON.parse(fs.readFileSync('etc/config/neofetch.conf').toString('utf8'));
                let cd = `${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.root}\x1b[0m${this.separateCD}${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.cdPath}\x1b[0m`;
                return cd;
            }
        }
    }


    cd(path) {
        if (typeof path === 'number') {
            let conf;
            if (fs.existsSync('etc/config/neofetch.conf')) conf = JSON.parse(fs.readFileSync('etc/config/neofetch.conf').toString('utf8'));
            let cd = `${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.root}\x1b[0m${this.separateCD}${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.cdPath}\x1b[0m`;
            return cd;
        } else {
            const parameters = this.cli_args;
            const path = parameters[1];

            if (parameters.length > 2) {
                ServerLog.log("too many parameters", 'Exception');
            } else if (path) {
                this.cdPath = path;
            } else {
                let conf;
                if (fs.existsSync('etc/config/neofetch.conf')) conf = JSON.parse(fs.readFileSync('etc/config/neofetch.conf').toString('utf8'));
                let cd = `${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.root}\x1b[0m${this.separateCD}${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.cdPath}\x1b[0m`;
                return cd;
            }
        }
    }


    mkdir() {
        const parameters = this.cli_args;
        const path = parameters[1];

        if (parameters.length > 2) {
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            if (this.root == 'root' && this.cdPath == 'miniOS') {
                fs.mkdir(__dirname + '/usr/' + path, () => { });
            } else fs.writeFile(path, ' ', () => { });
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    touch() {
        const parameters = this.cli_args;
        const path = parameters[1];

        if (parameters.length > 2) {
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                fs.writeFile(__dirname + '/usr/' + path, ' ', () => { });
            } else fs.writeFile(path, ' ', () => { });
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd; 
        }
    }


    leaf() {
        const parameters = this.cli_args.slice(1);
        let path = parameters[0];
        
        if (parameters.length > 1) {
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            if (path.endsWith('.')) path += 'txt';
            else if (!path.endsWith('.txt')) path += '.txt';

            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                fs.writeFile(__dirname + '/usr/' + path, ' ', () => { });
            } else fs.writeFile(path, ' ', () => { });
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
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 1) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const flag = parameters[0];
            const flags = ['--colors', '--info', '--logo', '--help', '--left', '--right'];
            const log = (text) => console.log(`\t\t\t\t\t${text}`);

            function colors() {
                log('');
                let stansartsColor = '';
                for (let index = 0; index < 8; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                log(stansartsColor);

                stansartsColor = '';
                for (let index = 8; index < 8 * 2; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                log(stansartsColor);
                log('');
            }


            function infoMatrix() {
                let matrix = [];
                let conf;
                if (fs.existsSync('etc/config/neofetch.conf')) conf = JSON.parse(fs.readFileSync('etc/config/neofetch.conf').toString('utf8'));

                matrix.push(`${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.root}\x1b[0m${this.separateCD}${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.cdPath}\x1b[0m`);
                matrix.push('-'.repeat(18));

                let info_t = {
                    OS: 'AsmX OS',
                    Kernel: 'AsmX Kernel',
                    Architecture: 'AsmX',
                    Uptime: Math.floor(os.uptime() / 60 / 60) + ' mins',
                    Packages: getDirs(`${__dirname}/usr/packages`)?.length + ' (.pkg)',
                    Shell: this.variable.$SHELL,
                    Theme: config.INI_VARIABLES?.CLI_THEME || 'common (default)',
                    CPU: os.cpus()[0]['model']
                }


                for (const property_t of Reflect.ownKeys(info_t)) {
                    matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}${property_t}\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${info_t[property_t]}\x1b[0m`);
                }


                if (process.platform == 'win32') {
                    let gpu = execSync('wmic path win32_VideoController get name');
                    matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}GPU\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${gpu.toString('utf8').split('\n')[1].trim()}\x1b[0m`);
                }


                matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}Memory\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${sizeBytes(os.freemem())}\x1b[0m`);
                return matrix;
            }


            function logoMatrix() {
                return [
                    '             \\##\\     /#      ',
                    '              \\##\\   /#/      ',
                    '               \\##\\ /#/       ',
                    '                \\#/v#/        ',
                    '                 /##/         ',
                    '                /##/ _        ',
                    '              /###/ /#\\       ',
                    '             /###/  \\##\\      ',
                    '            /###/    \\##\\     ',
                    '           /###/      \\##\\    '
                ]
            }


            function help() {
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

                let cli = `${forgecolor?.cli || Color.FG_GRAY}${Color.RESET}`;
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
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to display complete information about the OS', 3));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to learn the basic about the OS', 2, flag('--help')));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to output information about the OS', 2, flag('--info')));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to display only the OS logo', 2, flag('--logo')));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to output only standard and dark OS colors', 2, flag('--colors')));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to display the left part of the information about the operating system', 2, flag('--left')));
                log(buildText(cli, 'neofetch', edit.separator, 'The command allows you to display the right part of the information about the operating system', 2, flag('--right')));
            }


            if (flags.includes(flag)) {
                if (flag == '--colors') {
                    colors();
                } else if (['--logo', '--left'].includes(flag)) {
                    for (const line of logoMatrix()) console.log(line);
                } else if (flag == '--info') {
                    for (const line of infoMatrix.call(this)) log(line);
                } else if (flag == '--help') {
                    help();
                } else if (flag == '--right') {
                    for (const line of infoMatrix.call(this)) log(line);
                    colors();
                }
            } else if (flag == undefined) {
                function printTable(left, right) {
                    let max = Math.max(left.length, right.length);
                    for (let index = 0; index < max; index++) console.log(`${left[index] ? left[index] : right[index] ? ' '.repeat(Math.max(...logoMatrix().map(s => s.length))) : ''}          ${right[index] ? right[index] : ''}`);
                }
                
                printTable(logoMatrix(), infoMatrix.call(this));
                colors();
            } else {
                ServerLog.log('flag not found\n', 'Exception');
            }
        }
    }


    colors() {
        const log = (text) => console.log(`\t\t\t\t\t${text}`);
        log('');
        let stansartsColor = '';
        for (let index = 1; index < 255; index++) stansartsColor += `\x1b[38;5;${String(index)}m ${index} \x1b[0m`;
        log(stansartsColor);
        log('');
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