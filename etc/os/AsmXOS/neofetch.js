const fs = require('fs');
const os = require("os");

const config = require("../../../config");
const ServerLog = require('../../../server/log');
const Color = require('../../../utils/color');
const { getDirs, getFiles, getFileSize, sizeBytes } = require("../../../fs");
const { execSync } = require('child_process');
const Theme = require('../../../tools/theme');
const { question } = require('readline-sync');
const { table } = require('console');
const { PRODUCT_NAME, PRODUCT_ID, PRODUCCT_RELEASE, PRODUCT_REPOSITORY, PRODUCT_TYPE_SOURCE } = require('./config');


class Neofetch {
    static URL_NEOFETCH_CONFIG = `${__dirname}/etc/neofetch.conf`

    static neofetch(parameters) {
        let colorsIndex, pageIndex;
        
        if (['--colors', '--page'].includes(parameters[0])) {
            if (parameters[1] && /[0-9]+/.test(parameters[1])) {
                if (parameters[0] == '--colors') colorsIndex = parameters[1];
                else if (parameters[0] == '--page') pageIndex = parameters[1];
                parameters.pop();
            }
        }


        if (parameters[0] == 'config') {
            let conf;
            if (fs.existsSync(Neofetch.URL_NEOFETCH_CONFIG)) conf = JSON.parse(fs.readFileSync(Neofetch.URL_NEOFETCH_CONFIG).toString('utf8') || '{}');
            if (conf?.config == undefined) conf.config = {};
            const flag = parameters[1];

            if (['--get'].includes(flag)) {
                Neofetch.Config().run(flag.slice(2));
            } else {
                ServerLog.log('flag not found\n', 'Exception');
            }

            fs.writeFileSync(Neofetch.URL_NEOFETCH_CONFIG, JSON.stringify(conf), { encoding: 'utf8' });
        }  else if (parameters.length > 1) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            const flag = parameters[0];
            const flags = ['--colors', '--info', '--logo', '--help', '--left', '--right', '--top', '--page'];
            const log = (text) => console.log(`\t\t\t\t\t${text}`);

            function colors(index_t) {
                log('');
                let stansartsColor = '';

                if (index_t) {
                    for (let index = 8 * index_t; index < (8 * index_t) + 8; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                    log(stansartsColor);
                    stansartsColor = '';
                    for (let index = (8 * index_t) + 8; index < (8 * index_t) + 16; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                } else {
                    for (let index = 0; index < 8; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                    log(stansartsColor);
                    stansartsColor = '';
                    for (let index = 8; index < 8 * 2; index++) stansartsColor += `\x1b[48;5;${String(index)}m   \x1b[0m`;
                }

                log(stansartsColor);
                log('');
            }


            function infoMatrix() {
                let matrix = [];
                let conf, privateProperties;

                if (fs.existsSync(Neofetch.URL_NEOFETCH_CONFIG)) {
                    let neofetchConfig = JSON.parse(fs.readFileSync(Neofetch.URL_NEOFETCH_CONFIG).toString('utf8') || '{}');
                    conf = neofetchConfig?.styles;
                    privateProperties = neofetchConfig?.config;
                }

                matrix.push(`${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.root}\x1b[0m${this.separateCD}${conf?.home ? `\x1b[38;5;${conf?.home}m` : ''}${this.cdPath}\x1b[0m`);
                matrix.push('-'.repeat(18));

                let info_t = {
                    OS: `AsmX OS (${os.arch()})`,
                    Hostname: os.hostname(),
                    Kernel: 'AsmX Kernel',
                    Architecture: 'AsmX',
                    Uptime: Math.floor(os.uptime() / 60 / 60) + ' mins',
                    Packages: getDirs(`${__dirname}/usr/packages`)?.length + ' (.pkg)',
                    Shell: this.variable.$SHELL,
                    Theme: config.INI_VARIABLES?.CLI_THEME || 'common (default)',
                    CPU: os.cpus()[0]['model'],
                }


                for (const property_t of Reflect.ownKeys(info_t)) {
                    if (!privateProperties?.hide?.includes(property_t)) {
                        matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}${property_t}\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${info_t[property_t]}\x1b[0m`);
                    }
                }


                if (process.platform == 'win32') {
                    let gpu = execSync('wmic path win32_VideoController get name');

                    if (!privateProperties?.hide?.includes('GPU')) {
                        matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}GPU\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${gpu.toString('utf8').split('\n')[1].trim()}\x1b[0m`);
                    }
                }


                if (!privateProperties?.hide?.includes('Memory')) {
                    matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}Memory\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${sizeBytes(os.freemem())}\x1b[0m / ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${sizeBytes(os.totalmem())}\x1b[0m`);
                }

                return matrix;
            }


            function logoMatrix() {
                return [
                    '             \\##\\     /#      ',
                    '              \\##\\   /#/      ',
                    '               \\##\\ /#/       ',
                    '                \\#/v#/        ',
                    '                 /##/         ',
                    '                /##/ _        ',
                    '              /###/ /#\\       ',
                    '             /###/  \\##\\      ',
                    '            /###/    \\##\\     ',
                    '           /###/      \\##\\    '
                ]
            }


            function help() {
                let log = (message, params) => console.log(`\t${message}`, params ? params : '');
                Theme.setCallbackPrint(log);
                let cli = 'asmxos-cli';
                log(`USAGE:`);
                log(`-`.repeat(96));
                log(`${cli} [cmd] [options] -[flags] [options]`);
                Theme.print(cli, 'neofetch', 'The command allows you to display complete information about the OS', 2);
                Theme.print(cli, 'neofetch', 'The command allows you to learn the basic about the OS', 1, { flag: '--help' });
                Theme.print(cli, 'neofetch', 'The command allows you to output information about the OS', 1, { flag: '--info' });
                Theme.print(cli, 'neofetch', 'The command allows you to display only the OS logo', 1, { flag: '--logo' });
                Theme.print(cli, 'neofetch', 'The command allows you to output only standard and dark OS colors', 1, { flag: '--colors' });
                Theme.print(cli, 'neofetch', 'The command allows you to display the left part of the information about the OS', 1,{ flag: '--left' });
                Theme.print(cli, 'neofetch', 'The command allows you to display the right part of the information about the OS', 1, { flag: '--right' });
                Theme.print(cli, 'neofetch', 'The command allows you to display only the top part of the OS information', 1, { flag: '--top' });
                log(`-`.repeat(96));
            }


            function printTable(left, right) {
                let max = Math.max(left.length, right.length);
                for (let index = 0; index < max; index++) console.log(`${left[index] ? left[index] : right[index] ? ' '.repeat(Math.max(...logoMatrix().map(s => s.length))) : ''}          ${right[index] ? right[index] : ''}`);
            }


            if (flags.includes(flag)) {
                let call_t = {
                    colors: () => colors(colorsIndex ? +colorsIndex : undefined),
                    logo: () => { for (const line of logoMatrix()) console.log(line) },
                    info: () => { for (const line of infoMatrix.call(this)) log(line) },
                    left: () => { for (const line of logoMatrix()) console.log(line) },
                    top: () => printTable(logoMatrix(), infoMatrix.call(this)),
                    help,

                    right: () => {
                        for (const line of infoMatrix.call(this)) log(line); 
                        colors();
                    },

                    page: () => {
                        if (pageIndex) {
                           Neofetch.Page().open(+pageIndex);
                        } else {
                            printTable(logoMatrix(), infoMatrix.call(this));
                            colors();
                        }
                    }
                }[flag.slice(2)]['call']();
            } else if (flag == undefined) {
                printTable(logoMatrix(), infoMatrix.call(this));
                colors();
            } else {
                ServerLog.log('flag not found\n', 'Exception');
            }
        }
    }


    static Config() {
        return class {
            static run(call_t) {
                this[call_t]();
            }


            static get() {
                let neofetchConfig = JSON.parse(fs.readFileSync(Neofetch.URL_NEOFETCH_CONFIG).toString('utf8') || '{}');
                let conf = neofetchConfig?.styles;
                let privateProperties = neofetchConfig?.config;
                let obj_t = {};
                if (conf) obj_t.styples = conf;

                if (privateProperties?.hide) {
                    let hide_f = {};
                    for (const property_t of privateProperties?.hide) hide_f[property_t] = true;
                    obj_t.hide = hide_f;
                }

                table(obj_t);
            }
        }
    }


    static Page() {
        return class {
            static open(index) {
                return {
                    0: () => console.log('This is Elon Musk'),

                    1: () => {
                        let matrix = [];
                        let conf, privateProperties;

                        if (fs.existsSync(Neofetch.URL_NEOFETCH_CONFIG)) {
                            let neofetchConfig = JSON.parse(fs.readFileSync(Neofetch.URL_NEOFETCH_CONFIG).toString('utf8') || '{}');
                            conf = neofetchConfig?.styles;
                            privateProperties = neofetchConfig?.config;
                        }


                        let info_t = {
                            'PRODUCT NAME': PRODUCT_NAME,
                            'PRODUCT ID': PRODUCT_ID,
                            'PRODUCT RELEASE': PRODUCCT_RELEASE,
                            'PRODUCT TYPE SOURCE': PRODUCT_TYPE_SOURCE,
                            'PRODUCT REPOSITORY': PRODUCT_REPOSITORY
                        }

                        for (const property_t of Reflect.ownKeys(info_t)) {
                            if (!privateProperties?.hide?.includes(property_t)) {
                                matrix.push(`${conf?.property ? `\x1b[38;5;${conf?.property}m` : ''}${property_t}\x1b[0m: ${conf?.text ? `\x1b[38;5;${conf?.text}m` : ''}${info_t[property_t]}\x1b[0m`);
                            }
                        }

                        for (const info_t of matrix) console.log(`${'\t'.repeat(5)}${info_t}`);
                    }
                }[index]?.();
            }
        }
    }
}

module.exports = Neofetch;