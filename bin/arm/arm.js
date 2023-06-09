const fs = require('fs');
const ServerLog = require('../../server/log');
const MiddlewareSoftware = require('../../middleware.software');


function addition(items) {
    let result = 0;
    for (const int of items) result += int;
    return result;
}

for (let index = 0; index < 6; index++)
    MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: `$arg${index}`, value: 0 } });

MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$offset', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$name', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$math', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$eq', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$seq', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$cmp', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$xor', value: 0 } });
MiddlewareSoftware.compileStatement({ instruction: 'mov', variable: { name: '$and', value: 0 } });


class CortexMARM {
    islabel = false;

    constructor(filename, ast) {
        this.ast = ast;
        this.filename = filename;
        this.compileSource = [];
        ServerLog.log('Compile source code: Cortex-M ARM', 'Compiler');

        const startSource = [
            '.text',
            '.global start',
            '',
        ];

        for (const code of startSource) this.compileSource.push(code);
        this.compileSource.push('start:');
        this.islabel = true;

        for (let index = 0; index < this.ast.length; index++) {
            const tree = this.ast[index];
            this[`compile${tree['instruction'][0].toUpperCase() + tree['instruction'].substring(1)}Statement`](tree);
        }

        this.compileSource.push('\nstop: b start');
        this.islabel = false;
        this.compileSource.length > 0 && fs.writeFileSync(filename, this.compileSource.join('\n'));
    }


    compileAddStatement(tree) {
        let r0 = tree.r0;
        let r1 = addition(tree.arguments);
        let r2 = 0;
        this.compileSource.push(`${this._isTab()}add ${r0} #${r1} #${r2}`);
    }


    compileMovStatement(tree) {
        let variable = tree.variable;
        let name = variable.name;
        let value = variable.value;
        if (!isNaN(value)) value = `#${value}`;
        this.compileSource.push(`${this._isTab()}mov ${name} ${value}`);
    }

    
    _isTab() {
        return this.islabel ? '\t' : '';
    }
}


module.exports = CortexMARM;