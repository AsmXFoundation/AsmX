const fs = require('fs');  // Import the fs module for file system operations
const os = require("os");  // Import the os module for operating system related utilities

const kernelCli = require("../../../cli");  // Import the kernelCli module

const {
    getDirs,  // Function to get directories in a given path
    printDirs,  // Function to print directories
    getFiles,  // Function to get files in a given path
    getFileSize,  // Function to get the size of a file
    sizeBytes,  // Utility function to convert file size to human-readable format
    getFilePermissions,  // Function to get the permissions of a file
    getFileDates  // Function to get the creation and modification dates of a file
} = require("../../../fs");  // Import file system related functions

const ServerLog = require("../../../server/log");  // Import the ServerLog module
const Color = require("../../../utils/color");  // Import the Color module
const config = require("../../../config");  // Import the config module
const { exec, execSync } = require('child_process');  // Import functions from the child_process module
const Theme = require('../../../tools/theme');  // Import the Theme module
const Neofetch = require('./neofetch');  // Import the Neofetch module
const TableCLI = require('./utils/table-cli');


class Cli {
    // Configuration variables
    static flagUsage = true; // Flag to indicate whether flag usage is enabled
    static commandUsage = true; // Flag to indicate whether command usage is enabled
    static counter = 0; // Counter variable
    static beforeCounter = 0; // Counter variable before a certain event
    static isexit = false; // Flag to indicate whether exit is enabled
    static cli_args = []; // Array to store CLI arguments
    static root = 'root'; // Root directory name
    static separateCD = '@'; // Separator for CD command
    static cdPath = 'asmxOS'; // CD path

    // Configuration variables (repeated for instance variables)
    flagUsage = true; // Flag to indicate whether flag usage is enabled
    commandUsage = true; // Flag to indicate whether command usage is enabled
    counter = 0; // Counter variable
    beforeCounter = 0; // Counter variable before a certain event
    isexit = false; // Flag to indicate whether exit is enabled
    cli_args = []; // Array to store CLI arguments
    root = 'root'; // Root directory name
    separateCD = '@'; // Separator for CD command
    cdPath = 'asmxOS'; // CD path
    USER_DIRECTORY_NAME = 'usr'; // User directory name
    modeCLI = 'public'; // CLI mode
    HISTORY_PATH = `${__dirname}/usr/.history`; // Path to history file
    shellConfig = { time: 'default' }; // Shell configuration settings

