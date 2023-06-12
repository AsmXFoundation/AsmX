//===========================================================================================
//      The Kernel is responsible for loading and executing the functions in the Kernel
//===========================================================================================
const fs = require('fs');
const { exec } = require('child_process');
const dns = require('dns');

const Parser = require('./parser');
const Color = require('./utils/color');
const Compiler = require('./compiler');
const { FileError } = require('./anatomics.errors');
const ServerLog = require('./server/log');
const { getTotalSize } = require('./fs');
const configSettings = require('./config');
const Analysis = require('./analysis');
const Garbage = require('./garbage');
const ValidatorByType = require('./checker');
const Task = require('./task');
const highlightCLI = require('./utils/highlight');
const CortexMARM = require('./bin/arm/arm');
const MiddlewareSoftware = require('./middleware.software');

let argv  = process.argv;
log = (message, callback) => process.stdout.write(message, callback);
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


class Fact {
    static news() {
        const facts = {
            instructions: Object.getOwnPropertyNames(Parser),
            registers: Object.getOwnPropertyNames(Compiler),
            sentence: [
                '✨ The first version of the AsmX programming language was released on February 23, 2023\n',
                `The AsmX core size is ${Math.floor(getTotalSize('./') / (1024 * 1024))} megabytes (mb) \n`
            ],
        }

        facts.instructions = facts.instructions.filter(instruction => /parse\w+Statement/.test(instruction)).length;
        facts.registers = facts.registers.filter(register => /\$\w+/.test(register)).length;

        let randomize = (struct) => {
            let call = (structure) => Math.floor(Math.random()* (structure - 0) + 0);
            return (struct instanceof Object) ? call(Reflect.ownKeys(struct).length) : call(struct.length - 1);
        }

        let faxsKeys = Reflect.ownKeys(facts);
        const fact = faxsKeys[randomize(facts)];
        const tag = 'Fun facts';
        ServerLog.newTag(tag, Color.FG_CYAN);

        if (fact == 'sentence' && Array.isArray(facts[fact])) {
            const factsV2 = facts[fact];
            ServerLog.log(factsV2[randomize(facts[fact])], tag);
        } else {
            ServerLog.log(`fun fact: AsmX have ${facts[fact]} ${fact}\n`, tag);
        }
    }
}

