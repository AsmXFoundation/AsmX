const fs = require('fs');

const Task = require('./task');
const highlightCLI = require('./utils/highlight');

const CortexMARM = require('./bin/arm/arm');
const MiddlewareSoftware = require('./middleware.software');
const EXE = require('./bin/exe/exe');
const path = require('path');
const App = require('./bin/app/app');
const Parser = require('./parser');
const Compiler = require('./compiler');
const { exec} = require('child_process');
const config = require('./config');
const Color = require('./utils/color');
// const { MicroParser } = require('./micro/parser');
const ServerLog = require('./server/log');
const { getAllFiles, getDirs, printDirs } = require('./fs');


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
        } else if (args[0] == 'exe-cli') {

        }
    }
    //============================================================================================


    //============================================================================================
    // CLI COMMANDS
    //============================================================================================
    static usage() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');

        log(Color.FG_GRAY);
        log('USAGE:');
        log('-'.repeat(96));
        log('asmx-cli [cmd] [options] -[flags] [options]');
        log('asmx-cli usage \t\t\t- The command allows you to view a list of commands to use');
        log('asmx-cli start');
        log('asmx-cli doctor \t\t- The command allows you to check all AsmX tools');
        log('asmx-cli update \t\t- The command allows you to update AsmX to the latest version');
        log('');
        log('asmx-cli build [arch] ./file ./out');
        log('\t- The command allows you to build/compile an "[arch]" architecture file with the file\n\t\t  name "./file" and have the last optional field for the path/file name.');
        log('');
        log('asmx-cli run [arch] ./file ./out');
        log('\t- The command allows you to run an "[arch]" architecture file with the file name\n\t\t  "./file" and have the last optional field for the path/file name.');
        log('');
        log('asmx-cli view exe ./file \t- The command allows you to view the inside of the EXE (Optional)  file');
        log('asmx-cli micro ./file \t\t- The command allows you to run the AsmX collector');
        log('asmx-cli engine \t\t- The command allows you to see which engine is installed for AsmX');
        log('asmx-cli engine ./setfile \t- The command allows you to install the engine for AsmX');
        log('asmx-cli vmare [name] \t- The command allows you to navigate the operating system with the name [name]');
        log('FLAGS:');
        log('-ls');
        log(`${'-'.repeat(96)}`);
        log('');
    }


    static theme() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

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
                // in develop
            }
        } else {
            printDirs(dirs);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


    static vmare() {
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

        if (parameters.length > 1) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const vm = parameters[0];
        let dirs = getDirs('./etc/os');

        if (vm) {
            if (dirs.includes(vm)) {
                try {
                    const machine = require(`./etc/os/${vm}/core.js`);
                    machine.boot();
                } catch (exception) {
                    console.log(exception);
                    ServerLog.log('', 'Exception');
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
        this.configData = configSettings.INI_VARIABLES;
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


    static vim() {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        let sourceVim = [];

        process.stdin.on('data', function (data) {
            sourceVim.push(data);
            console.clear();
            for (const code of sourceVim) process.stdout.write(highlightCLI.light(code));
        });
    }


    // build <arch> <input file> <out file>?
    static build(){
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        const file = parameters[1];
        let outputfile = parameters[2];
        const sourceparse =  Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }));
        new Compiler(sourceparse);

        if (architecture === 'arm') {
            if (outputfile && !outputfile.endsWith('.s')) outputfile = outputfile + '.s';
            if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}.s`;
            this.buildFile = outputfile;
            new CortexMARM(outputfile, MiddlewareSoftware.source);
        } else if (architecture === 'app') {
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
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

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
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

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
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

        if (parameters.length > 2) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        const file = parameters[1];

        if (architecture === 'app') {
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
        const parameters = this.cli_args.slice(this.beforeCounter + 1);

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
        const parameters = this.cli_args.slice(this.beforeCounter + 1);
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
        process.stdout.write('AsmX v3.0');
        this.flagUsage = false;
        this.commandUsage = false;
    }


    static c() {
        process.stdout.write('AsmX v3.0. ');
        console.log('\tAsmX Corporation. All rights reserved.');
        console.log('\t\tOpen source source: https://github.com/langprogramming-AsmX/AsmX');
        this.flagUsage = false;
        this.commandUsage = false;
    }
    //============================================================================================
}

module.exports = Cli;