    variable = {
        $SHELL: 'AsmX Shell (.ash)', // Shell environment variable
        $PATH: '', // Path environment variable
        $OSTYPE: 'AsmX OS', // Operating system type
        $HOME: `${this.USER_DIRECTORY_NAME}/`, // User's home directory
        $MEM: os.freemem().toString() // Free memory available
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

        if (this.modeCLI == 'private') {
            fs.writeFileSync(HISTORY_PATH, '');
            console.clear();
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

        if (args.length == 0) {
            return;
        }

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
                        for (const pkg of packagesCommands) {
                            if (pkg.commands.includes(argument))
                                return require(`${__dirname}/usr/packages/${pkg.name}/index`)[argument]['call'](this);
                        }
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
        // Helper function to log messages
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');

        // Print gray color
        log(Color.FG_GRAY);

        let cli = `asmxos-cli`;
        log(`USAGE:`);
        log(`-`.repeat(96));
        log(`${cli} [cmd] [options] -[flags] [options]`);

        // Set callback print for the theme
        Theme.setCallbackPrint(log);

        Theme.print(cli, 'xfetch', 'The command allows you to learn the basic about the OS', 2);
        Theme.print(cli, 'neofetch', 'The command allows you to learn the basic about the OS', 2);
        Theme.print(cli, 'neofetch', 'The command allows you to get a reference for the neofetch command', 1, { flag: '--help' });
        Theme.print(cli, 'history', 'The command allows you to find out the history of requests', 2);
        Theme.print(cli, 'history', 'The command allows you to get a reference for the history command', 1, [{ flag: '--help' }]);
        Theme.print(cli, 'cli', 'The command allows you to navigate to the desired CLI', 2, { arg: 'name' });
        Theme.print(cli, 'doge', 'The command allows you to display the contents of the file', 2, { arg: 'name' });
        Theme.print(cli, 'grep', 'The command allows you to get a reference for the grep command', 2, [{ flag: '--help' }]);
        Theme.print(cli, 'pwd', 'The command allows you to get a reference for the pwd command', 2, { flag: '--help' });
        Theme.print(cli, 'tree', 'The command allows you to display the tree structure of the file system', 2, { arg: './path' });
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
        log(`-`.repeat(96));

        console.log(`        ${Color.FG_YELLOW}* WARNING: AsmX OS is not someone's distribution${Color.RESET}`);
        console.log(`        ${Color.FG_YELLOW}* This OS is not intended to be downloaded to a device that does not have an OS. This OS is 
        primarily designed only to work with the Asm programming language and has its own workspace 
        like other operating systems.${Color.RESET}\n`);
    }


    history() {
        // Get the command line arguments excluding the first argument
        const parameters = this.cli_args.slice(1);
        // Define the path to the history file
        const HISTORY_PATH = `${__dirname}/usr/.history`;
        // Get the first argument
        const flag = parameters[0];

        // Check if there are too many parameters
        if (parameters.length > 1) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            // Function to read the content of the history file
            const content_t = () => fs.readFileSync(HISTORY_PATH).toString('utf8').split('\n');
            // Function to check if the history file exists
            const existHistory = (cb) => { if (fs.existsSync(HISTORY_PATH)) cb() };

            if (flag) {
                // Handle specific flags
                if (['--unique', '--count', '--help'].includes(flag)) {
                    if (flag == '--unique') {
                        // Output unique lines from the history file
                        let list = new Set();
                        existHistory(_ => content_t().map(line => list.add(line)));
                        list.forEach(item => console.log(item));
                        list.clear();
                    } else if (flag == '--count') {
                        // Output the number of lines in the history file
                        existHistory(_ => console.log(String(content_t().length)));
                    } else if (flag == '--help') {
                        // Output help information for the history command
                        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
                        let cli = `asmxos-cli`;
                        Theme.setCallbackPrint(log);
                        Theme.print(cli, 'history', 'The command allows you to display the entire query history', 2);
                        Theme.print(cli, 'history', 'The command allows you to get a reference for the history command', 1, { flag: '--help' });
                        Theme.print(cli, 'history', 'The command allows you to output only unique queries', 1, { flag: '--unique' });
                        Theme.print(cli, 'history', 'The command allows you to output the number of requests', 1, { flag: '--count' });
                    }
                } else {
                    ServerLog.log('flag not found\n', 'Exception');
                }
            } else {
                // Output all lines from the history file
                existHistory(_ => content_t().map(line => console.log(line)));
            }
        }
    }


    /**
     * Sets the mode of the CLI based on the command line arguments.
     * @returns {string} The mode of the CLI.
     */
    mode() {
        // Get the command line arguments
        const parameters = this.cli_args.slice(1);
        const flag = parameters[0];

        // Check if there are too many parameters
        if (parameters.length > 1) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else if (flag) {
            // Check if the flag is --anonymous or --private
            if (['--anonymous', '--private'].includes(flag)) {
                fs.writeFileSync(this.HISTORY_PATH, '');
                this.modeCLI = 'private';
            } else if (flag == '--public') {
                this.modeCLI = 'public';
            } else {
                // Flag not found
                ServerLog.log('flag not found\n', 'Exception');
            }
        } else {
            // No flag provided, return the current mode
            return this.modeCLI;
        }
    }


