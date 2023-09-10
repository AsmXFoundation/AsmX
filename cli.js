const fs = require('fs');
const dns = require('dns');
const path = require('path');

const Task = require('./task');
const highlightCLI = require('./utils/highlight');

const CortexMARM = require('./bin/arm/arm');
const MiddlewareSoftware = require('./middleware.software');
const EXE = require('./bin/exe/exe');
const App = require('./bin/app/app');
const Parser = require('./parser');
const Compiler = require('./compiler');
const { exec, execSync} = require('child_process');
const config = require('./config');
const Color = require('./utils/color');
// const { MicroParser } = require('./micro/parser');
const ServerLog = require('./server/log');
const { getAllFiles, getDirs, printDirs } = require('./fs');
const CIDE = require('./tools/cide/cide');


class ReadmeCLI {
    static moreBuild(){
        process.stdout.write('asmx-cli build <Architecture> <filename> <output filename>\n');
        process.stdout.write('This command allows you to compile the AsmX program according to the desired architecture. After compilation, it will give you a file.');
        process.stdout.write('\n');
    }
}


class Cli {
    static task = Task;
    static flagUsage = true;
    static commandUsage = true;
    static doctorData = null;
    static counter = 0;
    static beforeCounter = 0;
    static isexit = false;
    static cli_args = [];


    //============================================================================================
    // Main function
    //============================================================================================
    static execute(args) {
        this.cli_args = args;

        if (args[0] = 'asmx-cli') {
            let flags = ['ls', 'graph', 'o', 'v', 'c'];

            for (const argument of args.slice(1)) {
                this.beforeCounter++;
                if (this.isexit) process.exit(1);

                // if (argument.slice(1) !== 'v')
                if (!flags.includes(argument.slice(1)))
                if (this.counter == 0 && flags.includes(argument.slice(1)))
                    throw { error: 'Invalid argument ' + argument + ' in command ' };
        
                if (Reflect.ownKeys(this).includes(argument)) this[argument]();

                if (this.counter >= 1) {
                    if(this.flagUsage == false || this.commandUsage == false) {
                        console.log('Unexpected argument ' + argument);
                        process.exit(1);
                    }
                }

                if (flags.includes(argument.slice(1))) this[argument.slice(1)]();
                this.counter++;
            }

            if (this.counter == 0) console.log('get more information: asmx-cli usage');
        }
    }
    //============================================================================================


    //============================================================================================
    // CLI COMMANDS
    //============================================================================================
    static usage() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
        let theme;

        if (config.INI_VARIABLES?.CLI_THEME != 'common') {
            theme = require(`./etc/cli/theme/${config.INI_VARIABLES?.CLI_THEME}/theme.json`);
        } else theme = {};

        const forgecolor = {};

        const edit = {
            separator: theme?.edit?.separator ? theme?.edit?.separator : '-'
        };

        for (const property of ['cli', 'title', 'document', 'command', 'params', 'flag', 'separator', 'argument']) {
            forgecolor[property] = (theme?.forgecolor)?.[property] ? Reflect.ownKeys(Color).slice(3).includes(`FG_${theme?.forgecolor[property]}`) ? Color[`FG_${theme?.forgecolor[property]}`] : theme?.forgecolor[property] : Color.FG_GRAY;
        }

        let cli = `${forgecolor?.cli || Color.FG_GRAY}asmx-cli${Color.RESET}`;
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
        
