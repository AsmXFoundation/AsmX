const config = require("../../config");
const Color = require("../../utils/color");
const Theme = require("../theme");

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

            if (this.counter == 0) console.log('get more information: cide-cli help');
        }
    }
    //============================================================================================


    static help() {
        let log = (message, params) => console.log(`\t${message}`, params ? params : '');
        Theme.setCallbackPrint(log);
        let cli = `cide-cli`;
        log(Color.FG_GRAY);
        log(`USAGE:`);
        log(`-`.repeat(96));
        log(`${cli} [cmd] [options] -[flags] [options]`);
        Theme.print(cli, 'help', 'The command allows you to learn more about CIDE.');
        log(`Keyboard shortcuts:`);
        Theme.print('', 'Ctrl + S', 'This keyboard shortcut allows you to save the code in an AsmX file');
        Theme.print('', 'Ctrl + E', 'This keyboard shortcut allows you to exit CIDE');
        log(`-`.repeat(96));
    }
}


module.exports = CLI;