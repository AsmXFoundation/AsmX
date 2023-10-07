const fs = require('fs');
const os = require("os");

const kernelCli = require("../../../cli");
const { getDirs, printDirs, getFiles, getFileSize, sizeBytes } = require("../../../fs");
const ServerLog = require("../../../server/log");
const Color = require("../../../utils/color");
const config = require("../../../config");
const { exec, execSync } = require('child_process');
const Theme = require('../../../tools/theme');
const Neofetch = require('./neofetch');


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
    USER_DIRECTORY_NAME = 'usr';

    variable = {
        $SHELL: 'AsmX Shell (.ash)',
        $PATH: '',
        $OSTYPE: 'AsmX OS',
        $HOME: `${this.USER_DIRECTORY_NAME}/`,
        $MEM: os.freemem().toString()
    }

    userVariable = {}
    userConstant = {}

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
        const OPERATOR_CHANNEL = args.indexOf('|');

        function execAnd(args) {
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
        }

        let bins = getDirs(`${__dirname}/${this.USER_DIRECTORY_NAME}/bin`);
        let binsPATH = this.variable.$PATH.split(';').filter(l => l.trim() != '');
        for (const bin of bins) if (!binsPATH.includes(`/bin/${bin}`)) this.variable.$PATH += `/bin/${bin};`;
    
        if (args[0].endsWith('.ash')) {
            let path;

            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                path = `${__dirname}/${this.USER_DIRECTORY_NAME}/${args[0]}`;
            } else if (this.root == 'root') {
                path = `${__dirname}/${this.cdPath}/${args[0]}`;
            }

            if (fs.existsSync(path)) {
                let sh = fs.readFileSync(path).toString('utf-8').split('\n');
                sh = sh.map(l => l.trim());

                if (sh.filter(l => l.trim() != '').length > 0) {
                    let isBin = sh[0].startsWith('!#/bin/');
                    let bin_t;
                    if (isBin) bin_t = sh[0].slice(sh[0].lastIndexOf('/') + 1);
                    bin_t = bin_t ? bin_t : 'asmx';
                    let source = sh.slice(isBin ? 1 : 0);

                    if (source.length > 0) {
                        if (fs.existsSync(`${__dirname}/${this.USER_DIRECTORY_NAME}/bin/${bin_t}/index.js`)) require(`${__dirname}/${this.USER_DIRECTORY_NAME}/bin/${bin_t}/index.js`).run(source.filter(l => l.trim() != ''));
                    }
                }
            }
        } if (OPERATOR_CHANNEL > -1) {
            let channels = [];
            let channelArguments = [];
            let i = 0;
            let channelIndex = 0;

            for (const arg of args) {
                if (arg == '|') i++;
                if (channels[i] == undefined) channels[i] = [];
                if (arg != '|') channels[i].push(arg);
            }

            let channel;

            for (const channel_t of channels) {
                if (channelIndex > 0) {
                    let isArguments = channel_t.findIndex(a => /\%\d+/.test(a));
                    
                    if (isArguments > -1) {
                        let lastChannelArguments = channelArguments[channelArguments.length - 1];

                        if (lastChannelArguments) {
                            if (typeof lastChannelArguments == 'string') {
                                lastChannelArguments = { '%1': lastChannelArguments };
                            } else if (lastChannelArguments instanceof Object) {
                                let idx = 0;
                                let obj_t = {};

                                if (lastChannelArguments?.response) {
                                    for (const argument_t of lastChannelArguments?.response) {
                                        obj_t[`%${idx}`] = argument_t;
                                        idx++;
                                    }
                                }

                                lastChannelArguments = obj_t;
                            }

                            channel = channel_t.map(ch => /\%\d+/.test(ch) ? lastChannelArguments[/(\%\d+)/.exec(ch)[1]] ? lastChannelArguments[/(\%\d+)/.exec(ch)[1]] : ch : ch);
                        }
                    }
                }

                // channel_t.indexOf('&&') > -1 ? channelArguments.push(execAnd.call(this, channel_t)) : channelArguments.push(this.execute(channel_t));

                if (channel_t.indexOf('&&') > -1) {
                    channelArguments.push(execAnd.call(this, channel ? channel : channel_t)) 
                } else
                    channelArguments.push(this.execute(channel ? channel : channel_t));

                channel = undefined;
                channelIndex++;
            }

            channelArguments = channelArguments.filter(Boolean);
            return channelArguments[channelArguments.length - 1];
        } else if (OPERATOR_AND > -1) {
           return execAnd.call(this, args);
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
        Theme.print(cli, 'neofetch', 'The command allows you to get a reference for the neofetch command', 1, { flag: '--help' });
        Theme.print(cli, 'history', 'The command allows you to find out the history of requests', 2);
        Theme.print(cli, 'history', 'The command allows you to get a reference for the history command', 1, [{ flag: '--help' }]);
        Theme.print(cli, 'cli', 'The command allows you to navigate to the desired CLI', 2, { arg: 'name' });
        Theme.print(cli, 'doge', 'The command allows you to display the contents of the file', 2, { arg: 'name' });
        Theme.print(cli, 'grep', 'The command allows you to get a reference for the grep command', 2, [{ flag: '--help' }]);
        Theme.print(cli, 'pwd', 'The command allows you to get a reference for the pwd command', 2, { flag: '--help' });
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages', 2);
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages', 2, { flag: '-ls' });
        Theme.print(cli, 'packages', 'The command allows you to get a list of OS packages with a lot of information', 1, { flag: '--info' });
        Theme.print(cli, 'help', 'The command allows you to get a reference for the mini operating system', 2);
        Theme.print(cli, 'touch', 'The command allows you to create a file', 2, { arg: 'name' });
        Theme.print(cli, 'leaf', 'The command allows you to create a text file', 2, { arg: 'name' });
        Theme.print(cli, 'mkdir', 'The command allows you to create a folder', 2, { arg: './name' });
        Theme.print(cli, 'colors', 'The command allows you to get colors', 2);
        Theme.print(cli, 'clear', 'The command allows you to clear the terminal', 2);
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
                if (['--unique', '--count', '--help'].includes(flag)) {
                    if (flag == '--unique') {
                        let list = new Set();
                        existHistory(_ => content_t().map(line => list.add(line)));
                        list.forEach(item => console.log(item));
                        list.clear();
                    } else if (flag == '--count') {
                        existHistory(_ => console.log(String(content_t().length)));
                    } else if (flag == '--help') {
                        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
                        let cli = `asmxos-cli`;
                        Theme.setCallbackPrint(log);
                        Theme.print(cli, 'history', 'The command allows you to display the entire query history', 2);
                        Theme.print(cli, 'history', 'The command allows you to get a reference for the history command', 1, { flag: '--help' });
                        Theme.print(cli, 'history', 'The command allows you to output only unique queries', 1, { flag: '--unique' });
                        Theme.print(cli, 'history', 'The command allows you to output the number of requests', 1, { flag: '--count' });
                    }
                } else
                    ServerLog.log('flag not found\n', 'Exception');
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
            const flags = ['-ls', '--info', '--count'];

            if (flags.includes(flag)) {
                if (flag == '-ls') {
                    for (const pkg of packages) console.log(` ${pkg}.pkg`);
                } else if (flag == '--info') {
                    for (const pkg of packages)
                        console.log(` \x1b[38;5;45m/usr/packages/${pkg}/\x1b[38;5;0m      \x1b[38;5;44m${pkg}.pkg\x1b[38;5;0m    ${pkg}       (.pkg)     ${getFileSize(`${__dirname}/usr/packages/${pkg}/index.js`)}`);
                } else if (flag == '--count') {
                    return String(packages.length || 0);
                }
            } else {
                ServerLog.log('flag not found\n', 'Exception');
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
        let parameters = this.cli_args.slice(1);

        {
            if (parameters.indexOf('--text') > -1) {
                let str = parameters.slice(0, parameters.indexOf('--text')).join(' ');
                parameters = [str, ...parameters.slice(parameters.indexOf('--text'))];
            }

            const file = parameters[0];
            const path = `${__dirname}/${this.variable['$HOME']}${file}`;
            let template, flag;

            if (['--count', '-l', '--text'].includes(parameters[1])) {
                flag = parameters[1];
                template = parameters.slice(2);
            } else template = parameters.slice(1);

            if (parameters[0] == '--help') {
                let cli = 'asmxos-cli';
                let log = (message, params) => console.log(`\t${message}`, params ? params : '');
                Theme.setCallbackPrint(log);
                Theme.print(cli, 'grep', 'The command allows you to get a reference for the grep command', 4, { flag: '--help' });
                Theme.print(cli, 'grep', 'The command allows you to find lines in which there is a specified template [template] in the \'name\' file', 2, [{ arg: 'name' }, { arg: '[template]' }]);
                Theme.print(cli, 'grep', 'The command allows you to find the number of rows found in which there is a given template [template] in the \'name\' file', 1, [{ arg: 'name' }, { flag: '--count' }, { arg: '[template]' }]);
                Theme.print(cli, 'grep', 'The command allows you to output lines in which there is a specified template [template] in the \'name\' file', 2, [{ arg: 'name' }, { flag: '-l' }, { arg: '[template]' }]);

                Theme.print(cli, 'grep', 'The command allows you to output lines that have the specified template [template] in the text \'text\'', 2, [{ arg: 'text' }, { flag: '--text' }, { arg: '[template]' }]);
                Theme.print(cli, 'grep', 'The command allows you to output a string highlighting the matches found that have this template [template] in the text \'name\'', 1, [{ arg: 'text' }, { flag: '--text' }, { arg: '[template]' }, { flag: '-l' }]);
                Theme.print(cli, 'grep', 'The command allows you to find the number of matches found that have this template [template] in the text \'text\'', 1, [{ arg: 'text' }, { flag: '--text' }, { arg: '[template]' }, { flag: '--count' }]);
            } else if (flag == '--text') {
                let text = parameters[0].trim();
                let answer;
                let lastFlag = parameters[parameters.length - 1];

                if (typeof text == 'string') {
                    if (['-l', '--count'].includes(template[template.length - 1]))
                        template = template.slice(0, template.length - 1).join(' ');
                    else 
                        template = template.join(' ');

                    if (lastFlag == '--count') {
                        let count = 0;

                        if (text.matchAll(new RegExp(template, 'g')))
                            for (const token of text.matchAll(new RegExp(template, 'g'))) count += token[0] ? 1 : 0;

                        return String(count);
                    } else {
                        if (template.indexOf('\x1b') == -1) {
                            answer = new RegExp(template, 'g').test(text) ? text.replaceAll(template, (v) => `\x1b[38;5;231m${v}\x1b[0m`) : false;
                            if (lastFlag == '-l') return answer ? answer : text;
                            if (answer) return answer;
                        } else {
                            ServerLog.log('Escape character is not allowed\n', 'Exception');
                        }
                    }
                }
            } else if (fs.existsSync(path)) {
                let content = fs.readFileSync(path).toString();
                let answer = [];

                if (flag == '--count') {
                    let count = 0;

                    content.split('\n').forEach(line => {
                        if (line.matchAll(new RegExp(template, 'g')))
                            for (const token of line.matchAll(new RegExp(template, 'g'))) count += token[0] ? 1 : 0;
                    });

                    return String(count);
                } else if (flag == '-l') {
                    for (const line of content.split('\n'))
                        answer.push(new RegExp(template, 'g').test(line) ? line.replaceAll(template, (v) => `\x1b[38;5;231m${v}\x1b[0m`) : false);
                    
                } else if (flag == undefined) {
                    for (const line of content.split('\n'))
                        answer.push(new RegExp(template, 'g').test(line) ? line.replaceAll(template, (v) => `\x1b[38;5;231m${v}\x1b[0m`) : line);

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
                if (['--hide', '--visible', '--help'].includes(flag)) {
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
                    } else if (flag == '--help') {
                        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
                        let cli = `asmxos-cli`;
                        Theme.setCallbackPrint(log);
                        Theme.print(cli, 'pwd', 'The command allows you to output the full path from the root directory to the current working directory', 3);
                        Theme.print(cli, 'pwd', 'The command allows you to get a reference for the pwd command', 2, { flag: '--help' });
                        Theme.print(cli, 'pwd', 'The command allows you to hide the full path from the root directory to the current working directory', 2, { flag: '--hide' });
                        Theme.print(cli, 'pwd', 'The command allows you to make visible the full path from the root directory to the current working directory', 1, { flag: '--visible' });
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
            const parameters = this.cli_args.slice(1);
            let path = parameters[0];

            if (parameters.length > 1) {
                ServerLog.log("too many parameters", 'Exception');
            } else if (path) {
                if (this.root == 'root' && this.cdPath == 'asmxOS') {
                    if (fs.existsSync(`${__dirname}/${path}`)) this.cdPath = path;
                } else if (this.root == 'root') {
                    if (path.startsWith('../')) {
                        let pathFull = this.cdPath;

                        while (path.startsWith('../')) {
                            pathFull = pathFull.slice(0, pathFull.lastIndexOf('/'));
                            path = path.slice(path.indexOf('/') + 1);
                            if (pathFull == './usr') break;
                        }

                        path = `${pathFull}${path}`;
                        if (`${path[path.length - 2]}${path[path.length - 1]}` == '//') path = path.slice(0, -1);
                        let pathCheck = `${__dirname}${path[0] == '/' ? '' : `${path[0]}${path[1]}` == './' ? '/' : ''}${path}`;
                        if (fs.existsSync(pathCheck)) this.cdPath = path;
                    }

                    else if (fs.existsSync(`${__dirname}/${this.cdPath}${path[0] == '/' ? '' : '/'}${path}`)) this.cdPath += `${path[0] == '/' ? '' : '/'}${path}`;
                }
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
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                fs.mkdir(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`.trim(), () => { });
            } else if (this.root == 'root') {
                fs.mkdir(`${__dirname}/${this.cdPath}/${path}`.trim(), () => { });
            } else fs.mkdir(path, () => { });
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    touch() {
        let parameters = this.cli_args;
        parameters = [...parameters.slice(0, 2), parameters.slice(2).join(' ')];
        const path = parameters[1];
        const text = parameters[2]; 

        if (parameters.length > 3) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else if (path) {
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                fs.writeFileSync(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else if (this.root == 'root') {
                fs.writeFileSync(`${__dirname}/${this.cdPath}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else fs.writeFileSync(path, text ? text : '', { encoding: 'utf8' });
        } else {
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd; 
        }
    }


    leaf() {
        let parameters = this.cli_args.slice(1);
        parameters = [...parameters.slice(0, 1), parameters.slice(1).join(' ')];
        let path = parameters[0];
        const text = parameters[1];

        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else if (path) {
            if (path.endsWith('.')) path += 'txt';
            else if (!path.endsWith('.txt')) path += '.txt';

            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                fs.writeFileSync(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else if (this.root == 'root') {
                fs.writeFileSync(`${__dirname}/${this.cdPath}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else fs.writeFileSync(path, text ? text : '', { encoding: 'utf8' });
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
        Neofetch.neofetch.call(this, this.cli_args.slice(1));
    }


    xfetch() {
        Neofetch.neofetch.call(this, this.cli_args.slice(1));
    }


    colors() {
        const log = (text) => console.log(`\t\t\t\t\t${text}`);
        log('');
        let stansartsColor = '';
        for (let index = 1; index < 255; index++) stansartsColor += `\x1b[38;5;${String(index)}m ${index} \x1b[0m`;
        log(stansartsColor);
        log('');
    }


    clear() {
        const parameters = this.cli_args.slice(1);

        if (parameters.length > 0) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            console.clear();
        }
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
        let parameters = this.cli_args.slice(1);
        const mapFiles = (path, cb) => { for (const file of getFiles(path)) cb(file) };
        const mapDirs = (path, cb) => { for (const file of getDirs(path)) cb(file) };
        let path;

        if (this.root == 'root' && this.cdPath == 'asmxOS') {
            path = parameters[0] ? `${__dirname}/${this.USER_DIRECTORY_NAME}/${parameters[0]}` : `${__dirname}/${this.USER_DIRECTORY_NAME}`;
        } else if (this.root == 'root') {
            path = parameters[0] ? `${__dirname}/${this.cdPath}/${parameters[0]}` : `${__dirname}/${this.cdPath}`;
        }

        let answer = [];

        mapDirs(path, (dir) => answer.push(` \x1b[38;5;45musr/${dir}/\x1b[38;5;0m`));
        mapFiles(path, (file) => answer.push(` \x1b[38;5;231m${file}\x1b[38;5;0m`));

        return answer.join('\n');
    }
    //============================================================================================
}

let cli = new Cli();

module.exports = cli;