    packages() {
        // Get the command line arguments
        const parameters = this.cli_args.slice(1);
        // Get the directories inside "/usr/packages"
        let packages = getDirs(`${__dirname}/usr/packages`);

        if (parameters.length == 0) {
            // If no parameters are provided, print the package names
            for (const pkg of packages) console.log(`${pkg}.pkg`);
        } else {
            const flag = parameters[0];
            const flags = ['-ls', '--info', '--count', '--pro'];

            if (flags.includes(flag)) {
                if (flag == '-ls') {
                    // If the flag is "-ls", print the package names with colored output
                    for (const pkg of packages) console.log(` \x1b[38;5;44m${pkg}.pkg\x1b[38;5;0m`);
                } else if (['--info', '--pro'].includes(flag)) {
                    // Define an object that maps format options to date functions
                    const formatDates = {
                        default: 'toISOString',
                        utc: 'toUTCString',
                        iso: 'toISOString',
                        date: 'toDateString',
                        locale: 'toLocaleString'
                    };
                    
                    // Get file dates for each package
                    const fileDates = packages.map(pkg => getFileDates(`${__dirname}/usr/packages/${pkg}/`));
                    
                    // Get file permissions for each package
                    const premissions = packages.map(pkg => 'd' + getFilePermissions(`${__dirname}/usr/packages/${pkg}/`).toString());
                    
                    // Set the default time format
                    let time = 'default';
                    
                    // Initialize an empty object to store formatted file dates
                    let formatedFileDates = {};
                    
                    // Check if the flag is '--pro'
                    if (flag == '--pro') {
                        const urlShellConfig = `${__dirname}/etc/shell.conf`;
                    
                        // Check if the shell config file exists
                        if (fs.existsSync(urlShellConfig)) {
                            const shellConfig = JSON.parse(fs.readFileSync(urlShellConfig).toString('utf8') || '{}');
                    
                            // Check if the shell config has a 'time' property
                            if (Reflect.ownKeys(shellConfig).includes('time')) {
                                // Override the default time format if 'time' property exists in the shell config
                                time = shellConfig.time ?? time;
                    
                                // Check if the time format is 'format'
                                if (time == 'format') {
                                    // Create a date formatter using Intl.DateTimeFormat with specific options
                                    let formatter = new Intl.DateTimeFormat('en-US', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: 'numeric',
                                        second: 'numeric',
                                        timeZone: 'UTC'
                                    });
                    
                                    // Format the created and modified dates using the formatter
                                    formatedFileDates.created = fileDates.map(date => formatter.format(date.created).replace(/\,/g, ''));
                                    formatedFileDates.modified = fileDates.map(date => formatter.format(date.modified).replace(/\,/g, ''));
                                }
                            }
                        } else {
                            // If the shell config file doesn't exist, write the default shell config
                            fs.writeFileSync(urlShellConfig, JSON.stringify(this.shellConfig), { encoding: 'utf8' });
                        }
                    }
                    
                    // Check if the time format is valid
                    if (Reflect.ownKeys(formatDates).includes(time)) {
                        const func = formatDates[time];
                    
                        // Format the created and modified dates using the specified time format
                        formatedFileDates.created = fileDates.map(date => date.created[func]());
                        formatedFileDates.modified = fileDates.map(date => date.modified[func]());
                    }
                    
                    // Define the table headers
                    const table = { rows: ['Directory', 'Package', 'Name', 'File Type', 'Size'] };
                    
                    // Define table options
                    const options = {
                        chunks: true,
                        styles: {
                            color: {
                                row: {
                                    all: '\x1b[38;5;0m'
                                },
                                header: '\x1b[38;5;0m'
                            }
                        }
                    };
                    
                    // Define the table dataset
                    table.dataset = [
                        packages.map(pkg => `/usr/packages/${pkg}/`),
                        packages.map(pkg => `${pkg}.pkg`),
                        packages.map(pkg => pkg),
                        packages.map(pkg => '(.pkg)'),
                        packages.map(pkg => getFileSize(`${__dirname}/usr/packages/${pkg}/index.js`))
                    ];
                    
                    // Define colors for table rows
                    const colors = ['\x1b[38;5;45m', '\x1b[38;5;44m', '\x1b[38;5;43m', '\x1b[38;5;42m', '\x1b[38;5;41m'];
                    
                    // Check if the flag is set to '--pro'
                    if (flag == '--pro') {
                        // Add additional rows to the table
                        table.rows = ['Premission', 'User', 'Created', 'Modified', ...table.rows];
                    
                        // Create an array of users with the same length as the number of permissions
                        let user = new Array(premissions.length).fill(this.root);
                    
                        // Add additional datasets to the table
                        table.dataset = [premissions, user, formatedFileDates.created, formatedFileDates.modified, ...table.dataset];
                    
                        // Modify the color of the second row
                        options.styles.color.row[1] = '\x1b[38;5;50m';
                    }
                    
                    // Loop through the colors array
                    for (let index = 0, size = colors.length; index < size; index++) {
                        // Modify the color of each row based on the flag
                        options.styles.color.row[flag == '--pro' ? index + 4 : index] = colors[index];
                    }

                    // Return the generated table message
                    return TableCLI.redner(table, options);
                } else if (flag == '--count') {
                    // If the flag is "--count", return the number of packages
                    return String(packages.length || 0);
                }
            } else {
                // If the flag is not recognized, log an error
                ServerLog.log('flag not found\n', 'Exception');
            }
        }
    }


    /**
     * The `doge` function reads a file and returns its content based on the given parameters.
     *
     * @returns {string} The content of the file.
     */
    doge() {
        // Get the parameters passed to the function
        const parameters = this.cli_args.slice(1);

        // Check if there are too many parameters
        if (parameters.length > 3) {
            // Log an exception if there are too many parameters
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            // Get the file path
            const file = parameters[0];
            const path = `${__dirname}/${this.variable['$HOME']}${file}`;

            // List of encoding options
            const encodeList = [
                'utf8', 'utf-8', 'hex', 'base64', 'binary',
                'utf16le', 'ucs2', 'ucs-2', 'ascii', 'base64url', 'latin1'
            ];

            // Check if encoding flag is provided
            const encodeFlag = parameters[1] == '--encode';

            // Get the encoding parameter
            const encode = parameters[2];

            // Check if the file exists
            if (fs.existsSync(path)) {
                // Read the file and return its content
                return fs.readFileSync(path).toString(
                    encodeFlag ? (encodeList.includes(encode) ? encode : 'utf8') : 'utf8'
                );
            }
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


    tree() {
        const parameters = this.cli_args.slice(1);
        let path = parameters[0];

        if (parameters.length > 1) {
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            let dirs, files, virtualPath;
            // Maximum depth - 2
            const UNICODE_SYMBOL_BORDER_SQUARE = '└';
            const UNICODE_SYMBOL_BORDER_MID = '├';
            const UNICODE_SYMBOL_BORDER_PIPE = '│';
            const UNICODE_SYMBOL_BORDER_LINE = '─';

            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                virtualPath = `${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`;
                if (path == '.' || path == '../' || path == './') virtualPath = `${__dirname}/${this.USER_DIRECTORY_NAME}`;
            } else if (this.root == 'root') {
                virtualPath = `${__dirname}/${this.cdPath}${path[0] == '/' ? '' : '/'}${path}`;
            }

            if (fs.existsSync(virtualPath)) [dirs, files] = [getDirs(virtualPath), getFiles(virtualPath)];
            if (this.root == 'root' && this.cdPath == 'asmxOS') dirs = dirs.filter(dir => !['cli.js', 'config.js', 'core.js', 'neofetch.js'].includes(dir));

            console.log(`\x1b[38;5;0m. ${path}`);

            for (let index = 0; index < dirs.length; index++) {
                const majorDir = dirs[index];
                console.log(`${files.length > 0 ? UNICODE_SYMBOL_BORDER_MID : UNICODE_SYMBOL_BORDER_SQUARE}${UNICODE_SYMBOL_BORDER_LINE} \x1b[38;5;45m${majorDir}\x1b[38;5;0m`);
                let subDirs;

                if (this.root == 'root' && this.cdPath == 'asmxOS') {
                    subDirs = `${__dirname}/${this.USER_DIRECTORY_NAME}/${path}/${majorDir}`;
                    if (path == '.' || path == '../' || path == './') subDirs = `${__dirname}/${this.USER_DIRECTORY_NAME}/${majorDir}`;
                } else if (this.root == 'root') {
                    subDirs = `${__dirname}/${this.cdPath}${path[0] == '/' ? '' : '/'}${path}/${majorDir}`;
                }

                subDirs = getDirs(subDirs);

                if (subDirs.length > 0) {
                    for (let subIndex = 0; subIndex < subDirs.length; subIndex++) {
                        const dir = subDirs[subIndex];
                        console.log(`${UNICODE_SYMBOL_BORDER_PIPE}  ${subIndex + 1 == subDirs.length ? UNICODE_SYMBOL_BORDER_SQUARE : UNICODE_SYMBOL_BORDER_MID}${UNICODE_SYMBOL_BORDER_LINE} \x1b[38;5;45m${dir}\x1b[38;5;0m`);
                    }
                }

                if (index == dirs.length - 1 && files.length > 0) {
                    for (let index = 0; index < files.length; index++) {
                        const file = files[index];
                        console.log(`${index + 1 == files.length ? UNICODE_SYMBOL_BORDER_SQUARE : UNICODE_SYMBOL_BORDER_MID}${UNICODE_SYMBOL_BORDER_LINE} \x1b[38;5;231m${file}\x1b[38;5;0m`);
                    }
                }
            }
        }
    }


    /**
     * Creates a directory based on the provided path.
     * @returns {string} The current directory path.
     */
    mkdir() {
        // Get the command line arguments
        const parameters = this.cli_args;
        // Get the path from the arguments
        const path = parameters[1];

        // Check if there are too many parameters
        if (parameters.length > 2) {
            // Log an exception
            ServerLog.log("too many parameters", 'Exception');
        } else if (path) {
            // Check if the root and cdPath are specific values
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                // Create a directory at the specified path
                fs.mkdir(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`.trim(), () => { });
            } else if (this.root == 'root') {
                // Create a directory at the specified path
                fs.mkdir(`${__dirname}/${this.cdPath}/${path}`.trim(), () => { });
            } else {
                // Create a directory at the specified path
                fs.mkdir(path, () => { });
            }
        } else {
            // Get the current directory path
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }


    // Create a new file at the specified path with the given text
    touch() {
        // Get the command line arguments
        let parameters = this.cli_args;
        // Combine all arguments after the first two into a single string
        parameters = [...parameters.slice(0, 2), parameters.slice(2).join(' ')];
        // Extract the path and text from the parameters
        const path = parameters[1];
        const text = parameters[2];

        // Check if there are too many parameters
        if (parameters.length > 3) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else if (path) {
            // Check if the current directory is 'root' and the cdPath is 'asmxOS'
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                // Write the file to the user directory
                fs.writeFileSync(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else if (this.root == 'root') {
                // Write the file to the current directory
                fs.writeFileSync(`${__dirname}/${this.cdPath}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else {
                // Write the file to the specified path
                fs.writeFileSync(path, text ? text : '', { encoding: 'utf8' });
            }
        } else {
            // Return the current directory path
            let cd = `${this.root}${this.separateCD}${this.cdPath}`;
            return cd;
        }
    }

    // Create a new file at the specified path with the given text
    leaf() {
        // Get the command line arguments starting from the second argument
        let parameters = this.cli_args.slice(1);
        // Combine all arguments after the first one into a single string
        parameters = [...parameters.slice(0, 1), parameters.slice(1).join(' ')];
        // Extract the path and text from the parameters
        let path = parameters[0];
        const text = parameters[1];

        // Check if there are too many parameters
        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else if (path) {
            // Check if the path ends with '.' and append '.txt' if not
            if (path.endsWith('.')) {
                path += 'txt';
            } else if (!path.endsWith('.txt')) {
                path += '.txt';
            }

            // Check if the current directory is 'root' and the cdPath is 'asmxOS'
            if (this.root == 'root' && this.cdPath == 'asmxOS') {
                // Write the file to the user directory
                fs.writeFileSync(`${__dirname}/${this.USER_DIRECTORY_NAME}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else if (this.root == 'root') {
                // Write the file to the current directory
                fs.writeFileSync(`${__dirname}/${this.cdPath}/${path}`, text ? text : '', { encoding: 'utf8' });
            } else {
                // Write the file to the specified path
                fs.writeFileSync(path, text ? text : '', { encoding: 'utf8' });
            }
        }
    }


    /**
     * Executes the command line interface (CLI) logic.
     * @returns {void}
     */
    cli() {
        // Get the command line arguments
        const parameters = this.cli_args;

        // Check if there are too many parameters
        if (parameters.length > 2) {
            // Log an exception message
            ServerLog.log("too many parameters", 'Exception');
        } else if (parameters[1]) {
            // Set the root and cdPath properties
            this.root = 'cli';
            this.cdPath = parameters[1];
        } else {
            // Log an exception message for insufficient number of arguments
            ServerLog.log('Insufficient number of arguments\n', 'Exception');
        }
    }


    /** Fetches the system information using Neofetch. */
    neofetch() {
        Neofetch.neofetch.call(this, this.cli_args.slice(1));
    }


    /** Fetches the system information using Neofetch. */
    xfetch() {
        Neofetch.neofetch.call(this, this.cli_args.slice(1));
    }


    /** Prints the colors supported by the terminal. */
    colors() {
        /**
         * Logs the given text with indentation.
         * @param {string} text - The text to be logged.
         */
        const log = (text) => console.log(`\t\t\t\t\t${text}`);
        log('');

        let stansartsColor = '';
        for (let index = 1; index < 255; index++) stansartsColor += `\x1b[38;5;${String(index)}m ${index} \x1b[0m`;

        log(stansartsColor);
        log('');
    }


    /** Clears the console. */
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
        // Print version information
        process.stdout.write('AsmXOS v1.0.0 ');
        console.log('\tAsmXOS Corporation. All rights reserved.');
        console.log('\t\tOpen source source: https://github.com/langprogramming-AsmX/AsmX');

        this.flagUsage = false;
        this.commandUsage = false;
    }


    /**
     * List the contents of the current directory.
     * @returns {string} A formatted string representing the contents of the directory.
     */
    ls() {
        // Get the command line arguments passed to the program
        let parameters = this.cli_args.slice(1);

        // Helper function to iterate over files in a directory and perform a callback function
        const mapFiles = (path, cb) => { for (const file of getFiles(path)) cb(file) };

        // Helper function to iterate over directories in a directory and perform a callback function
        const mapDirs = (path, cb) => { for (const file of getDirs(path)) cb(file) };

        let path;

        // Determine the path based on the root and cdPath variables
        if (this.root == 'root' && this.cdPath == 'asmxOS') {
            path = parameters[0] ? `${__dirname}/${this.USER_DIRECTORY_NAME}/${parameters[0]}` : `${__dirname}/${this.USER_DIRECTORY_NAME}`;
        } else if (this.root == 'root') {
            path = parameters[0] ? `${__dirname}/${this.cdPath}/${parameters[0]}` : `${__dirname}/${this.cdPath}`;
        }

        let answer = [];

        console.log(path);

        // Iterate over directories in the specified path and add them to the answer array
        mapDirs(path, (dir) => answer.push(` \x1b[38;5;45musr/${dir}/\x1b[38;5;0m`));

        // Iterate over files in the specified path and add them to the answer array
        mapFiles(path, (file) => answer.push(` \x1b[38;5;231m${file}\x1b[38;5;0m`));

        // Join the elements of the answer array with a newline character and return the result
        return answer.join('\n');
    }
    //============================================================================================
}


// Create a new instance of the Cli class
let cli = new Cli();

// Export the cli object
module.exports = cli;