//============================================================================================
// AsmX Package Manager - APM
//============================================================================================

const config = require("../../config");
const ServerLog = require("../../server/log");
const Color = require("../../utils/color");
const AsmXPackageManager = require("./apm");

const fs = require('fs');

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

        if (args[0] = 'apm-cli') {
            let flags = ['ls', 'graph', 'o', 'v', 'c'];

            for (const argument of args.slice(1)) {
                this.beforeCounter++;
                if (this.isexit) process.exit(1);

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

            if (this.counter == 0) console.log('get more information: apm-cli help');
        }
    }
    //============================================================================================

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

        let cli = `${forgecolor?.cli || Color.FG_GRAY}apm-cli${Color.RESET}`;
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
        log(buildText(cli, 'help', edit.separator, 'the command lets you learn more about AsmX Package Manager',));
        log(buildText(cli, 'install', edit.separator, 'the command allows you to install a package of type [type] with the name \'name\'', 1, `${params('[type]')} ${arg('name')}`));
        log(buildText(cli, 'uninstall', edit.separator, 'the command allows you to delete a package of type [type] with the name \'name\'', 1, `${params('[type]')} ${arg('name')}`));
        log(buildText(cli, 'is', edit.separator, 'the command lets you find out if there is a package of type [type] with the name \'name\'', 2, `${params('[type]')} ${arg('name')}`));
        log(buildText(cli, 'verify', edit.separator, 'The command allows you to check a package of the type [type] with the name \'name\' for verification.', 1, `${params('[type]')} ${arg('name')}`));
        log(`-`.repeat(96));
    }


    static install() {
        const parameters = this.cli_args.slice(2);
        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        AsmXPackageManager.install(...parameters);
    }


    static uninstall() {
        const parameters = this.cli_args.slice(2);

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        AsmXPackageManager.uninstall(...parameters);
    }


    static is() {
        const parameters = this.cli_args.slice(2);
        const type = parameters[0];
        const name = parameters[1];
        const PACKAGES_URL = '../packages';

        if (parameters.length > 3) {
            ServerLog.log("too many parameters\n", 'Exception');
            process.exit(1);
        }

        if (type == 'box')
            ServerLog.log(!fs.existsSync(`${PACKAGES_URL}/${name}/`) ? "This package non-exists\n" : "This package exists\n", 'Exception');
    }


    static verify() {
        const parameters = this.cli_args.slice(2);

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        AsmXPackageManager.verify(...parameters);
    }
}


module.exports = CLI;