//===========================================================================================
//      The Kernel is responsible for loading and executing the functions in the Kernel
//===========================================================================================
const fs = require('fs');

const Parser = require('./parser');
const Color = require('./utils/color');
const Compiler = require('./compiler');
const { FileError } = require('./exception');
const ServerLog = require('./server/log');
const { getTotalSize } = require('./fs');
const configSettings = require('./config');
const Analysis = require('./analysis');
const Garbage = require('./garbage');
const ValidatorByType = require('./checker');
const Cli = require('./cli');
const Micro = require('./micro/micro');

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
            registers: Object.getOwnPropertyNames(new Compiler([])),
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
    if (pathfile == undefined) {
        ServerLog.log('Insufficient number of arguments\n', 'Exception');
        process.exit(1);
    } else if (pathfile.endsWith('.asmx') || pathfile.endsWith('.asmX') || pathfile.endsWith('.🚀')) {
        ServerLog.log(`COMPILING ${pathfile} FILE...\n`, 'Compiler');
        ServerLog.log('you can enable Server Log using `@Issue true` \n', 'Notify');
        ServerLog.log(`It is not recommended to use the @Issue instruction. WE DO NOT GUARANTEE THE FULL FUNCTIONALITY OF AsmX PROGRAMS\n`, 'Warning');
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
    } else if (pathfile == "repl") {
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


if (argv.length == 2)  question('AsmX file compiler asmX ~' , (answer) => { callCompiler(answer); });
if (argv[2] !== 'asmx-cli' || argv[2] !== 'asmx' && argv.length == 3) callCompiler(argv[2]);
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

            console.log(exception);

            new FileError({ message: FileError.FILE_NOT_FOUND });
        }
    }
}