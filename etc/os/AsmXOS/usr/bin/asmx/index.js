const cli = require('../../../cli');

class AsmXShell {
    static run(content_t) {
        if (typeof content_t == 'string') {
            content_t = content_t.split('\n');
        }

        for (const line of content_t) {
            let response;
            let cmds = line.split(' ');

            if ([1, 2].includes(cmds.indexOf('='))) {
                let token = cmds.indexOf('=') == 2 ? cmds[0] : false;
                let name = cmds[0];

                if (token && ['let', 'const'].includes(token)) {
                    name = cmds[1];
                    let value = cmds.slice(cmds.indexOf('=') + 1).join(' ');

                    if (token == 'let') {
                        cli.userVariable[name] = value;
                    } else if (token == 'const') {
                        if (!Reflect.ownKeys(cli.userConstant).includes(name)) cli.userConstant[name] = value;
                    }
                } else if (!token) {
                    cli.userVariable[name] = cmds.slice(cmds.indexOf('=') + 1).join(' ');
                }
            } else {
                let countVariables = Reflect.ownKeys(cli.userVariable).length + Reflect.ownKeys(cli.userConstant).length;

                if (countVariables > 0) {
                    cmds.forEach((cmd, i) => {
                        if (/\%[a-zA-Z][a-zA-Z0-9_]+\%/.exec(cmd)) {
                            let name = /\%([a-zA-Z][a-zA-Z0-9_]+)\%/.exec(cmd)[1].trim();

                            if (Reflect.ownKeys(cli.userVariable).includes(name)) {
                                cmds[i] = cmd.replaceAll(`%${name}%`, cli.userVariable[name]);
                            } else if (Reflect.ownKeys(cli.userConstant).includes(name)) {
                                cmds[i] = cmd.replaceAll(`%${name}%`, cli.userConstant[name]);
                            }
                        }
                    });
                }

                if (!line.startsWith('#')) response = cli.execute(cmds);
                
                if (typeof response == 'string') console.log(response);
    
                else if (typeof response == 'object' && !Array.isArray(response)) {
                    if (response?.type && response.type == 'thread') {
                        for (const answer_t of response.response) console.log(answer_t);
                    }
                }
            }
        }
    }
}

module.exports = AsmXShell;