function callCompiler(pathfile) {
    if (pathfile.endsWith('.asmx') || pathfile.endsWith('.asmX') || pathfile.endsWith('.🚀')) {
        ServerLog.log(`COMPILING ${pathfile} FILE...\n`, 'Compiler');
        ServerLog.log('you can enable Server Log using `@Issue true` \n', 'Notify');
        Fact.news();

        let timer = setInterval(() => {
            new CompilerAsmX({ src: pathfile });
            clearInterval(timer);
            if (configSettings.INI_VARIABLES?.ANALYSIS) Analysis.protocol();
            if (configSettings.INI_VARIABLES?.GARBAGE) Garbage.protocol();
        });
    } else if (['garbage', 'analysis'].includes(pathfile)) {
        pathfile = pathfile.toUpperCase();
        ServerLog.log(`Status: ${configSettings.INI_VARIABLES[pathfile] ? 'on' : 'off'}\n`, 'Info');
        question(`${Color.BRIGHT}[${Color.FG_GREEN}Question${Color.FG_WHITE}][y/n]: Are you sure you want to change? : ` , (answer) => {
            if (answer == "yes" || answer == "y") {
                configSettings.print(pathfile, !configSettings.INI_VARIABLES[pathfile]);
                configSettings.commit();
                console.log(`${pathfile}: `, configSettings.INI_VARIABLES[pathfile]);
            } else if (answer == "no" || answer == "n") {
                process.exit();
            }
        });
    } else if(['print-modules'].includes(pathfile)) {
        pathfile = pathfile.replace('-', '_').toUpperCase();
        ServerLog.log(`Status: ${configSettings.INI_VARIABLES[pathfile] ? 'on' : 'off'}\n`, 'Info');
        question(`${Color.BRIGHT}[${Color.FG_GREEN}Question${Color.FG_WHITE}][y/n]: Are you sure you want to change? : ` , (answer) => {
            if (answer == "yes" || answer == "y") {
                configSettings.print(pathfile, !configSettings.INI_VARIABLES[pathfile]);
                configSettings.commit();
                console.log(`${pathfile}: `, configSettings.INI_VARIABLES[pathfile]);
            } else if (answer == "no" || answer == "n") {
                process.exit();
            }
        });
    } else if (pathfile == "nowcode") {
        let isprompt = true;

        while (isprompt) {
            question('> ', (source) => {
                new Compiler(Parser.parse(source));
                isprompt = true;
            });

            isprompt = false;
        }
    } else {
        new FileError({ message: FileError.FILE_EXTENSION_INVALID });
    }
}


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
            let flags = ['ls', 'graph', 'o', 'i'];

            for (const argument of args.slice(1)) {
                this.beforeCounter++;
                if (this.isexit) process.exit(1);

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
        let { log } = console;

        log('');
        log('USAGE: ');
        log('\tasmx-cli [cmd] [options] [flags] [options]');
        log('\tasmx-cli usage');
        log('\tasmx-cli start');
        log('\tasmx-cli doctor');
        log('\tasmx-cli update');
        log('asmx-cli build <Architecture> <filename> <output filename>');
        log('FLAGS:');
        log('\t-ls');
        log('');
    }


    static start() {
        this.doctor();
        let properties = this.task.last()['value'];

        if (properties['isAsmXGlobal']) {
            ServerLog.log('AsmX is already in the global system', 'Notify');
        } else {
            // if (process.platform === 'win32') {
                exec('clear', (exception, stdout, stdexception) => {
                    if (exception) console.log(exception);
                    if (stdout) console.log(stdout);
                    // if (exception) throw exception;
                });

            // }

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
            isAsmXGlobal: isAsmXGlobal
        }

        this.task.new('doctor', this.doctorData, 'watch');
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
            if (!outputfile.endsWith('.s')) outputfile = outputfile + '.s';
            new CortexMARM(outputfile, MiddlewareSoftware.source);
        } else {
            ServerLog.log('Unknow architecture', 'Exception');
            process.exit(1);
        }

        this.commandUsage = false;
        this.flagUsage = false;
        this.isexit = true;
    }


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
        if (this.task.last()['name'] === 'doctor') {
            let properties = this.task.last()['value'];
            console.log(
                Color.BRIGHT
                , properties?.isAsmXGlobal ? `${Color.FG_GREEN}+${Color.BRIGHT}` : `${Color.FG_RED}-${Color.BRIGHT}` ,`${Color.FG_WHITE} AsmX Global System`
                , Color.RESET
            );
        }

        this.flagUsage = false;
        this.commandUsage = false;
    }
    //============================================================================================
}


if (argv.length == 2)  question('AsmX file compiler asmX ~' , (answer) => { callCompiler(answer); });
if (argv[2] !== 'asmx-cli'  && argv.length == 3) callCompiler(argv[2]);
if (argv.length >=  3) Cli.execute(argv.slice(2));


class CompilerAsmX {
    constructor(config) {
        this.config = config;
        this.tokens = [];
        
        try {
            let file = fs.readFileSync(this.config.src, { encoding: 'utf8' });
            let parser = Parser.parse(file);
            new Compiler(parser);

            if (configSettings.INI_VARIABLES?.PRINT_MODULES) {
                let imports = parser.filter(tree => tree?.import);

                console.log(`${Color.BRIGHT} (${Color.FG_GREEN}Modules Collection${Color.FG_WHITE}) {`);
                    imports.forEach(module => {
                        let m = ValidatorByType.validateByTypeString(module.import.alias) ? module.import.alias.slice(1, -1) : module.import.alias;
                        let typeAlias;

                        if (ValidatorByType.validateByTypeString(module.import.alias)) {
                            typeAlias = `${Color.FG_GRAY}module${Color.FG_WHITE}`;
                        } else if (ValidatorByType.validateTypeIdentifier(module.import.alias)) {
                            typeAlias = `${Color.FG_MAGENTA}library${Color.FG_WHITE}`;
                        }

                        if (!m.startsWith('./systems/')) console.log(`  ${typeAlias} => ${m}`);
                    })
                console.log(` }\n`);
            }
        } catch (exception) {
            if (exception instanceof RangeError) {
                new Error('[StackException]: You must specify a range before calling this function');
            }

            // console.log(exception);

            new FileError({ message: FileError.FILE_NOT_FOUND });
        }
    }
}