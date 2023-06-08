const fs = require('fs');
const ServerLog = require('../../server/log');


function addition(items) {
    let result = 0;
    for (const int of items) result += int;
    return result;
}


class CortexMARM {
    islabel = false;

    constructor(filename, ast) {
        this.ast = ast;
        this.filename = filename;
        this.compileSource = [];
        ServerLog.log('Compile source code: Cortex-M ARM', 'Compiler');

        this.compileSource.push('start:');
        this.islabel = true;

        for (let index = 0; index < this.ast.length; index++) {
            const tree = this.ast[index];
            this[`compile${tree['instruction'][0].toUpperCase() + tree['instruction'].substring(1)}Statement`](tree);
        }

        this.compileSource.push('stop: b start');
        this.islabel = false;
        this.compileSource.length > 0 && fs.writeFileSync(filename, this.compileSource.join('\n'));
    }


    compileAddStatement(tree) {
        let r0 = tree.r0;
        let r1 = addition(tree.arguments);
        let r2 = 0;
        this.compileSource.push(`${this.islabel ? '\t' : ''}add ${r0} #${r1} #${r2}`);
    }
}


module.exports = CortexMARM;