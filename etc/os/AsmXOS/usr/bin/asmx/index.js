const cli = require('../../../cli');

class AsmXShell {
    static run(content_t) {
        if (typeof content_t == 'string') {
            content_t = content_t.split('\n');
        }

        for (const line of content_t) {
            let response;
            if (!line.startsWith('#')) response = cli.execute(line.split(' '));
            
            if (typeof response == 'string') console.log(response);

            else if (typeof response == 'object' && !Array.isArray(response)) {
                if (response?.type && response.type == 'thread') {
                    for (const answer_t of response.response) console.log(answer_t);
                }
            }
        }
    }
}

module.exports = AsmXShell;