        log(buildText(cli, 'usage', edit.separator, 'The command allows you to view a list of commands to use'));
        log(buildText(cli, 'help', edit.separator, 'The command allows you to view a list of commands to use'));
        log(buildText(cli, 'repl', edit.separator, 'REPL (Read-Eval-Print-Loop)', 3));
        log(buildText(cli, 'start'));
        log(buildText(cli, 'theme', edit.separator, 'The command allows you to output all existing themes', 3));
        log(buildText(cli, 'theme', edit.separator, 'The command allows you to go to a topic named \'name\'', 1, `${params('[switch]')} ${arg('name')}`));
        log(buildText(cli, 'cide', edit.separator, 'The command allows you to go to CIDE (Console IDE)', 3));
        log(buildText(cli, 'cide', edit.separator, 'The command allows you to get the CIDE (Console IDE) reference', 2, `${params('[help]')}`));
        log(buildText(cli, 'doctor', edit.separator, 'The command allows you to check all AsmX tools', 2));
        log(buildText(cli, 'update', edit.separator, 'The command allows you to update AsmX to the latest version', 2));
        log(``);
        log(`${cli} ${cmd('build')} ${params('[arch]')} ${arg('./file')} ${arg('./out')}`);
        log(`\t${separator(edit.separator)} ${doc('The command allows you to build/compile an [arch] architecture file with the file\n\t\t  name "./file" and have the last optional field for the path/file name.')}`);
        log(``);
        log(`${cli} ${cmd('run')} ${params('[arch]')} ${arg('./file')} ${arg('./out')}`);
        log(`\t${separator(edit.separator)} ${doc('The command allows you to run an [arch] architecture file with the file name\n\t\t  "./file" and have the last optional field for the path/file name.')}`);
        log(``);
        log(buildText(cli, 'decompile', edit.separator, 'The command allows you to find out information about the App file', 2));
        log(buildText(cli, 'config', edit.separator, 'The command allows you to find out the configuration of the settings at the end of the program', 2, flag('-ls')));
        log(buildText(cli, 'view', edit.separator, 'The command allows you to view the inside of the EXE (Optional)  file', 1, `${params('[exe]')} ${arg('./file')}`));
        log(buildText(cli, 'micro', edit.separator, 'The command allows you to run the AsmX collector', 2, arg('./file')));
        log(buildText(cli, 'engine', edit.separator, 'The command allows you to see which engine is installed for AsmX', 2));
        log(buildText(cli, 'engine', edit.separator, 'The command allows you to install the engine for AsmX', 1, arg('./setfile')));
        log(`${cli} ${cmd('os')} ${arg('name')} \t\t${separator(edit.separator)} ${doc('The command allows you to navigate the operating system with the name \'name\'')}`);
        log(`FLAGS:`); 
        log(`${flag('-ls')}`);
        log(`${flag('-c')}`);
        log(`${flag('-v')}`);
        log(`${`-`.repeat(96)}`);
        log(``);
    }


    static theme() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const command = parameters[0];
        let dirs = getDirs('./etc/cli/theme');

        if (command) {
            if (command == 'new') { // theme new name ./dir
                let name = parameters[1];
                const dirTheme = parameters[2];

                if ([name, dirTheme].includes(undefined)) {
                    ServerLog.log('Insufficient number of arguments\n', 'Exception'); 
                }

                if (dirs.includes(name)) {
                    ServerLog.log('Such a topic already exists\n', 'Exception');
                    if (name == 'common') ServerLog.log('You are not allowed to create a theme with such a backup name.', 'Warning');
                    process.exit(1);
                } else {
                    // in develop
                }
            } else if (command == 'switch') { // theme switch <name>
                let name = parameters[1];

                if (dirs.includes(name)) {
                    config.print('CLI_THEME', name);
                    config.commit();
                }

                console.log('cli theme: ', config.INI_VARIABLES?.CLI_THEME);
            }
        } else {
            printDirs(dirs);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    static help() { 
        this.usage();
    }


    static repl() {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write(`>>> `);
        process.stdin.resume();

        process.stdin.on('data', function (data) {
            new Compiler(Parser.parse(data));
            process.stdout.write(`>>> `);
        });
    }


    static os() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 1) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const os = parameters[0];
        let dirs = getDirs('./etc/os');

        if (os) {
            if (dirs.includes(os)) {
                try {
                    const machine = require(`./etc/os/${os}/core.js`);
                    machine.boot();
                } catch (exception) {
                    // console.log(exception);
                    ServerLog.log('OS Not found', 'Exception');
                }
            }
        } else {
            printDirs(dirs);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    static start() {
        this.doctor();
        let properties = this.task.last()['value'];

        if (properties['isAsmXGlobal']) {
            ServerLog.log('AsmX is already in the global system', 'Notify');
        } else {
            if (process.platform === 'win32') {
                exec(`setx AsmX "${__dirname}\\installer\\windows\\asmx"`, (exception, stdout, stdexception) => {
                    if (exception) console.log(exception);
                });

                exec(`set PATH=%PATH%;${__dirname}\\AsmX\\installer\\windows\\asmx`, (exception, stdout, stdexception) => {
                    if (exception) console.log(exception);
                });
            }

            ServerLog.log('AsmX has been successfully entered into the global system', 'Successfuly');
        }

        this.commandUsage = false;
        this.flagUsage = false;
    }


    static doctor() {
        let isAsmXGlobal = false;

        if (process.platform === 'win32') {
            exec('echo %PATH% | findstr /i "\\asmx"', (exception, stdout, stdexcept) => {
                if (stdout && stdout.length > 0) isAsmXGlobal = true;
            });
        } else if (process.platform === 'linux' || process.platform === 'darwin') {
            exec('echo $PATH | grep -q "\\asmx"', (exception, stdout, stdexcept) => {
                if (stdout && stdout.length > 0) isAsmXGlobal = true;
            });
        }

        this.doctorData = {
            isAsmXGlobal: isAsmXGlobal,
            isAsmXCli: true,
            isAsmXEXECli: false,
            isAsmXAPPCli: false,
            isAsmXVim: true,
            isNeuralTools: true
        }

        this.task.new('doctor', this.doctorData, 'watch');
    }


    static config() {
        this.configData = config?.INI_VARIABLES;
        this.task.new('config', this.configData, 'watch');
    }


    static start() {
        exec('npm install', (exception, stdout) => {
            if (stdout) console.log('AsmX started!');
            if (exception) {
                dns.lookup('github.com', (except) => {
                    if (except && except.code === 'ENOTFOUND') 
                    console.log(`
                        \x1b[1F${Color.BRIGHT}[${Color.FG_RED}RequestException${Color.FG_WHITE}]: Internet is not avaliable ${Color.RESET}
                    `);
                });

                ServerLog.log('If you have an internet connection, you probably deleted your git account.', 'Possible fixes');
            }
        });

        const currentPATH = process.env.PATH;
        let newPath;
    
        if (process.platform === 'win32') {
            newPath = path.join(__dirname, 'installer/windows/asmx.bat');
        } else if (process.platform === 'linux' || process.platform === 'darwin') {
            newPath = path.join(__dirname, 'installer/linux/asmx.bat');
        }

        if (!currentPATH.includes(newPath)) {
            const releasePATH = `${currentPATH}${path.delimiter}${newPath}`;
            let execCommand;

            if (process.platform === 'win32') {
                execCommand = `setx PATH "${releasePATH}"`;
            } else if (process.platform === 'linux' || process.platform === 'darwin') {
                execCommand = `export PATH=${releasePATH}`;
            }

            exec(execCommand, (err, stdout, stderr) => {
                stdout && console.log(stdout);
                stderr && console.log(stderr.toString());
            });
        } else {
            console.log('AsmX in Global System');
        }
    }


    static update() {
        exec('git pull', (exception, stdout) => {
            if (stdout) console.log('AsmX updated!');
            if (exception) {
                dns.lookup('github.com', (except) => {
                    if (except && except.code === 'ENOTFOUND') 
                    console.log(`
                        \x1b[1F${Color.BRIGHT}[${Color.FG_RED}RequestException${Color.FG_WHITE}]: Internet is not avaliable ${Color.RESET}
                    `);
                });

                ServerLog.log('If you have an internet connection, you probably deleted your git account.', 'Possible fixes');
            }
        });
    }


    static cide() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1);
        parameters[0] == 'help' ? require('./tools/cide/cli').help() : CIDE.run();
        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    // build <arch> <input file> <out file>?
    static build(){
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        const file = parameters[1];
        let outputfile = parameters[2];
        const sourceparse =  Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }));
        new Compiler(sourceparse);

        const TableSource = {
            arm: '.s',
            app: '.app'
        }

        if (architecture.indexOf('@') > -1) {
            const [arch, version] = architecture.split('@');

            try {
                const complier = require(`./bin/${arch}/${version}/${arch}`);

                if (Reflect.ownKeys(TableSource).includes(arch)) {
                    if (outputfile && !outputfile.endsWith(TableSource[arch])) outputfile = outputfile + TableSource[arch];
                    if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}${TableSource[arch]}`;
                    this.buildFile = outputfile;
                }

                if (arch == 'app') {
                    new complier(outputfile, 'x64', 'x64', sourceparse);
                } else if (arch == 'arm') {
                    new complier(outputfile, MiddlewareSoftware.source);
                } else {
                    new complier(outputfile, MiddlewareSoftware.source);
                }
            } catch (exception) {
                ServerLog.log('Unknow version architecture', 'Exception');
            }
        } else if (architecture == 'arm') {
            if (outputfile && !outputfile.endsWith('.s')) outputfile = outputfile + '.s';
            if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}.s`;
            this.buildFile = outputfile;
            new CortexMARM(outputfile, MiddlewareSoftware.source);
        } else if (architecture == 'app') {
            if (outputfile && !outputfile.endsWith('.app')) outputfile = outputfile + '.app';
            if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}.app`;
            this.buildFile = outputfile;
            new App(outputfile, 'x64', 'x64', MiddlewareSoftware.source);
        } else {
            ServerLog.log('Unknow architecture', 'Exception');
            process.exit(1);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    static engine() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 1) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        if (parameters[0]) {
            config.print('CHECK_ENGINE', parameters[0]);
            config.commit();
        }

        console.log(`engine: `, config.INI_VARIABLES.CHECK_ENGINE);

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    static micro() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 1) {
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        exec(`node ./micro/micro.js asmx-cli micro ${parameters[0]}`);

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    // run <arch> <input file>
    static run() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        let file = parameters[1];

        const TableSource = {
            arm: '.s',
            app: '.app'
        }

        if (architecture.indexOf('@') > -1) {
            const [arch, version] = architecture.split('@');

            try {
                const complier = require(`./bin/${arch}/${version}/${arch}`);

                if (Reflect.ownKeys(TableSource).includes(arch)) {
                    if (file && !file.endsWith(TableSource[arch])) file = file + TableSource[arch];
                    if (file == undefined) file = `${path.parse(file)['dir']}\\${path.parse(file)['name']}${TableSource[arch]}`;
                }

                complier.Execute().execute(file);
            } catch (exception) {
                console.log(exception);
                ServerLog.log('Unknow version architecture', 'Exception');
            }
        } else if (architecture === 'app') {
            // App.Execute().execute(file == undefined ? this.buildFile : file);
            App.Execute().execute(file);
        } else {
            ServerLog.log('Unknow architecture', 'Exception');
            process.exit(1);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    // decompile <arch> <input file>
    static decompile() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1).filter(t => t.trim() !== '');

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        const file = parameters[1];

        if (architecture === 'app') {
            App.Decompiler().decompiler(file);
        } else {
            ServerLog.log('Unknow architecture', 'Exception');
            process.exit(1);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }

    
    /**
     * asmx-cli view exe <path>
     */
    static view() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

        if (parameters.length > 2 || parameters.length < 2) { 
            ServerLog.log("not enough arguments / too many arguments or parameters", 'Exception');
            process.exit(1);
        }

        if (parameters[0] == 'exe') EXE.View().view(parameters[1]);

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    /**
     * asmx-cli readme <command>
     */
    static readme() {
        const parameters = this.cli_args.slice(2);
        const command = parameters[0];

        if (parameters.length > 1) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        };

        try {
            if (command != '--all') {
                ReadmeCLI[`more${command[0].toUpperCase() + command.substring(1)}`]();
            } else {
                for (const readme of Reflect.ownKeys(ReadmeCLI).filter(readme => readme.startsWith('more'))) ReadmeCLI[readme]();
            }
        } catch {
            ServerLog.log("Unknown command for get readme", 'Exception');
            process.exit(1);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }
    //============================================================================================


    //============================================================================================
    // CLI FLAGS
    //============================================================================================
    static ls() {
        function printCheckTools(o, prop, tools) {
            console.log(
                Color.BRIGHT
                , Reflect.ownKeys(o).includes(prop) && o[prop] ? `${Color.FG_GREEN}+${Color.BRIGHT}` : `${Color.FG_RED}-${Color.BRIGHT}` ,`${Color.FG_WHITE} ${tools}`
                , Color.RESET
            );
        }

        if (this.task.tasks.length == 0) process.exit(1);

        if (this.task.last()['name'] === 'doctor') {
            let properties = this.task.last()['value'];
            printCheckTools(properties, 'isAsmXGlobal', 'AsmX Global System');
            printCheckTools(properties, 'isAsmXCli', 'AsmX CLI');
            printCheckTools(properties, 'isAsmXAPPCli', 'AsmX APP CLI');
            printCheckTools(properties, 'isNeuralTools', 'Neural Tools');
            printCheckTools(properties, 'isAsmXVim', 'AsmX Vim');
            printCheckTools(properties, 'isAsmXEXECli', 'AsmX EXE CLI');
        }

        else if (this.task.last()['name'] === 'config') {
            let properties = this.task.last()['value'];
            printCheckTools(properties, 'ANALYSIS', 'Analysis code');
            printCheckTools(properties, 'GARBAGE', 'Garbage Collection (GC)');
            printCheckTools(properties, 'OBJECT_OUTPUT', 'obj file for compiler');
            printCheckTools(properties, 'PRINT_MODULES', 'library or module sections');
        }

        this.flagUsage = false;
        this.commandUsage = false;
    }


    /** @returns the AsmX version */
    static v() {
        console.log('AsmX v4.0');
        this.flagUsage = false;
        this.commandUsage = false;
    }


    static c() {
        process.stdout.write('AsmX v4.0. ');
        console.log('\tAsmX Corporation. All rights reserved.');
        console.log('\t\tOpen source source: https://github.com/langprogramming-AsmX/AsmX');
        this.flagUsage = false;
        this.commandUsage = false;
    }
    //============================================================================================
}

module.exports = Cli;