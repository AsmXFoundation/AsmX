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
        const SECTION_RODATA_SIGNATURE = '.rodata';
        const SECTION_DATA_SIGNATURE = '.data';
        this.IS_SECTION_DATA_RESOURCES = false;
        this.IS_SECTION_RODATA_RESOURCES = false;
        this.SECTION_RODATA = [];
        this.SECTION_DATA = [];
        
        const SECTION_RESOURCES_INSTRUCTIONS = ['variable', 'constant'];
        function isresource(o) { return SECTION_RESOURCES_INSTRUCTIONS.includes(o['instruction']) };

        let resources = this.ast.filter(tree => isresource(tree));
        
        resources.forEach(resource => {
            if (resource['instruction'] === 'variable') this.IS_SECTION_DATA_RESOURCES = true;
            if (resource['instruction'] === 'constant') this.IS_SECTION_RODATA_RESOURCES = true;
            this[`compile${resource['instruction'][0].toUpperCase() + resource['instruction'].substring(1)}Statement`](resource);
        });
        

        this.SECTION_RESOURCES = [
            this.IS_SECTION_DATA_RESOURCES ? SECTION_DATA_SIGNATURE : '',
            ...this.SECTION_DATA,
            this.IS_SECTION_RODATA_RESOURCES ? SECTION_RODATA_SIGNATURE : '',
            this.SECTION_RODATA,
        ];
        
        const startSource = [
            '.global _start',
            '',
            ...this.SECTION_RESOURCES,
            '.text'
        ];

        this.IS_SECTION_DATA_RESOURCES = false;
        this.IS_SECTION_RODATA_RESOURCES = false;
        this.ast = this.ast.filter(tree => !isresource(tree));
        
        for (const code of startSource) this.compileSource.push(code);
        this.compileSource.push('_start:');
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


    compileConstantStatement(tree) {
        let constant = tree.constant;
        let name = constant.name;
        let value = constant.value;
    }


    compileVariableStatement(tree) {
        let variable = tree.variable;
        let name = variable.name;
        let type = variable.type;
        let value = variable.value;
        let DIRECTIVE = '.ascii';

        if (type ==  'String')  DIRECTIVE = '.ascii';
        if (type ==  'Float')  DIRECTIVE = '.float';
        if (type == 'Int')  DIRECTIVE = '.word';
    
        if (type == 'Bool') {
            DIRECTIVE = 'db';
            if (value == 'true') value = 1;
            else if (value == 'false') value = 0;
            else value = 0;
        }

        this.SECTION_DATA.push(`${this.IS_SECTION_DATA_RESOURCES ? '\t': ''}${name}: ${DIRECTIVE} ${value}`);
    }

    
    _isTab() {
        return this.islabel ? '\t' : '';
    }
}


module.exports = CortexMARM;