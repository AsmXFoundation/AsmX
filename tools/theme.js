const config = require("../config");
const Color = require("../utils/color");

class Theme {
    static setCallbackPrint(cb) {
        this.cb = cb;
    }


    static print(cli, command, text, tabs, other = undefined) {
        const forgecolor = {};
        let theme;

        if (config.INI_VARIABLES?.CLI_THEME != 'common') {
            theme = require(`../etc/cli/theme/${config.INI_VARIABLES?.CLI_THEME}/theme.json`);
        } else theme = {};

        const edit = {
            separator: theme?.edit?.separator ? theme?.edit?.separator : '-'
        };

        for (const property of ['cli', 'title', 'document', 'command', 'params', 'flag', 'separator', 'argument']) {
            forgecolor[property] = (theme?.forgecolor)?.[property] ? Reflect.ownKeys(Color).slice(3).includes(`FG_${theme?.forgecolor[property]}`) ? Color[`FG_${theme?.forgecolor[property]}`] : theme?.forgecolor[property] : Color.FG_GRAY;
        }

        cli = `${forgecolor?.cli || Color.FG_GRAY}${cli}${Color.RESET}`;
        let doc = (text) => `${forgecolor.document}${text}${Color.RESET}`;
        let cmd = (text) => `${forgecolor.command}${text}${Color.RESET}`;
        let params = (text) => `${forgecolor.params}${text}${Color.RESET}`;
        let arg = (text) => `${forgecolor.argument}${text}${Color.RESET}`;
        let flag = (text) => `${forgecolor.flag}${text}${Color.RESET}`;
        let separator = (text) => `${forgecolor.separator}${text}${Color.RESET}`;

        let cb = { doc, cmd, params, arg, flag };

        function buildText(cli, command, separate, text, tabs, other = undefined) {
            return `${cli} ${cmd(command)} ${other || ''}${tabs ? '\t'.repeat(tabs) : '\t\t\t'}${separate ? separator(separate) : ''} ${text ? doc(text) : ''}`;
        }

        function buildOtherObject(other) {
            if (['doc', 'cmd', 'flag', 'arg', 'params'].includes(Reflect.ownKeys(other)[0])) 
                return cb[Reflect.ownKeys(other)[0]](other[Reflect.ownKeys(other)[0]]);
        }

        if (typeof other == 'object' && !Array.isArray(other)) {
            other = buildOtherObject(other);
        } else if (typeof other == 'object' && Array.isArray(other)) {
            let txt = '';
            for (const cell of other) txt += buildOtherObject(cell) + ' ';
            other = txt;
        }


        if (this.cb)
            this.cb(buildText(cli, command, edit.separator, text, tabs, other));
        else
            return buildText(cli, command, edit.separator, text, tabs, other);
    }
}

module.exports = Theme;