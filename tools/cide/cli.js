const config = require("../../config");
const Color = require("../../utils/color");

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

        if (args[0] = 'cide-cli') {
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

    static help() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');

        if (config.INI_VARIABLES?.CLI_THEME == 'common') {
            let cli = `${Color.FG_GRAY}cide-cli${Color.RESET}`;

            log(theme?.forgecolor?.text || Color.FG_GRAY);
            log(`USAGE:`);
            log(`-`.repeat(96));
            log(`${cli} [cmd] [options] -[flags] [options]`);
            log(cli, 'help', edit.separator, 'The command allows you to learn more about CIDE.');
            log(`Keyboard shortcuts:`);
            log('', 'Ctrl + S', edit.separator, 'This keyboard shortcut allows you to save the code in an AsmX file..');
        } else if (config.INI_VARIABLES?.CLI_THEME != 'common') {
            const theme = require(`../../etc/cli/theme/${config.INI_VARIABLES?.CLI_THEME}/theme.json`);
            const forgecolor = {};

            const edit = {
                separator: theme?.edit?.separator ? theme?.edit?.separator : '-'
            };

            for (const property of ['cli', 'title', 'document', 'command', 'params', 'flag', 'separator', 'argument']) {
                forgecolor[property] = theme?.forgecolor[property] ? Reflect.ownKeys(Color).slice(3).includes(`FG_${theme?.forgecolor[property]}`) ? Color[`FG_${theme?.forgecolor[property]}`] : theme?.forgecolor[property] : Color.FG_GRAY;
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
            log(buildText(cli, 'help', edit.separator, 'The command allows you to learn more about CIDE.'));
            log(`Keyboard shortcuts:`);
            log(buildText('', 'Ctrl + S', edit.separator, 'This keyboard shortcut allows you to save the code in an AsmX file'));
            log(buildText('', 'Ctrl + E', edit.separator, 'This keyboard shortcut allows you to exit CIDE'));
        }
    }
}

module.exports = CLI;