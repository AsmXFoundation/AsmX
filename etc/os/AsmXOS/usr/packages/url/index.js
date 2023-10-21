const ServerLog = require('../../../../../../server/log');

class CLI {
    static url() {
        let parameters = this.cli_args.slice(1);
        let [flags, url, last] = [['--parse', '--params'],, parameters[parameters.length -1]];

        if (flags.includes(last)) {
            url = parameters.slice(0, -1).join('');
            parameters = [url, last];
        }

        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            if (last == '--parse') {
                try {
                    let response = '{\n';
                    url = new URL(url);

                    let properties = ['href', 'origin', 'protocol', 'username', 'password', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
                    for (const property of properties)  response += ` ${property}: '${url[property]}',\n`;

                    response = response.trimEnd().slice(0, -1);
                    response += '\n}';

                    return response;
                } catch {
                    ServerLog.log('Path parsing error\n', 'Exception');
                }
            } else if (last == '--params') {
                try {
                    let response = '{\n';

                    for (const [key, value] of new URLSearchParams(url).entries())response += ` ${key}: '${value}',\n`;
                    
                    response = response.trimEnd().slice(0, -1);
                    response += '\n}';
                    
                    return response;
                } catch {
                    ServerLog.log('Path parsing error\n', 'Exception');
                }
            }
        }
    }
}

module.exports = CLI;