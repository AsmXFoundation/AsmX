const fs = require('fs');
const highlightCLI = require('../../utils/highlight');

class CIDE {
    static run() {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        let source = [];
        let idx = 1;
        process.stdout.write(`${idx} | `);
        const readline = require('readline');
        readline.emitKeypressEvents(process.stdin);
        process.stdin.resume();

        process.stdin.on('data', function (data) {
            process.stdin.on('keypress', (ch, key) => {
                if (key && key.ctrl && key.name == 's') {
                    fs.writeFileSync('tools/cide/workflow/code.asmX', source.join('\n'), { encoding: 'utf8' });
                    console.log('Saved!');
                } else if (key && key.ctrl && key.name == 'e') {
                    process.exit();
                } else if (key && key.ctrl && key.name == 'c') {}
            });

            source.push(data);
            console.clear();
            for (let index = 1; index < source.length; index++) process.stdout.write(`${index}${' '.repeat(String(source.length).length - String(index).length)} | ` + highlightCLI.light(source[index]));
            process.stdout.write(`${idx} | `);
            idx++;
        });
    }
}


module.exports = CIDE;