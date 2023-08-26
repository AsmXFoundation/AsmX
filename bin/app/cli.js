const fs = require('fs');
const path = require('path');

const Compiler = require("../../compiler");
const Parser = require("../../parser");
const ServerLog = require("../../server/log");
const App = require("./app");
const config = require('../../config');
const Color = require('../../utils/color');
const { getDirs } = require('../../fs');

class CLI {
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

        if (args[0] = 'app-cli') {
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

            if (this.counter == 0) console.log('get more information: app-cli usage');
        }
    }
    //============================================================================================

    static build(){
        const parameters = this.cli_args.slice(2).filter(arg => arg.trim() != '');

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const architecture = parameters[0];
        const file = parameters[1];
        let outputfile = parameters[2];
        const sourceparse =  Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }));
        new Compiler(sourceparse);

        if (architecture.indexOf('@') > -1) {
            const [arch, version] = architecture.split('@');

            try {
                const complier = require(`./${version}/${arch}`);
                if (outputfile && !outputfile.endsWith('.app')) outputfile += '.app';
                if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}.app`;
                this.buildFile = outputfile;

                if (arch == 'app')
                    new complier(outputfile, 'x64', 'x64', sourceparse);
                else ServerLog.log('Unknow version architecture', 'Exception');
            } catch (exception) {
                console.log(exception);
                ServerLog.log('Unknow version architecture', 'Exception');
            }
        } else if (architecture == 'app') {
            if (outputfile && !outputfile.endsWith('.app')) outputfile = outputfile + '.app';
            if (outputfile == undefined) outputfile = `${path.parse(file)['dir']}\\${path.parse(file)['name']}.app`;
            this.buildFile = outputfile;
            new App(outputfile, 'x64', 'x64', MiddlewareSoftware.source);
        } else {
            ServerLog.log('Unknow architecture', 'Exception');
            process.exit(1);
        }
    }


    static help() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
        const forgecolor = {};
        let theme;

        if (config.INI_VARIABLES?.CLI_THEME != 'common') {
            theme = require(`../../etc/cli/theme/${config.INI_VARIABLES?.CLI_THEME}/theme.json`);
        } else theme = {};

        const edit = {
            separator: theme?.edit?.separator ? theme?.edit?.separator : '-'
        };

        for (const property of ['cli', 'title', 'document', 'command', 'params', 'flag', 'separator', 'argument']) {
            forgecolor[property] = (theme?.forgecolor)?.[property] ? Reflect.ownKeys(Color).slice(3).includes(`FG_${theme?.forgecolor[property]}`) ? Color[`FG_${theme?.forgecolor[property]}`] : theme?.forgecolor[property] : Color.FG_GRAY;
        }

        let cli = `${forgecolor?.cli || Color.FG_GRAY}app-cli${Color.RESET}`;
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
        log(buildText(cli, 'help', edit.separator, 'The command allows you to learn more about the App CLI'));
        log(``);
        log(`${cli} ${cmd('build')} ${params('[arch]')} ${arg('./file')} ${arg('./out')}`);
        log(`\t${separator(edit.separator)} ${doc('The command allows you to build/compile an "[arch]" architecture file with the file\n\t\t  name "./file" and have the last optional field for the path/file name.')}`);
        log(``);
        log(buildText(cli, 'latest', edit.separator, 'The command allows you to find out the latest version of the compiler'));
        log(buildText(cli, 'versions', edit.separator, 'The command allows you to find out all versions of the compiler', 2));
    }


    static latest(){
        const parameters = this.cli_args.slice(2).filter(arg => arg.trim() != '');

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const versions = getDirs('./bin/app/');
    
        function __maxVersion(versions) {
            if (versions.length == 0) {
                return 'v1 (default)';
            } else if (versions.length == 1) {
                return versions[0];
            } else {
                let filter = versions.filter(v => v.startsWith('v')).map(v => v.slice(v.indexOf('v') + 1));
                let maxDotSymbol = Math.max(...filter.map(v => v.match(/(\.)/gm)?.length).filter(Boolean));

                if (maxDotSymbol == -Infinity) {    // v[int]
                    return 'v' + Math.max(...filter.map(v => +v));
                } else {                            // vMAJOR.MINOR.PATCH
                    filter = filter.map(version => {
                       let [major, minor, patch] = version.split('.');
                       return { major, minor, patch };
                    });

                    const max = (list, property) => Math.max(...list.map(v => +v?.[property]));
                    const filterBymax = (list, max, property) => list.filter(v => +v?.[property] == max);

                    const replaceToNull = (list, property) => {
                        return list.map(v => {
                            if (v?.[property] == undefined) v[property] = 0;
                            return v;
                        });
                    }

                    let i = 1;

                    for (const property of Reflect.ownKeys(filter[0])) {
                        filter = replaceToNull(filterBymax(filter, max(filter, property), property), Reflect.ownKeys(filter[0])[i]);
                        i++;
                    }

                    filter = filter[filter.length - 1];
                    return `v${filter?.major}${typeof filter?.minor == 'number' ?  '' : `.${filter?.minor}`}${typeof filter?.patch == 'number' ?  '' : `.${filter?.patch}`}`
                }
            }
        }

        console.log(' latest: ', __maxVersion(versions));
    }


    static versions() {
        const parameters = this.cli_args.slice(2).filter(arg => arg.trim() != '');

        if (parameters.length > 1) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        const versions = getDirs('./bin/app/');
        let filter = versions.filter(v => v.startsWith('v'));
        for (let index = 0; index < filter.length; index++) console.log(` ${index} -> ${filter[index]}`);
    }
}

module.exports = CLI;