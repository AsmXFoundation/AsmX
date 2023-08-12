//===========================================================================================
//          The main part in the AsmX compiler, the Kernel is also the main part.
//===========================================================================================

// requires
const fs = require('fs');
const { exec, execSync } = require('child_process');

// Components that compiler
const { UnitError, TypeError, RegisterException, ArgumentError, ImportException, StackTraceException, UsingException, ConstException, SystemCallException, InstructionException } = require('./exception');
const ValidatorByType = require('./checker');
const { FlowOutput, FlowInput } = require('./flow');
const Issues = require("./issue");
const { Memory, MemoryAddress, MemoryVariables } = require("./memory");
const Parser = require('./parser');
const Route = require("./route");
const Stack = require("./stack");
const unitCall = require('./unit.call');
const { Type, List } = require('./types');
const ServerLog = require('./server/log');
const KernelOS = require('./kernelos');
const Color = require('./utils/color');
const Structure = require('./structure');
const config = require('./config');
const Analysis = require('./analysis');
const Garbage = require('./garbage');
const Task = require('./task');
const MiddlewareSoftware = require('./middleware.software');
const NeuralNetwork = require('./tools/neural');
const Security = require('./tools/security');
const Interface = require('./interface');
const Expression = require('./expression');
const EventEmulator = require('./event');

class Compiler {
    constructor(AbstractSyntaxTree) {
        this.AbstractSyntaxTree = AbstractSyntaxTree; // <Type> - array
        this.options = arguments[2];
        this.scope = arguments[1] || 'global'; // or 'local'
        this.type = this.options?.registers?.type || 'Program';
        this.argsScopeLocal = this.options?.argsScopeLocal || {}; // arguments from the unit
        this.set = [];
        this.constants = [];
        this.labels = [];
        this.subprograms = [];
        this.enviroments = [];
        this.fors = [];
        this.exceptions = [];
        this.trys = [];
        this.usings = [];
        this.collections = { struct: [], enum: [], class: [], collection: [] };
        this.interfaces = { structs: [], enums: [], collections: [] };
        this.registers = {};
        const PATH_TO_SYSTEMS_DIRECTORY = './systems';
        this.STACKTRACE_LIMIT = 10;
        this._task = Task;

        /* 
            The above code is defining an object called "This" with two properties: "global" and
            "local". The "global" property has two sub-properties: "set" and "const", which are assigned
            the values of the global "set" function and the global "constants" object, respectively. The
            "local" property has one sub-property called "unit", which has two sub-properties: "set" and
            "const", both of which are initially set to null. 
        */
        this.This = {
            kernelos: KernelOS,
            label: this.labels,

            global: {
                set: this.set,
                const: this.constants,
                struct: this.collections.struct
            },

            local: {
                unit: {}
            }
        }
        
        // Call this args
        this.$arg0 = 0x00;
        this.$arg1 = 0x00;
        this.$arg2 = 0x00;
        this.$arg3 = 0x00;
        this.$arg4 = 0x00;
        this.$arg5 = 0x00;
        
        
        /* Setting up the compiler. */
        // models
        this.stack = new Stack();
        this.route = new Route();
        this.mem = Memory;
        this.$stack = this.stack;
        this.$list = { $urt: [], $ret: [], $input: [], $get: [] };
    
        // Stack
        this.$sp = this.$stack.sp; // Stack pointer
        this.$lis = this.$stack.list[this.$stack.sp - 1]?.value; // Last item in stack
        this.$fis = this.$stack.list[0x00]?.value; // First item in stack
        // Other
        this.$offset = 0x00;
        this.$name = 0x00;
        this.$text = ''; // Text to display
        this.$math = 0x00;
        // Command
        this.$cmd = '';
        this.$cmdargs = '';
        this.$cmdret = null;
        // jmp
        this.$count = 0x01;
        // return
        this.$urt = null;
        this.$ret = false;
        // Execute registers
        this.$mov = 0x00;
        this.$get = 0x00;
        // Boolean registers
        this.$true = 1;
        this.$false = 0;
        // Logical registers
        this.$eq = 0x00;    // a == b
        this.$seq = 0x00; // a === b
        this.$cmp = false;  // a > b
        this.$xor = 0x00;   // a ^ b
        this.$and = false;  // a && b
        this.$or = false;   // a || b
        this.$b_and = false; // a & b
        this.$b_or = false; // a | b
        // Immutable registers
        this.$input = 0x00;
        this.$arch = "AsmX";

        if (this.options?.registers && typeof arguments[2] != 'undefined' && typeof arguments[2] == 'object') {
            // Arguments instruction
            this.$arg0 = this.options.registers['$arg0'];
            this.$arg1 = this.options.registers['$arg1'];
            this.$arg2 = this.options.registers['$arg2'];
            this.$arg3 = this.options.registers['$arg3'];
            this.$arg4 = this.options.registers['$arg4'];
            this.$arg5 = this.options.registers['$arg5'];
            // Command
            this.$cmd = this.options.registers[']cmd'];
            this.$cmdargs = this.options.registers['$cmdargs'];
            //
            this.$mov = this.options.registers['$mov'];
            this.$get = this.options.registers['$get'];
            this.$sp = this.options.registers['$sp'];
            this.$offset = this.options.registers['$offset'];
            this.$input = this.options.registers['$input'];
            this.$name = this.options.registers['$name'];
            this.$ret = this.options.registers['$ret'];
            this.$urt = this.options.registers['$urt'];
            this.$math = this.options.registers['$math'];
            this.$count = this.options.registers['$count'];
            this.$cmdret = this.options.registers['$cmdret'];
            this.set = this.options.registers['set'];
            this.labels = this.options.registers['labels'];
            this.enviroments = this.options.registers['enviroments'];
            this.subprograms = this.options.registers['subprograms'];
            this.fors = this.options.registers['fors'];
            this.exceptions = this.options.registers['exceptions'];
            this.trys = this.options.registers['trys'];
            this.collections = this.options.registers['collections'];
            this.interfaces = this.options.registers['interfaces'];
            this.registers = this.options.registers['registers'];
            this.stack = this.options.registers['stack'] || new Stack();
            this.This = this.options.registers['This'];
            this.scope = this.options.registers['scope'];
            this.type = this.options.registers['type'];
            this._task = this.options.registers['_task'] || [];
            // Logical registers
            this.$eq = this.options.registers['$eq'];
            this.$seq = this.options.registers['$seq'];
            this.$cmp = this.options.registers['$cmp'];
            this.$xor = this.options.registers['$xor'];
            this.$and = this.options.registers['$and'];
            this.$or = this.options.registers['$or'];
            this.$b_and = this.options.registers['$b_and'];
            this.$b_or = this.options.registers['$b_or'];
            // arguments in Unit
            this.argsScopeLocal = this.options.registers['argsScopeLocal'];

            if (this.options.registers?.constants && Array.isArray(this.options.registers.constants)) {
                let list = [];

                for (let index = 0, len = this.options.registers['constants']['length']; index < len; index++) {
                    list[index] = this.options.registers['constants'][index];
                }

                this.constants = Array.from(list);
            }
            
        }

        const alias = Parser.parse(fs.readFileSync(`${PATH_TO_SYSTEMS_DIRECTORY}/index.asmX`, {encoding: 'utf-8' }));
            if (alias && alias instanceof Array)
                for (let index = 0; index < alias.length; index++) this.AbstractSyntaxTree.unshift(alias[index]);

        let imports = this.AbstractSyntaxTree.filter(tree => tree?.import);
        let exececuted_imports = [];

        imports.forEach(module => {
            if (!exececuted_imports.includes(module.import.alias)) {
                const alias = this.compileImportStatement(module.import, module);
                
                if (alias instanceof Array)
                    for (const tree of alias.reverse()) this.AbstractSyntaxTree.unshift(tree);

                exececuted_imports.push(module.import.alias);
            }
        });

        this.AbstractSyntaxTree.forEach(tree => tree?.const && this.compileDefineStatement(tree.const));

        for (let index = 0; index < this.AbstractSyntaxTree.length; index++) {
            const trace = this.AbstractSyntaxTree[index];
            let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
            this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);

            if (config.INI_VARIABLES?.ANALYSIS) {
                Analysis.createModel(statement);
                Analysis.counterModel('new', statement);
            }
        };
    }


    /**
     * It's a function that executes a statement
     * @param statement - { cmd: 'mov', args: [ '', '' ] }
     * @param index - The index of the current statement.
     */
    compileExecuteStatement(statement, index, trace) {
        this.$arg0 = statement.cmd;
        let args = statement.args;

       /* Checking if the argument is a hex, int, or float. If it is, it will return the argument. */
        args = args.map((arg) => {
            if (ValidatorByType.validateTypeNumber(arg)) {
                return  +this.checkArgument(arg, trace?.parser.code, trace?.parser.row) || +arg;
            } else {
                if (ValidatorByType.validateTypeNumber(arg)) return +this.checkArgument(arg) || +arg;
                return this.checkArgument(arg, trace?.parser.code, trace?.parser.row) || arg;
            }
        });

        let $idx = index || 1;
        
        if (this.$arg0 == 'div')    this.$ret = this.$math = args[0] / args[1];
        if (this.$arg0 == 'ceil')   this.$ret = this.$math = Math.ceil(args[0]);
        if (this.$arg0 == 'floor')  this.$ret = this.$math = Math.floor(args[0]);
        if (this.$arg0 == 'sqrt')   this.$ret = this.$math = Math.sqrt(args[0]);
        if (this.$arg0 == 'exp')    this.$ret = this.$math = Math.exp(args[0]);
        if (this.$arg0 == 'log')    this.$ret = this.$math = Math.log(args[0]);
        if (this.$arg0 == 'sin')    this.$ret = this.$math = Math.sign(args[0]);
        if (this.$arg0 == 'log10')  this.$ret = this.$math = Math.log10(args[0]);
        if (this.$arg0 == 'cos')    this.$ret = this.$math = Math.cos(args[0]);
        if (this.$arg0 == 'tan')    this.$ret = this.$math = Math.tan(args[0]);
        if (this.$arg0 == 'acos')   this.$ret = this.$math = Math.acos(args[0]);
        if (this.$arg0 == 'atan')   this.$ret = this.$math = Math.atan(args[0]);
        if (this.$arg0 == 'round')  this.$ret = this.$math = Math.round(args[0]);
        if (this.$arg0 == 'atan2')  this.$ret = this.$math = Math.atan2(args[0], args[1]);
        
        if (this.$arg0 == 'mov')    this.$ret = this.$mov = args[0];

        if (this.$arg0 == 'is_almost') {
            if (typeof args[0] === 'number') {
                let int = String(args[0]);

                if (int.indexOf('.') > -1) { // float
                    int = String(Number(int).toFixed(2));
                    let leftnumber = int.slice(int.indexOf('.') + 1);
                    let leftToken = +leftnumber[0];
                    let rightToken = +leftnumber[1];
                    if (leftToken > 2 && rightToken > 5) this.$ret = 'Almost';
                    else  this.$ret = 'false';
                } else { // Int
                    int = int.slice(int.length - 2);
                    let leftToken = +int[0];
                    let rightToken = +int[1];
                    if (leftToken > 2 && rightToken > 5) this.$ret = 'Almost';
                    else  this.$ret = 'false';
                }
            } else {
                this.$ret = 'Void';
            }
        }

        if (this.$arg0 == 'sizeof') {
            if (Array.isArray(args[0]) || typeof args[0] === 'string') {
                Type.check('String', args[0]) ? this.$ret = args[0].slice(1, -1).length : this.$ret = args[0].length;
            }
        }

        if (this.$arg0 == 'eq') {
            if (Type.check('Int', args[0]) && Type.check('Int', args[1])) {
                this.$ret = this.$eq = +args[0] == +args[1];
            } else if (Type.check('String', args[0]) && Type.check('String', args[1])) {
                this.$ret = this.$eq = args[0] == args[1];
            } else if ( /[a-zA-Z_][a-zA-Z0-9_]*/.test(args[0]) && Type.check('String', args[1])) {
                this.$ret = this.$eq = args[0] == args[1].slice(1, -1);
            } else if ( /[a-zA-Z_][a-zA-Z0-9_]*/.test(args[1]) && Type.check('String', args[0])) {
                this.$ret = this.$eq = args[1] == args[0].slice(1, -1);
            } else {
                this.$ret = this.$eq = args[0] == args[1];
            }
        }

        if (this.$arg0 == 'seq')    this.$ret = this.$seq = args[0] === args[1];
        if (this.$arg0 == 'cmp')    this.$ret = this.$cmp = +args[0] > +args[1];
        if (this.$arg0 == 'xor')    this.$ret = this.$xor = args[0] ^ args[1];
        if (this.$arg0 == 'not')    this.$ret = this.$not = +args[0] == 1 ? 0 : 1;
        if (this.$arg0 == 'and')    this.$ret = this.$and = args[0] && args[1];
        if (this.$arg0 == 'or')     this.$ret = this.$or = args[0] || args[1];
        if (this.$arg0 == 'b_and')  this.$ret = this.$b_and = args[0] & args[1];
        if (this.$arg0 == 'b_or')   {
            this.$ret = this.$b_or = args[0] | args[1];
            MiddlewareSoftware.compileStatement({ instruction: 'orr', r0: '$ret', r1: args[0], r2: args[1] });
        }
        
        if (this.$arg0 == 'rand') {
            args[0] = +args[0] || 0;
            this.$ret = this.$math = Math.floor(Math.random() * (args[1] - args[0] + 1) + args[0]);
        }

        if (this.$arg0 == 'jmp') {
            let source = [];
            let compile;
            
            for (let i = 1; i < args[0] + 1; i++) source.unshift(this.AbstractSyntaxTree[$idx - i]);
            this.$count = 0X01;
            for (let iterator = 0, $count = args[1]-1 || 1; iterator < $count; iterator++) {
                compile = new Compiler(source, this.scope, {
                    argsScopeLocal: this.options?.argsScopeLocal,
                    registers: {
                        $arg0: this.$arg0,
                        $arg1: this.$arg1,
                        $arg2: this.$arg2,
                        $arg3: this.$arg3,
                        $arg4: this.$arg4,
                        $arg5: this.$arg5,
                        // return
                        $ret: this.$ret,
                        $urt: this.$urt,
                        // ................
                        $mov: this.$mov,
                        $get: this.$get,
                        // jmp counter
                        $count: this.$count+1,
                        type: 'cycle',
                        // command
                        $cmd: this.$cmd,
                        $cmdargs: this.$cmdargs,
                        // Stack
                        $fis: this.$fis,
                        $lis: this.$lis,
                        $sp: this.$sp,
                        // Immutable registers
                        $input: this.$input,
                        // Other registers
                        $name: this.$name,
                        $offset: this.$offset,
                        $math: this.$math,
                        // private registers (private data)
                        set: this.set,
                        labels: this.labels,
                        constants: this.constants,
                        enviroments: this.enviroments,
                        subprograms: this.subprograms,
                        fors: this.fors,
                        exceptions: this.exceptions,
                        collections: this.collections,
                        interfaces: this.interfaces,
                        trys: this.trys,
                        scope: this.scope, 
                        This: this.This,
                        argsScopeLocal: this.argsScopeLocal,
                        // Logical registers
                        $cmp: this.$cmp,
                        $eq: this.$eq,
                        $seq: this.$seq,
                        $xor: this.$xor,
                        $and: this.$and,
                        $or: this.$or,
                        $b_and: this.$b_and,
                        $b_or: this.$b_or
                    }
                });
                
                // Logical registers
                this.$seq = compile.$seq;
                this.$and = compile.$and;
                this.$or = compile.$or;
                this.$b_and = compile.$b_and;
                this.$b_or = compile.$b_or;
                this.$eq = compile.$eq;

                this.$cmd = compile.$cmd;
                this.$cmdargs = compile.$cmdargs;

                this.$count = compile.$count;
                this.$math = compile.$math;
                this.$input = compile.$input;
                this.$ret = compile.$ret;
                this.$urt = compile.$urt;
                this.$mov = compile.$mov;
                this.$get = compile.$get;
                this.$fis = compile.$fis;
                this.$lis = compile.$lis;
                this.$cmp = compile.$cmp;
                this.$offset = compile.$offset;
                this.$text = compile.$text;
                this.$sp = compile.$sp;
                this.$name = compile.$name;
                this.set = compile.set;
                this.labels = compile.labels;
                this.constants = compile.constants;
                this.subprograms = compile.subprograms;
                this.enviroments = compile.enviroments;
                this.fors = compile.fors;
                this.exceptions = compile.exceptions;
                this.collections = compile.collections;
                this.interfaces = compile.interfaces;
                this.trys = compile.trys;
                this.scope = compile.scope;
                this.This = compile.This;
                this.argsScopeLocal = compile.argsScopeLocal;
                this.type = compile.type;

              //  (iterator == this.$count-1) ? this.type = 'Program' : this.type = 'cycle';
            }
        }

        function labelNonExistent(trace, label, context) {
            new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent label`, {
                row: trace?.parser.row,
                code: trace?.parser.code || `@label ${label}:`,
                select: label,
                position: 'end'
            });

            const labels = context.labels.map(l => Reflect.ownKeys(l)[0]);
            const coincidences = NeuralNetwork.coincidence(labels, label);
            const presumably = NeuralNetwork.presumably(coincidences);
            ServerLog.log(`Perhaps you wanted to write some of these labels: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');

            process.exit(1);
        }

        function labelExecute(globalThis, labelname) {
            let labels = globalThis.This['label'];
            let label = labels.filter(label => Reflect.ownKeys(label)[0] == labelname);

            let registers = { 
                set: globalThis.set, 
                constants: globalThis.constants,
                This: globalThis.This, 
                scope: globalThis.scope, 
                subprograms: globalThis.subprograms, 
                labels: globalThis.labels,
                fors: globalThis.fors,
                exceptions: globalThis.exceptions,
                collections: globalThis.collections,
                trys: globalThis.trys,
                registers: globalThis.registers
            };
            
            if (label == null) {
                labelNonExistent(trace, label, globalThis);
            } else {
                try {
                    label = label[0][labelname].join('\n');
                } catch {
                    labelNonExistent(trace, labelname, globalThis);
                }
            }

            for (const register of Object.getOwnPropertyNames(globalThis)) {
                if (register.match(/\$\w+/)) registers[register] = globalThis[register];
            }

            let compiler = new Compiler(Parser.parse(label), globalThis.scope, { registers: registers });

            for (const register of Object.getOwnPropertyNames(compiler)) {
                if (register.match(/\$\w+/)) globalThis[register] = compiler[register];
            }
        }

        function SubprogramExecute(globalThis, subprogramname) {
            try {
                let subprogram = globalThis.subprograms.filter(subprogram => Reflect.ownKeys(subprogram)[0] == subprogramname);

                let registers = {
                    set: globalThis.set, 
                    constants: globalThis.constants, 
                    This: globalThis.This, 
                    scope: globalThis.scope,
                    labels: globalThis.labels,
                    enviroments: globalThis.enviroments,
                    subprograms: globalThis.subprograms,
                    fors: globalThis.fors,
                    exceptions: globalThis.exceptions,
                    collections: globalThis.collections,
                    trys: globalThis.trys,
                    stack: globalThis.stack,
                    registers: globalThis.registers,
                    _task: globalThis._task
                };

                for (const register of Object.getOwnPropertyNames(globalThis)) {
                    if (register.match(/\$\w+/)) registers[register] = globalThis[register];
                }
    
                let compiler = new Compiler(Parser.parse(subprogram[0][subprogramname].join('\n')), globalThis.scope, { registers: registers });
    
                for (const register of Object.getOwnPropertyNames(compiler)) {
                    if (register.match(/\$\w+/)) globalThis[register] = compiler[register];
                }

                globalThis.set = compiler.set;
                globalThis.constants = compiler.constants;
                globalThis.This = compiler.This;
                globalThis.scope = compiler.scope;
                globalThis.labels = compiler.labels;
                globalThis.enviroments = compiler.enviroments;
                globalThis.subprograms = compiler.subprograms;
                globalThis.fors = compiler.fors;
                globalThis.exceptions = compiler.exceptions;
                globalThis.collections = compiler.collections;
                globalThis.trys = compiler.trys;
                globalThis.stack = compiler.stack;
                globalThis.registers = compiler.registers;
                globalThis._task = compiler._task;
            } catch (exception) {
                new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent subprogram`, {
                    row: trace?.parser.row,
                    code: trace?.parser.code || `@subprogram ${args[0]}:`,
                    select: args[0],
                    position: 'end'
                });

                const subprograms = globalThis.subprograms.map(s => Reflect.ownKeys(s)[0]);
                const coincidences = NeuralNetwork.coincidence(subprograms, args[0]);
                const presumably = NeuralNetwork.presumably(coincidences);
                ServerLog.log(`Perhaps you wanted to write some of these subprograms: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');
    
                process.exit(1);
            }
        }

        function ForExecute(globalThis, forname) {
            try {
                let loop = globalThis.fors.filter(loop => Reflect.ownKeys(loop)[0] == forname);

                let registers = {
                    set: globalThis.set, 
                    constants: globalThis.constants, 
                    This: globalThis.This, 
                    scope: globalThis.scope,
                    labels: globalThis.labels,
                    enviroments: globalThis.enviroments,
                    subprograms: globalThis.subprograms,
                    fors: globalThis.fors,
                    exceptions: globalThis.exceptions,
                    collections: globalThis.collections,
                    trys: globalThis.trys,
                    stack: globalThis.stack,
                    registers: globalThis.registers,
                    _task: globalThis._task
                };

                for (const register of Object.getOwnPropertyNames(globalThis)) {
                    if (register.match(/\$\w+/)) registers[register] = globalThis[register];
                }
    
                let compiler = new Compiler(Parser.parse(loop[0][forname].join('\n')), globalThis.scope, { registers: registers });
    
                for (const register of Object.getOwnPropertyNames(compiler)) {
                    if (register.match(/\$\w+/)) globalThis[register] = compiler[register];
                }

                globalThis.set = compiler.set;
                globalThis.constants = compiler.constants;
                globalThis.This = compiler.This;
                globalThis.scope = compiler.scope;
                globalThis.labels = compiler.labels;
                globalThis.enviroments = compiler.enviroments;
                globalThis.subprograms = compiler.subprograms;
                globalThis.fors = compiler.fors;
                globalThis.exceptions = compiler.exceptions;
                globalThis.collections = compiler.collections;
                globalThis.trys = compiler.trys;
                globalThis.stack = compiler.stack;
                globalThis.registers = compiler.registers;
                globalThis._task = compiler._task;
            } catch {
                new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent for`, {
                    row: trace?.parser.row,
                    code: trace?.parser.code || `@subprogram ${args[0]}:`,
                    select: args[0],
                    position: 'end'
                });

                const fors = globalThis.fors.map(f => Reflect.ownKeys(f)[0]);
                const coincidences = NeuralNetwork.coincidence(fors, args[0]);
                const presumably = NeuralNetwork.presumably(coincidences);
                ServerLog.log(`Perhaps you wanted to write some of these fors: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');
    
                process.exit(1);
            }
        }


        if (this.$cmp == false && this.$arg0 == 'jmp_zero') labelExecute(this, args[0]), Garbage.setMatrix('label', this.labels.map(label => Reflect.ownKeys(label)[0])), Garbage.usage('label', args[0]);
        if (this.$eq == true && this.$arg0 == 'jmp_equal') labelExecute(this, args[0]),  Garbage.setMatrix('label', this.labels.map(label => Reflect.ownKeys(label)[0])), Garbage.usage('label', args[0]);
        if (this.$eq == false && this.$arg0 == 'jmp_ne') labelExecute(this, args[0]),    Garbage.setMatrix('label', this.labels.map(label => Reflect.ownKeys(label)[0])), Garbage.usage('label', args[0]);
        if (this.$cmp == true && this.$arg0 == 'jmp_great') labelExecute(this, args[0]), Garbage.setMatrix('label', this.labels.map(label => Reflect.ownKeys(label)[0])), Garbage.usage('label', args[0]);
        if (this.$arg0 == 'goto') labelExecute(this, args[0]), Garbage.setMatrix('label', this.labels.map(label => Reflect.ownKeys(label)[0])), Garbage.usage('label', args[0]);
        if (this.$arg0 == 'exit' && (args[0] == 'true' || args[0] == 1)) process.exit();

        if (this.$arg0 == 'goto_env') {
            try {
                let enviroment = this.enviroments.filter(enviroment => Reflect.ownKeys(enviroment)[0] == args[0]);
                new Compiler(Parser.parse(enviroment[0][args[0]].join('\n')));
                Garbage.usage('enviroment', args[0]);
            } catch {
                new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent enviroment`, {
                    row: trace?.parser.row,
                    code: trace?.parser.code || `@enviroment ${args[0]}:`,
                    select: args[0],
                    position: 'end'
                });
    
                process.exit(1);
            }
        }

        if (this.$arg0 == 'goto_sbp') SubprogramExecute(this, args[0]), Garbage.setMatrix('subprogram', this.subprograms.map(subprogram => Reflect.ownKeys(subprogram)[0])), Garbage.usage('subprogram', args[0]);

        if (this.$arg0 == 'for') {
            if (args[2] == undefined) {
                this.$count = 0; // fix index in cycle process
                for (let index = 0; index < args[1]; index++) {
                    this.$count += 0X01;
                    ForExecute(this, args[0]), Garbage.setMatrix('for', this.fors.map(loop => Reflect.ownKeys(loop)[0])), Garbage.usage('for', args[0]);
                }
            } else {
                this.$count = args[1] - 1;
                for (let index = args[1]; index < args[2]; index++) {
                    this.$count += 1;
                    ForExecute(this, args[0]), Garbage.setMatrix('for', this.fors.map(loop => Reflect.ownKeys(loop)[0])), Garbage.usage('for', args[0]);
                }
            }
        }


        // @execute block <try name> <exception name>
        if (this.$arg0 == 'block') {
            let tryname = args[0];
            let exceptname = args[1];

            try {
                let registers = {
                    set: this.set, 
                    constants: this.constants, 
                    This: this.This, 
                    scope: this.scope,
                    labels: this.labels,
                    enviroments: this.enviroments,
                    subprograms: this.subprograms,
                    fors: this.fors,
                    exceptions: this.exceptions,
                    collections: globalThis.collections,
                    trys: this.trys,
                    stack: this.stack,
                    registers: this.registers,
                    _task: this._task
                };

                let attempt = this.trys.filter(at => Reflect.ownKeys(at)[0] == tryname);

                for (const register of Object.getOwnPropertyNames(this)) {
                    if (register.match(/\$\w+/)) registers[register] = this[register];
                }
    
                let compiler = new Compiler(Parser.parse(attempt[0][tryname].join('\n')), this.scope, { registers: registers });
    
                for (const register of Object.getOwnPropertyNames(compiler)) {
                    if (register.match(/\$\w+/)) this[register] = compiler[register];
                }

                this.set = compiler.set;
                this.constants = compiler.constants;
                this.This = compiler.This;
                this.scope = compiler.scope;
                this.labels = compiler.labels;
                this.enviroments = compiler.enviroments;
                this.subprograms = compiler.subprograms;
                this.fors = compiler.fors;
                this.exceptions = compiler.exceptions;
                this.collections = compiler.collections;
                this.trys = compiler.trys;
                this.stack = compiler.stack;
                this.registers = compiler.registers;
                this._task = compiler._task;
            } catch (exception) {
                let except = this.trys.filter(ex => Reflect.ownKeys(ex)[0] == exceptname);

                let registers = { 
                    set: this.set, 
                    constants: this.constants, 
                    This: this.This, 
                    scope: this.scope,
                    labels: this.labels,
                    enviroments: this.enviroments,
                    subprograms: this.subprograms,
                    fors: this.fors,
                    exceptions: this.exceptions,
                    collections: globalThis.collections,
                    trys: this.trys,
                    stack: this.stack,
                    registers: this.registers,
                    _task: this._task
                };

                for (const register of Object.getOwnPropertyNames(this)) {
                    if (register.match(/\$\w+/)) registers[register] = this[register];
                }
    
                let compiler = new Compiler(Parser.parse(except[0][exceptname].join('\n')), this.scope, { registers: registers });
    
                for (const register of Object.getOwnPropertyNames(compiler)) {
                    if (register.match(/\$\w+/)) this[register] = compiler[register];
                }

                this.set = compiler.set;
                this.constants = compiler.constants;
                this.This = compiler.This;
                this.scope = compiler.scope;
                this.labels = compiler.labels;
                this.enviroments = compiler.enviroments;
                this.subprograms = compiler.subprograms;
                this.fors = compiler.fors;
                this.exceptions = compiler.exceptions;
                this.collections = compiler.collections;
                this.trys = compiler.trys;
                this.stack = compiler.stack;
                this.registers = compiler.registers;
                this._task = compiler._task;
            }
        }
    }


    /**
     * This function compiles a label statement in JavaScript by parsing the label name and body and
     * storing it in an object.
     * @param statement - an array representing a label statement in a programming language. It
     * typically contains the label name and the code block associated with the label.
     * @param index - The index parameter in this function refers to the current index of the label
     * statement being parsed in the overall program. It is used by the Parser.parseLabelStatement()
     * function to ensure that the label name is valid and does not conflict with any other labels in
     * the program.
     */
    compileLabelStatement(statement, index) {
        let labelname = Parser.parseLabelStatement(statement[0], index);
        let labelbody = statement.slice(1);
        this.labels.push({ [labelname?.label.name]: labelbody });
    }


    /**
     * This function compiles an environment statement by parsing the name of the environment and
     * adding it to a list of environments along with its associated statements.
     * @param statement - The first parameter "statement" is an array that contains the environment
     * statement to be parsed and added to the list of environments.
     * @param index - The index parameter in the function is likely referring to the index of the
     * current statement being processed. It is used as an argument in the call to the
     * `Parser.parseEnviromentStatement()` function to parse the environment name from the statement.
     */
    compileEnviromentStatement(statement, index) {
        let enviromentname = Parser.parseEnviromentStatement(statement[0], index);
        this.enviroments.push({ [enviromentname?.enviroment.name]: statement.slice(1) });
    }


    /**
     * This function compiles a subprogram statement by parsing the subprogram name and adding it to a
     * list of subprograms along with its associated statements.
     * @param statement - An array representing a subprogram statement in the code being parsed. The
     * first element of the array is the subprogram name, and the remaining elements are the statements
     * within the subprogram.
     * @param index - The index parameter in the function `compileSubprogramStatement(statement,
     * index)` is likely the index of the current statement being compiled within a larger program or
     * script. It is used by the `Parser.parseSubprogramStatement()` function to help identify the name
     * of the subprogram being defined in the statement.
     */
    compileSubprogramStatement(statement, index) {
        let subprogramname = Parser.parseSubprogramStatement(statement[0], index);
        this.subprograms.push({ [subprogramname?.subprogram.name]: statement.slice(1) });
    }


    compileForStatement(statement, index) {
        let forname = Parser.parseForStatement(statement[0], index);
        this.fors.push({ [forname.for.name]: statement.slice(1) });
    }


    compileExceptionStatement(statement, index) {
        let exceptname = Parser.parseExceptionStatement(statement[0], index);
        this.exceptions.push({ [exceptname.exception.name]: statement.slice(1) });
    }


    compileTryStatement(statement, index) {
        let tryname = Parser.parseTryStatement(statement[0], index);
        this.trys.push({ [tryname.try.name]: statement.slice(1) });
    }


    compileStructStatement(statement, index, tree) {
        let structname = Parser.parseStructStatement(statement[0], index);
        let ast = Parser.parse(statement.slice(1).join('\n'));
        let allProperties = ast.every(tree => tree?.property);
        
        if (allProperties == false) {
            ServerLog.log(`[${Color.FG_GREEN}struct${Color.FG_WHITE}::${Color.FG_GREEN}${structname.struct}${Color.FG_WHITE}] This structure should have only the @property instruction.`, 'Exception');
            process.exit(1);
        }

        // Experimental mode
        let IA = {};
        for (let property of ast) {
            property = property?.property;
            IA[property?.name] = property?.type;
        }

        Interface.create(IA, 'struct', structname.struct);
        //
    
        this.interfaces['structs'].push({ [structname?.struct]: statement.slice(1) });
    }


    compileEnumStatement(statement, index) {
        let enumname = Parser.parseEnumStatement(statement[0], index);
        let ast = Parser.parse(statement.slice(1).join('\n'));
        let allProperties = ast.every(tree => tree?.property);
        
        if (allProperties == false) {
            ServerLog.log(`[${Color.FG_GREEN}enum${Color.FG_WHITE}::${Color.FG_GREEN}${enumname.enum}${Color.FG_WHITE}] This structure should have only the @property instruction.`, 'Exception');
            process.exit(1);
        }

        // Experimental mode
        let IA = {};
        let currentValue = 0;

        for (let property of ast) {
            property = property?.property;
            if (property?.type == undefined) IA[property?.name] = currentValue;

            else if (property?.type !== undefined) {
                if (Type.check('String', property?.type)) {
                    let word = property?.type.slice(1, -1);
                    let value = 0;
                    for (const char of word) value += char.charCodeAt();
                    IA[property?.name] = value;
                    currentValue = value;
                } else if (Type.check('Int', property?.type) || Type.check('Float', property?.type)) {
                    let value = Number(property?.type);
                    IA[property?.name] = value;
                    currentValue = value;
                } else if (Type.check('Bool', property?.type)) {
                    let value = 0;
                    if (property?.type == 'false') value = 0;
                    if (property?.type == 'true') value = 1;
                    IA[property?.name] = value;
                    currentValue = value;
                } else {
                    if (Type.types.map(t => t.name).includes(property?.type)) {
                        let value = 0;
                        if (['string', 'bool'].includes(property?.type.toLowerCase())) value = 1;
                        if (property?.type.toLowerCase() == 'int') value = 2;
                        if (property?.type.toLowerCase() == 'float') value = 4;
                        IA[property?.name] = value;
                        currentValue = value;
                    } else {
                        if (property?.type == 'void' || property?.type == 'Vloid') {
                            value = 0;
                            IA[property?.name] = value;
                            currentValue = value;
                        } else {
                            let word = property?.type;
                            let value = 0;
                            for (const char of word) value += char.charCodeAt();
                            IA[property?.name] = value;
                            currentValue = value;
                        }
                    }
                }
            }

            currentValue++;
        }

        Interface.create(IA, 'enum', enumname.enum);
        //

        this.interfaces['enums'].push({ [enumname?.enum]: statement.slice(1) });
    }


    compileCollectionStatement(statement, index, tree) {
        let collectionname = Parser.parseCollectionStatement(statement[0], index);
        let ast = Parser.parse(statement.slice(1).join('\n'));
        let allProperties = ast.every(tree => tree?.property);
        
        if (allProperties == false) {
            ServerLog.log(`[${Color.FG_GREEN}collection${Color.FG_WHITE}::${Color.FG_GREEN}${collectionname.collection}${Color.FG_WHITE}] This structure should have only the @property instruction.`, 'Exception');
            process.exit(1);
        }

        // Experimental mode
        let IA = {};
        for (let property of ast) {
            property = property?.property;
            IA[property?.name] = property?.type;
        }

        Interface.create(IA, 'collection', collectionname.collection);
        //

        this.interfaces['collections'].push({ [collectionname.collection]: statement.slice(1) });
    }


    compilePropertyStatement(statement, index) {
        let structure = statement.structure;
        let searchedStructure = this.collections[structure.type].filter(strctr => strctr[structure.name])[0];

        if (structure.type == 'class') {
            let i7e = Interface.getCustomInterface(structure.type, searchedStructure?.interface);
            
            if (i7e !== undefined) {
                let filter = this.collections[structure.type].filter(strctr => !strctr[structure.name]);
                searchedStructure[structure.name][statement.name] = statement.value;
                filter.push(searchedStructure);
                this.collections[structure.type] = filter;
            }
        } else if (structure.type == 'collection') {
            let i7e = Interface.getInterface(structure.type, searchedStructure?.interface);

            if (i7e !== undefined) {
                // v1
                // let filter = this.collections[structure.type].filter(strctr => !strctr[structure.name]);
                // console.log(filter);
                // searchedStructure[structure.name][statement.name] = statement.value;
                // filter.push(searchedStructure);
                // this.collections[structure.type] = filter;

                //v2
                let filter = this.collections[structure.type].filter(strctr => !strctr[structure.name]);
                let buckup = Object.create({ });
                buckup = { interface: new String(searchedStructure.interface).valueOf(), [structure.name]: {} };

                for (const property of Reflect.ownKeys(searchedStructure[structure.name])) {
                    buckup[structure.name][property] = new String(searchedStructure[structure.name][property]).valueOf();
                }

                buckup[structure.name][statement.name] = statement.value;
                buckup = JSON.parse(JSON.stringify(buckup));
                this.collections[structure.type] = [...filter, buckup];
            }
        } else {
            if (
                Interface.checkField({ 
                    name: searchedStructure?.interface,
                    type: structure.type
                }, statement.name, statement.value)
            ) {
                let filter = this.collections[structure.type].filter(strctr => !strctr[structure.name]);
                searchedStructure[structure.name][statement.name] = statement.value;
                filter.push(searchedStructure);
                this.collections[structure.type] = filter;
            } else {}
        }
    }


    compileCreateStatement(statement, index, tree) {
        let structure = statement.structure;
        let name = statement.name;
        let releaseStruct = {};

        let i7e = Interface.getInterface(structure.type, structure.name);

        if (i7e == undefined && structure.type == 'class') {
            let props = Interface.getCustomInterface(structure.type, structure.name);
            this.collections[structure.type].push({
                interface: new String(props.structureName).valueOf(),
                [statement.name]: props.obj.property
            });
        }

        else if (i7e == undefined) {
            new SystemCallException(`a ${structure.type} named ${structure.name} does not exist`, {
                ...tree['parser'],
                select: tree['parser'].code
            });
            process.exit(1);
        }

        else if (i7e) {
            let fields = Reflect.ownKeys(i7e?.IArguments);
            for (const field of fields) releaseStruct[field] = null;
            if (Reflect.ownKeys(this.collections).includes(structure.type)) {
                if (!['enum', 'collection'].includes(structure.type)){
                    this.collections[structure.type].push({
                        interface: i7e.structureName,
                        [name]: releaseStruct
                    });
                } else if (['enum', 'collection'].includes(structure.type)) {
                    this.collections[structure.type].push({
                        interface: i7e.structureName,
                        [name]: i7e.IArguments
                    });
                }
            } else {
                process.exit(1);
            }
        }
    }


    compileRemoveStatement(statement, index) {
        let structure = statement.structure;
        
        if (structure.type == 'class') {
            let getInterface = this.collections[structure.type].filter(s7e => s7e[statement.name])[0]['interface'];
            let i7e = Interface.customs.filter(obj_t => obj_t?.structureName == getInterface)[0];
            let destructorName = i7e?.obj?.destructor;
            let destructor;
            
            if (destructorName && (destructor = Interface.getCustomInterface('destructor', destructorName))) {
                this.executeConstructor = true;
                this.executeClass = statement.name;
                this.executeclassData = this.collections[structure.type].filter(s7e => s7e[statement.name])[0];
    
                for (const line of destructor?.obj?.body) {
                    if (line.startsWith('@')) {
                        let trace = Parser.parse(line)[0];
                        let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                        this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                    }
                }
            }
            
            this.collections[structure.type] = this.collections[structure.type].filter(s7e => !s7e[statement.name]);
        } else {
            this.collections[structure.type] = this.collections[structure.type].filter(s7e => !s7e[statement.name]);
        }
    }


    compileClassStatement(statement, index, tree) {
        let Tree = tree;
        let clsBody = statement.slice(1);
        let clsname = Parser.parseClassStatement(statement[0], tree.parser.row);
        let ast = Parser.parse(clsBody.join('\n'));
        let allBinds = ast.every(tree => tree?.bind || tree?.property);

        if (allBinds !== true) {
            let idx = 0;
            let tr = null;

            ast.forEach((tree, index) => {
                let keys = Reflect.ownKeys(tree).filter(t => !t?.parser)[0];

                if (['property', 'bind'].includes(keys) == false) {
                    idx = index;
                    tr = tree;
                }
            });

            let row = idx + Tree.parser.row;
    
            new SystemCallException(`[${Color.FG_RED}ClassException${Color.FG_WHITE}]: Unexpected instruction`, {
                code: tr.parser.code,
                row,
                select: tr.parser.code
            });

            ServerLog.log('You need to remove this instruction.', 'Possible fixes');
            process.exit(1);
        } else {
            let constructor = ast.filter(t => t.bind && t.bind.bind == 'constructor');
            let destructor = ast.filter(t => t.bind && t.bind.bind == 'destructor');

            if (destructor.length > 1) {
                let destructorsTree = destructor.slice(1);
                let destructorsTreeIndex = 0;

                ast.find((t, index) => {
                    if (t?.bind && t.bind.name == destructorsTree[0].bind.name) {
                        destructorsTreeIndex = index;
                        return index;
                    }
                });

                let idx = Tree.parser.row + destructorsTreeIndex;

                for (const iterator of destructorsTree) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: There are too many bind destructors.`, {
                        code: iterator.parser.code,
                        row: idx,
                        select: iterator.parser.code
                    });
        
                    ServerLog.log(`You need to remove this instruction.\n`, 'Possible fixes');
                    idx++;
                }
    
                process.exit(1);
            }

            if (constructor.length > 1) {
                let constructorsTree = constructor.slice(1);
                let constructorsTreeIndex = 0;

                ast.find((t, index) => {
                    if (t?.bind && t.bind.name == constructorsTree[0].bind.name) {
                        constructorsTreeIndex = index;
                        return index;
                    }
                });

                let idx = Tree.parser.row + constructorsTreeIndex;

                for (const iterator of constructorsTree) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: There are too many bind constructors.`, {
                        code: iterator.parser.code,
                        row: idx,
                        select: iterator.parser.code
                    });
        
                    ServerLog.log(`You need to remove this instruction.\n`, 'Possible fixes');
                    idx++;
                }
    
                process.exit(1);
            } else if (constructor.length == 0) {
                new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: You didn't specify a constructor in the bind class.`, {
                    code: statement[0],
                    row: Tree.parser.row - 1,
                    select: statement[0]
                });
    
                ServerLog.log(`You need to specify the constructor's bind.\n`, 'Possible fixes');
                process.exit(1);
            } else {
                constructor = constructor[0];
                let properties = ast.filter(t => t?.property);
                let methods = ast.filter(t => t.bind && t.bind.bind == 'method');
                let binds = ast.filter(t => t.bind && (t.bind.bind !== 'constructor' || t.bind.bind !== 'destructor'));
                let releaseProperties = {};
                let obj = { property: {}, methods: [] };
                let abstract;

                if ((abstract = Interface.getCustomInterface('class', clsname?.abstract)?.obj)) {
                    if (abstract?.property) {
                        let buckup_props = JSON.parse(JSON.stringify(abstract?.property));
                        Object.assign(obj['property'], buckup_props);
                    }

                    if (abstract?.methods) {
                        let buckup_methods = JSON.parse(JSON.stringify(abstract?.methods));
                        Object.assign(obj['methods'], buckup_methods);
                    }
                } else {
                    if (clsname?.abstract instanceof Array) {
                        for (let abstract_t of clsname?.abstract) {
                            abstract_t = Interface.getCustomInterface('class', abstract_t)?.obj;

                            if (abstract_t?.property) {
                                let buckup_props = JSON.parse(JSON.stringify(abstract_t?.property));
                                Object.assign(obj['property'], buckup_props);
                            }

                            if (abstract_t?.methods) {
                                let buckup_methods = JSON.parse(JSON.stringify(abstract_t?.methods));
                                Object.assign(obj['methods'], buckup_methods);
                            }
                        }
                    }
                }


                for (let property of properties) {
                    property = property?.property;
                    releaseProperties[property.name] = property.type;
                }

                // obj['property'] = releaseProperties; v1
                for (const prop of Reflect.ownKeys(releaseProperties)) obj['property'][prop] = releaseProperties[prop]; // v2

                Interface.create(releaseProperties, 'class', clsname);

                for (const method of methods) {
                   let i7e = Interface.getCustomInterface('method', method.bind.name);
                   
                    if (i7e == undefined) {
                        let bindsTreeIndex = 0;
    
                        ast.find((t, index) => {
                            if (t?.bind && t.bind.name == method.bind.name) {
                                bindsTreeIndex = index;
                                return index;
                            }
                        });
        
                       let idx = Tree.parser.row + bindsTreeIndex;

                        new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: Non-existing method.`, {
                            code: method.parser.code,
                            row: idx,
                            select: method.parser.code
                        });
            
                        ServerLog.log(`You need to specify the constructor's bind.\n`, 'Possible fixes');
                        process.exit(1);
                    } else {
                        if (obj['methods'] == undefined) obj['methods'] = [];
                        obj['methods'].push(method.bind.name);
                    }
                }

                if (destructor.length == 1) {
                    destructor = destructor[0];
                    let ci7e = Interface.getCustomInterface(destructor.bind.bind, destructor.bind.name);
                    if (ci7e) {
                        obj['destructor'] = ci7e.structureName;
                    } else {
                        let bindsTreeIndex = 0;
    
                        ast.find((t, index) => {
                            if (t?.bind && t.bind.name == destructor.bind.name) {
                                bindsTreeIndex = index;
                                return index;
                            }
                        });

                        let idx = Tree.parser.row + bindsTreeIndex;

                        new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: Non-existing method.`, {
                            code: ast[bindsTreeIndex].parser.code,
                            row: idx,
                            select: ast[bindsTreeIndex].parser.code
                        });
            
                        ServerLog.log(`You need to specify the binding of an existing destructor.\n`, 'Possible fixes');
                        process.exit(1);
                    }
                }

                let i7e = Interface.getInterface(constructor.bind.bind, constructor.bind.name);
                let ci7e = Interface.getCustomInterface(constructor.bind.bind, constructor.bind.name);
                obj['constructor'] = ci7e.structureName;
                Interface.createCustomInterface(obj, 'class', clsname.class);
            }
        }
    }


    compileBindStatement(statement, scope = 'global') {}


    compileMethodStatement(statement, index, tree) {
        let methodname = Parser.parseMethodStatement(statement[0], tree?.parser.row || index);
        let methodBody = statement.slice(1);
        let idx = tree?.parser.row || index;
        let ast = [];

        for (const line of methodBody) {
            if (line.startsWith('@')) ast.push(Parser.parse(line)[0]);
            else if (/^[a-zA-Z0-9_]*\.[a-zA-Z0-9_]*\s+[a-zA-Z0-9_]*/.test(line)) {
                let matches = /^([a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)\s+([a-zA-Z0-9_]*)/.exec(line).filter(t => t).slice(1);
                
                if (matches.length == 2) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Not enough arguments.`, {
                        code: line,
                        row: idx,
                        select: line
                    });
        
                    ServerLog.log(`Probably need to write the missing argument`, 'Possible fixes');
                    process.exit(1);
                } else if (matches.length == 3) {
                    ast.push({ self: { contextname: matches[0], name: matches[1], value: matches[2] }, type: 'self' });
                }
            }

            idx++;
        }

        Interface.createCustomInterface(
            {
                arguments: methodname.method.arguments,
                parser: methodname.parser,
                body: methodBody
            }, 
            'method', methodname.method.name
        );
    }


    compileConstructorStatement(statement, index, tree) {
        let constructorBody = statement.slice(1);
        let constructorInfo = Parser.parseConstructorStatement(statement[0], tree.parser.row);
        let constructorArguments = Parser._parseConstructorArguments(constructorInfo.constructor.arguments, tree.parser.row);
        Interface.createCustomInterface({ body: constructorBody }, 'constructor', constructorInfo.constructor.name);
        Interface.create(constructorArguments.arguments, 'constructor', constructorInfo.constructor.name);
    }


    compileDestructorStatement(statement, index, tree) {
        let destructorBody = statement.slice(1);
        let destructorInfo = Parser.parseDestructorStatement(statement[0], tree.parser.row);
        Interface.createCustomInterface({ body: destructorBody }, 'destructor', destructorInfo.destructor.name);
    }


    compileTionStatement(statement, index, tree) {
        let tionInfo = Parser.parseTionStatement(statement[0], tree.parser.row);
        let i7e = { body: statement.slice(1), info: tionInfo.tion, parser: tionInfo.parser };
        const tion = tionInfo.tion;
        Interface.createCustomInterface(i7e, 'tion', tion.name);
    }


    compileEventStatement(statement, index, tree) {
        let eventInfo = Parser.parseEventStatement(statement[0], tree.parser.row);

        EventEmulator.new(eventInfo.event, eventInfo.type, {
            body: statement.slice(1),
            name: eventInfo.event,
            parser: eventInfo.parser
        });
    }


    /**
     * The function compiles a "using" statement in JavaScript and handles exceptions.
     * @param statement - The statement to be compiled, which is an object containing the name and
     * structure of the using statement.
     * @param index - The index parameter is the index of the current statement being compiled in the
     * Abstract Syntax Tree.
     * @param trace - The `trace` parameter is an object that contains information about the location
     * of the code being executed, such as the file name, line number, and column number. It is used
     * for error reporting and debugging purposes.
     * @returns Nothing is being returned. The function is only modifying the state of the object it
     * belongs to and may exit the process if certain conditions are met.
     */
    compileUsingStatement(statement, index, trace) {
        let structures = Structure.structures.filter(structure => structure != 'unit');
        let currentAST = this.AbstractSyntaxTree;

        if (this.usings.includes(statement.name)) {
            new UsingException(UsingException.REPEAT_INIT_STRUCTURE, {
                ...trace['parser'],
                select: statement.name,
                position: 'end'
            });

            process.exit(1);
        }

        Array.prototype.select = function select(to, from) {
            let newlist = [];
            for (let index = to; index < from; index++) newlist.push(this[index]);
            return newlist;
        }

        if (!structures.includes(statement.structure)) {
            new UsingException(UsingException.INVALID_STRUCTURE, {
                ...trace['parser'],
                select: statement.structure
            });

            process.exit(1);
        }

        let structureForParser = statement.structure[0].toUpperCase() + statement.structure.slice(1);

        let indexStructure = this.AbstractSyntaxTree.findIndex((structure, index) => {
            let struct = Reflect.ownKeys(structure).filter(token => token !== 'parser')[0];
            
            if (struct == statement.structure) {
                let parsed = Parser[`parse${structureForParser}Statement`](structure[statement.structure][0], index);
                if (parsed[statement.structure]['name'] == statement.name) return index;
            }
        });

        if (indexStructure == -1) {
            new UsingException(UsingException.INVALID_INIT_STRUCUTRE, {
                ...trace['parser'],
                select: statement.name,
                position: 'end'
            });

            process.exit(1);
        }

        let part1 = this.AbstractSyntaxTree.select(0, indexStructure);
        let part2 = this.AbstractSyntaxTree.select(indexStructure + 1, this.AbstractSyntaxTree.length);
        this.AbstractSyntaxTree = [...part1, ...part2];
        this[`compile${structureForParser}Statement`](currentAST[indexStructure][statement.structure]);
    }


    /**
     * This function checks if a register exists and assigns its value to a new register.
     * @param statement - The statement parameter is an object that contains information about the
     * register statement being compiled. It likely includes properties such as the name of the
     * register being assigned to and the reference to the register being copied from.
     * @param index - The index parameter is not used in the given code snippet. It is not necessary
     * for the execution of the function.
     * @param trace - The `trace` parameter is an object that contains information about the location
     * of the code being executed. It is used for debugging purposes and typically includes properties
     * such as `file`, `line`, and `column`. In this specific code snippet, the `trace` parameter is
     * being used to provide additional context
     */
    compileRegisterStatement(statement, index, trace) {
        if (!Reflect.ownKeys(this).includes(statement.ref.toLowerCase())) {
            new RegisterException('Non-existent register', {
                ...trace['parser'],
                select: statement.name
            });

            process.exit(1);
        } else {
            try {
                this.registers[statement.name.toLowerCase()] = statement.ref.toLowerCase().slice(1);
            } catch (exception) {
                if (exception instanceof TypeError) {
                    throw exception;
                }
            }
        }
    }


    /**
     * The function compiles a JavaScript get statement and checks for non-existent properties.
     * @param statement - The statement being compiled, which includes the arguments to be parsed and
     * executed.
     * @param index - The index parameter is not used in the given code snippet. It is not clear what
     * its purpose is without further context.
     * @param trace - The `trace` parameter is an object that contains information about the current
     * execution context, such as the row and code where the function is being called from. It is used
     * for error reporting purposes.
     */
    compileGetStatement(statement, index, trace) {
        let $this = this.This;
        const properties = statement.args.split('::');

        function NonExistent(trace, object, select, position = 'end') {
            new ArgumentError(`[${Color.FG_RED}ArgumentException${Color.FG_WHITE}]: Non-existent property`, {
                row: trace?.parser.row, code: trace?.parser.code, select: select, position: position
            });

            ServerLog.log(`You need to use existing keys example: { ${Color.FG_BLUE}${ Reflect.ownKeys(object).join(`${Color.FG_WHITE}, ${Color.FG_BLUE}`)} ${Color.FG_WHITE}}`, 'Possible fixes');
            process.exit(1);
        }

        if (!['global', 'local', 'kernelos'].includes(properties[0])) $this = $this[this.scope];

        if (Reflect.ownKeys(this.collections).includes(properties[0])) {
            if (properties.length < 3) {
                new ArgumentError(`[${Color.FG_RED}ArgumentException${Color.FG_WHITE}]: Perhaps there are not enough arguments.`, {
                    row: trace?.parser.row, code: trace?.parser.code, select: statement.args, position: 'end'
                });
            } else {
                let structure = { type: properties[0], name: properties[1], field: properties[2] };

                try {
                    this.$get = this.collections[structure.type].filter(stre => stre[structure.name])[0][structure.name][structure.field];
                    if (this.$get == null) this.$get = 'Void';
                } catch {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent variale name.`, {
                        code:  trace?.parser.code,
                        row:  trace?.parser.row,
                        select:  trace?.parser.code
                    });
                    process.exit(1);
                }
            }
        } else if (properties[0] == 'json') {
            let json = this.checkArgument(properties[1]) || 'Void';
            let fields;

            if (['set', 'const'].includes(properties[1])) {
                json = this.checkArgument(`${properties[1]}::${properties[2]}`) || 'Void';
                fields = properties.slice(3);
            } else fields = properties.slice(2);
            
            const pull = (obj, field) => obj[field];
            if (typeof json  === 'object' && !Array.isArray(json)) for (const field of fields) json = pull(json, this.checkArgument(field) || field);
            this.$get = json;
        } else if (properties[0] == 'ir_json' || (this.executeEventData && properties[0] == 'event')) {
            let json, fields;

            if (properties[0] == 'event') {
                json = this.executeEventData;
                fields = properties.slice(1);
            } else {
                json = this.checkArgument(properties[1]) || 'Void';
                fields = properties.slice(2);
            }

            const pull = (obj, field) => obj[field];

            for (let index = 0; index < fields.length; index++) {
                const argument = fields[index];
                fields[index] = this.checkArgument(argument, trace?.parser?.code, trace?.parser.row) || argument;
            }

            if (typeof json  === 'object' && !Array.isArray(json)) for (const field of fields) json = pull(json, this.checkArgument(field) || field);
            this.$get = json;
        } else if (properties[0] == 'json_t') {
            const structure_t = properties[1];
            const structure_n = properties[2];

            if (Reflect.ownKeys(this.collections).includes(structure_t)) {
                let i7e;

                if ((i7e = Interface.getInterface(structure_t, structure_n))) {
                    this.$get = i7e?.IArguments;
                } else {
                    let filter = this.collections[structure_t].filter(s => s[structure_n]);
                    this.$get = this.collections[structure_t].length == 0 ? 'Void' : filter[filter.length - 1][structure_n];
                }
            } else {
                new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent structure type.`, {
                    code:  trace?.parser.code,
                    row:  trace?.parser.row,
                    select:  trace?.parser.code
                });
                process.exit(1);
            }
        } else
        properties.forEach((property) => {
            if (property.indexOf(':') > -1) property = property.split(':');

            if ($this instanceof Array) {
                if (property instanceof Array) {
                    try {
                        this.$get = $this.filter(item => item.name == property[0])[0][property[1]];
                        (this.$get == undefined) ? NonExistent(trace, $this[0], property[1]) : this.$list['$get'].push(this.$get);
                    } catch {
                        NonExistent(trace, $this[0], property[1]);
                    }
                } else {
                    try {
                        if (/\w+\[.+\]/.test(property)) {
                            let tokens = /(\w+)\[(.+)\]/.exec(property);
                            let stuff = $this[0]['value'];
        
                            const constexpr = (Array.isArray(stuff) || stuff instanceof List);

                            if (Type.check('String', stuff)) {
                                stuff = stuff.slice(1, -1);
                                this.$get = stuff[this.checkArgument(tokens[2]) || +tokens[2]];
                            } else if (constexpr) {
                                this.$get = stuff.slice(1, -1)[this.checkArgument(tokens[2]) || +tokens[2]];
                            } 

                            if (this.$get == undefined) this.$get = 'Empty';
                            this.$list['$get'].push(this.$get);
                        } else {
                            property = this.checkArgument(property) || property;
                            this.$get = $this.filter(item => item.name == property)[0]['value'];
                            this.$list['$get'].push(this.$get);
                        }
                    } catch {
                        NonExistent(trace, $this, property, 'start');
                    }
                }
            } else if ($this instanceof Function) {
                if (properties[0] == 'kernelos') $this = $this['datalist'];
                $this = $this[property];
            } else {
                try {
                    this.$get = $this[property]();
                    this.$list['$get'].push(this.$get);
                } catch (error) {
                    if (/\[.+\]\[.+\]/.test(property)) {
                        let tokens = property.match(/\[(.+)\]\[(.+)\]/);
                        let stuff = this.checkArgument(`[${tokens[1]}]`);
                        let index = +this.checkArgument(tokens[2], true);
                        
                        if(!ValidatorByType.validateTypeNumber(index)) {
                            new ArgumentError('Invalid type argument', { ...trace, select: tokens[2]});
                        }
                        
                        const constexpr = (
                            Array.isArray(stuff) ||
                            Type.check('String', stuff) ||
                            stuff instanceof List
                            );
                            
                            if (constexpr) {
                                if (Type.check('String', stuff)) stuff = stuff.slice(1, -1);
                                this.$get = stuff[index];
                                if (typeof this.$get == 'undefined') this.$get = 'Empty';
                            }
                        } else {
                            $this = $this[property];
                            if ($this == undefined) NonExistent(trace, this.This, property);
                        }
                }
            }
        });
    }

    /**
     * This function pushes the first argument of the statement to the stack.
     * @param statement - The statement object that is being compiled.
     */
    compilePushStatement(statement, index, trace) {
        if (typeof this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row) === 'boolean') {
            this.$arg0 = this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row);
        } else if (typeof this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row) === 'number') {
            this.$arg0 = this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row);
        } else {
            this.$arg0 = this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row) || statement.args[0];
        }

        let stuff = statement?.args[0];

        if (stuff.indexOf('::') > -1) {
            const [namespace, name] = stuff.split('::');

            if (['set', 'const'].includes(namespace)) {
                'use strict';
                let filter = JSON.parse(JSON.stringify(this[namespace].filter(s => s?.name != name)));
                let searched = this[namespace].filter(s => s?.name == name)[0];
                let buckup = Object.create({ });
                let value = this.checkArgument(statement.args[1]) || statement.args[1];
                if (typeof value === 'string' && Type.check('int', value)) value = Number(value);
                for (const property of Reflect.ownKeys(searched)) buckup[property] = searched[new String(property).valueOf()];

                searched = JSON.parse(JSON.stringify(searched));
                buckup.value.push(value);
    
                // console.log(filter, value, buckup, this[namespace]);
                this[namespace] = [...filter, buckup];

                EventEmulator.on('push', (data, event) => {
                    this.executeEventData = { type: event.type, name, namespace, value, instruction: 'push' };
                    this._executeCode(event.data.body);
                    this.executeEventData = null;
                });

                // console.log(this[namespace]);

                // let filter = this.collections[structure.type].filter(strctr => !strctr[structure.name]);
                // let buckup = Object.create({ });
                // buckup = { interface: new String(searchedStructure.interface).valueOf(), [structure.name]: {} };

                // for (const property of Reflect.ownKeys(searchedStructure[structure.name])) {
                //     buckup[structure.name][property] = new String(searchedStructure[structure.name][property]).valueOf();
                // }

                // buckup[structure.name][statement.name] = statement.value;
                // buckup = JSON.parse(JSON.stringify(buckup));
                // this.collections[structure.type] = [...filter, buckup];

                // let filter = this[namespace].filter(s => s?.name == name);
                // let copy = this[namespace].filter(s => s?.name !== name);
                // let value = this.checkArgument(statement.args[1]) || statement.args[1];
                // if (typeof value === 'string' && Type.check('int', value)) value = Number(value);
                // filter[0].value?.push(value);
                // console.log(filter);
                // console.log([...copy, filter]);
                // this[namespace] = [...copy, filter];
                // console.log(this[namespace]);
            }
        } else {
            this.$stack.push(this.$arg0);
        }
    }


    /**
     * It removes the last element from the stack.
     */
    compilePopStatement() {
        this.$stack.pop();
    }

    /**
     * It takes a statement, and if the statement is not a variable, it sets the value of the variable
     * to the value of the statement.
     * @param statement - The statement that is being compiled.
     */
    compileModifyStatement(statement) {
        this.$arg0 = statement.model;
        this.$arg1 = statement.value;

        if (this.$arg0 == '$text') {
            this.$text = this.checkArgument(this.$arg1) || this.$arg1;
            if (Type.check('String', this.$text)) this.$text = this.$text.slice(1, -1);
        }
    
        if (this.$arg0 == '$offset') this.$offset = this.$arg1;
        if (this.$arg0 == '$sp') this.$sp = this.$arg1;
        if (this.$arg0 == '$mov') this.$mov = this.$arg1;
        if (this.$arg0 == '$math') this.$math = this.checkArgument(this.$arg1) || this.$arg1;
        if (this.$arg0 == '$cmd') this.$cmd = this.checkArgument(this.$arg1) || this.$arg1;
        if (this.$arg0 == '$cmdargs') this.$cmdargs = this.checkArgument(this.$arg1) || this.$arg1;
    }


    /**
     * The function above is used to unset a variable.
     * @param statement - The statement object.
     */
    compileUnsetStatement(statement, index, trace) {
        function invalidTypeArgument(value, { row, code }) {
            new ArgumentError(ArgumentError.ARGUMENT_INVALID_VALUE_ARGUMENT, {
                row: row,
                code: code,
                select: value
            });

            process.exit(1);
        }

        if (typeof this.checkArgument(statement.model, trace?.parser?.code, trace?.parser.row) === 'boolean') {
            invalidTypeArgument(statement.model, trace['parser']);
        } else if (typeof this.checkArgument(statement.model, trace?.parser?.code, trace?.parser.row) === 'number') {
            invalidTypeArgument(statement.model, trace['parser']);    
        } else {
            this.$arg0 = this.checkArgument(statement.model, trace?.parser?.code, trace?.parser.row) || statement.model;
        }
    
        if (this.$arg0 == 'mem') {
            Memory.unset();
            MemoryVariables.unsett();
            MemoryAddress.unset();
        }   else if (this.$arg0 == '$offset') this.$offset = 0x00
            else if (this.$arg0 == '$text')  this.$text = ''
            else if (this.$arg0 == '$sp') this.$sp = 0x00
            else if (this.$arg0 == '$get') this.$get = 0x00, this.$list['$get'] = []
            else if (this.$arg0 == '$urt') this.$urt = 0x00, this.$list['$urt'] = []
        else {
            new ArgumentError(`[${Color.FG_RED}TaskException${Color.FG_WHITE}]: Unknown model / structure`, {
                ...trace['parser'],
                select: statement.value
            });

            process.exit(1);
        }
    }


    /**
     * This function sets the offset to the value of the argument.
     * @param statement - The statement that is being compiled.
     */
    compileOffsetStatement(statement) {
        this.$arg0 = statement.value;
        this.$offset = this.$arg0;
    }


    /**
     * This function takes a statement and adds it to the set.
     * @param statement - The statement object that is being compiled.
     */
    compileDefineStatement(statement, index, trace) {
        this.$arg0 = this.$name = statement.name;
        this.$arg1 = statement.value;

        if (ValidatorByType.validateTypeHex(this.$arg1) 
            || ValidatorByType.validateTypeInt(this.$arg1) || ValidatorByType.validateTypeFloat(this.$arg1)) {
            this.$arg1 = +this.$arg1;
        } else if (ValidatorByType.validateByTypeString(this.$arg1)) {
            this.$arg1 = this.$arg1.slice(1, -1);
        }

        if (this.constants.length > 0 && this.constants.findIndex(cell => cell.name == this.$name) > -1) { } else {
            this.constants.push({ name: this.$name, value: this.$arg1 });
        }

        let type;

        for (const T of Type.types) {
            if (Type.check(T.name, this.$arg1)) type = T.name;
        }

        // WARNING: Experimental mode
        MiddlewareSoftware.compileStatement({ instruction: 'constant', constant: { name: this.$name, type: type, value: this.$arg1 } });
    }


    /**
     * The function reads a file from the file system and then parses it.
     * @param statement - The statement object to parse.
     */
    compileImportStatement(statement, trace) {
        let filePath = ValidatorByType.validateByTypeString(statement.alias) ? statement.alias.slice(1, -1) : statement.alias;
        let fileForCompiler;
        let stacktrace = 0x00;
        let typeAlias = 'Empty';

        if (filePath.lastIndexOf('.') > -1 && filePath.startsWith('.asmX')) {
            new ImportException('Invalid file extension', {
                row: trace?.parser?.row,
                code: trace?.parser?.code,
                select: statement.alias
            });

            stacktrace++;
        }

        /* Reading a file from the file system. */
        try {
            if (ValidatorByType.validateByTypeString(statement.alias)) {
                typeAlias = 'module';
                fileForCompiler = fs.readFileSync(filePath, {encoding: 'utf-8' });
            } else if (ValidatorByType.validateTypeIdentifier(statement.alias)) {
                typeAlias = 'library';
                fileForCompiler = fs.readFileSync(`./libs/${filePath}.asmX`, {encoding: 'utf-8' });
            }

            let parser = Parser.parse(fileForCompiler);
            return parser;
        } catch {
            new ImportException(`You are using a non-existent ${typeAlias} to import`, {
                row: trace?.parser?.row,
                code: trace?.parser?.code,
                select: statement.alias
            });

            stacktrace++;

            if ([7, 8, 9].includes(stacktrace)) ServerLog.log('The stack trace limit is close to 10 for the output of the StackTraceException error', 'Warning');
            if (stacktrace == this.STACKTRACE_LIMIT) new StackTraceException();
        }
    }


    /**
    * It compiles a unit call statement
    * @param statement - The statement object.
    */
    compileCallStatement(statement, index, trace) {
        let options = {
            row: trace?.parser?.row,
            code: trace?.parser?.code
        }


        if (statement?.structure && statement.structure == 'tion' && statement.name) {
            const tions = Interface.customs.filter(custom => custom?.structureType && custom?.structureType == 'tion');
            let idx = trace?.parser.row;
            const filterTions = tions.filter(tio => tio?.structureName && tio.structureName == statement.name);

            if (filterTions.length == 0) {
                new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Not exist tion.`, {
                    code: trace?.parser?.code,
                    row: idx,
                    select: trace?.parser?.code
                });
                process.exit(1);
            } else {
                let searchedTion = null;
                let argumentsHashMap = {};
                let countArguments = 0;
                let initArgs = statement.args.split(',').map(t => t.trim());

                for (let index = 0; index < initArgs.length; index++) {
                    const argument = initArgs[index];
                    initArgs[index] = this.checkArgument(argument, trace?.parser?.code, trace?.parser.row) || argument;
                }

                if (filterTions.length > 0) {
                    const tions = filterTions;
                    ['()', ''].includes(statement.args) ? countArguments = 0 : countArguments = initArgs.length;
                    let filterByTypes = tions.filter(tio => tio?.obj.info.isTypes == true);
                    let filter = null;

                    function baseFilter(tions, isTypes, countArguments) {
                        let filterByTypes = tions.filter(tio => tio?.obj.info.isTypes == isTypes);
                        filter = filterByTypes.filter(tio => tio?.obj.info.countArguments == countArguments);
                        return filter;
                    }

                    if (filterByTypes.length == 0) {
                        let filter = baseFilter(tions, false, countArguments);
                        searchedTion = filter[filter.length - 1];
                    } else {
                        filter = tions.filter(tio => tio?.obj.info.countArguments == countArguments);

                        if (filter.length == 1) {
                            searchedTion = filter[0];
                        } else if (filter.length > 1) {
                            let filterByGrammars = null;

                            if (initArgs.length == 1) {
                                filterByGrammars = filter.filter(tio => tio.obj.info.grammars.number == 4);
                                let typeArgument = null;
                                for (const T of Type.types) if (Type.check(T.name, initArgs[0])) typeArgument = T.name;
                                let filterByType = filterByGrammars.filter(tio => tio?.obj.info.types == typeArgument);

                                if (filterByType.length == 0) {
                                    let filter = baseFilter(tions, false, countArguments);
                                    searchedTion = filter[filter.length - 1];
                                } else {
                                    searchedTion = filterByType[0];
                                }
                            } else if (initArgs.length > 1) {
                                // type arg*
                            }
                        }
                    }
                } else {
                   searchedTion = filterTions[0];
                }

                const tion = searchedTion;
                let body = tion?.obj.body;

                if (countArguments >= 1) {
                    let idx = 0;
                    for (const argument of searchedTion.obj.info.arguments.split(',').map(t => t.trim())) {
                        argumentsHashMap[argument] = initArgs[idx];
                        idx++;
                    }
                }

                if (tion !== null) {
                    let compiler = new Compiler(Parser.parse(body.join('\n')), 'local', { argsScopeLocal: argumentsHashMap || {} });
                    (compiler.$urt == null) ? this.$urt = 'Void' : this.$urt = compiler.$urt;
                }
            }
        }


        else if (statement?.structure && statement.structure == 'class' && statement.name) {
            let collection = this.collections[statement.structure].filter(t => t[statement.name])[0];
            let i7e = Object(this.collections[statement.structure].filter(t => t[statement.name])[0]);
            let ci7e = Interface.getCustomInterface(statement.structure, i7e.interface);
            let constructorInterface = Interface.getInterface('constructor', ci7e.obj.constructor);
            let constructor = Interface.getCustomInterface('constructor', ci7e.obj.constructor);

            let bi7e = new String(i7e?.interface).valueOf();
            let initArgs = statement.args.split(',').map(t => t.trim());
            let iArgs = constructorInterface.IArguments;
            let indexArgs = 0;
            let context  = Reflect.ownKeys(constructorInterface.IArguments)[0];
            let argumentsList = null;

            if(iArgs[Reflect.ownKeys(iArgs)[0]] != 'Any') context = 'self'; // context

            let newcollection = { [statement.name]: {}, interface: bi7e };
            let copy = Object.getOwnPropertyNames(collection[statement.name]);
 
            for (const prop of copy)
                newcollection[statement.name][prop] = collection[statement.name][prop];

            if (initArgs.length == Reflect.ownKeys(constructorInterface.IArguments).length) {
                argumentsList = Reflect.ownKeys(constructorInterface.IArguments);
            } 
            
            else  if (initArgs.length <= Reflect.ownKeys(constructorInterface.IArguments).length) {
                argumentsList = Reflect.ownKeys(constructorInterface.IArguments).slice(1);
            } 
            
            else {
                argumentsList = Reflect.ownKeys(constructorInterface.IArguments);
            }

            for (const argument of argumentsList) {
                if (Type.check(iArgs[argument], initArgs[indexArgs]))
                    newcollection[statement.name][argument] = initArgs[indexArgs];
                else if (iArgs[argument].toLowerCase() == 'any')
                    newcollection[statement.name][argument] = initArgs[indexArgs];
                indexArgs++;
            }
 
            let idx = trace?.parser.row;
            this.executeConstructor = true;
            this.executeClass = statement.name;
            this.executeContext = context;
            this.executeclassData = newcollection;

            for (const line of constructor.obj.body) {
                if (line.startsWith('@')) {
                    let trace = Parser.parse(line)[0];
                    let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                    this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                } else if (!line.startsWith('#')) {
                    // let matches = /^([a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)\s+([a-zA-Z0-9_]*)/.exec(line).filter(t => t).slice(1); v1

                    // v2
                    let matches = /^([a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)\s+([a-zA-Z0-9_]*)/.exec(line);
                    if (matches.indexOf('') > -1 || matches.indexOf(undefined)) matches.filter(t => t);
                    matches = matches.slice(1);

                    if (matches.length == 2) {
                        new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Not enough arguments.`, {
                            code: line,
                            row: idx,
                            select: line
                        });
            
                        ServerLog.log(`Probably need to write the missing argument`, 'Possible fixes');
                        process.exit(1);
                    } else if (matches.length == 3) {
                        if (matches[0] == context) {
                            let initArgs = constructorInterface.IArguments;
                            delete initArgs[context];

                            if (initArgs && Reflect.ownKeys(initArgs).includes(matches[2])) {
                                let initArgs2 = statement.args.split(',').map(t => t.trim());
                                let hashArguments = {};
                                let hashIndex = 0;
                                
                                for (const argument of Reflect.ownKeys(initArgs)) {
                                    hashArguments[argument] = initArgs2[hashIndex];
                                    hashIndex++;
                                }

                                if (Type.check(initArgs[matches[2]], hashArguments[matches[2]]))
                                    newcollection[statement.name][matches[1]] = hashArguments[matches[2]];
                                else newcollection[statement.name][matches[1]] = 'Void';
                            } else {
                                newcollection[statement.name][matches[1]] = matches[2];
                            }
                        } else {
                            new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent context name.`, {
                                code: line,
                                row: idx,
                                select: line
                            });
                
                            ServerLog.log(`You need to write '${context}' instead of a non-existent context`, 'Possible fixes');
                            process.exit(1);
                        }
                    }
                }

                idx++;
            }

            delete [
                this.executeConstructor = false,
                this.executeClass = false,
                this.executeContext = null
            ];

            let backup_classes = this.collections[statement.structure].filter(t => !t[statement.name]);
            backup_classes.push(newcollection);
            this.collections[statement.structure] = backup_classes;
        }
        

        else if (statement?.class && statement?.method) {
           let i7e = Interface.getCustomInterface('method', statement.method);

           if (i7e == undefined) {
                new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent method name or class name.`, {
                    code: trace?.parser.code,
                    row: trace?.parser.row,
                    select: trace?.parser.code
                });

                process.exit(1);
           } else {
                let methodInfo = Interface.getCustomInterface('method', statement.method);
                let methodBody = methodInfo.obj.body;
                let idx = trace?.parser.row;
                let contextGlobal = 'self';
                let i7e = Object(this.collections['class'].filter(t => t[statement.class])[0]);
                let newcollection = { [statement.class]: {} };
                let methodArgs = methodInfo.obj.arguments;
                let initArgs = methodArgs && Parser._parseConstructorArguments(methodArgs).arguments;

                if (i7e == undefined) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent variable class name.`, {
                        code: trace?.parser.code,
                        row: idx,
                        select: trace?.parser.code
                    });
        
                    process.exit(1);
                }

                let cls = Interface.getCustomInterface('class', i7e.interface);

                if (cls == undefined) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent variable class name.`, {
                        code: trace?.parser.code,
                        row: idx,
                        select: trace?.parser.code
                    });
        
                    process.exit(1);
                }

                if (!cls.obj.methods.includes(statement.method)) {
                    new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent method name.`, {
                        code: trace?.parser.code,
                        row: idx,
                        select: trace?.parser.code
                    });
        
                    process.exit(1);
                }

                let copy = Object.getOwnPropertyNames(i7e[statement.class]);
                let buckup_props = {};

                for (const prop of copy)
                    buckup_props[prop] = i7e[statement.class][prop];

                Object.assign(newcollection[statement.class], buckup_props);

                this.executeConstructor = true;
                this.executeClass = statement.class;
                this.executeContext = contextGlobal;
                this.executeclassData = newcollection;
                let updatedProprties = [];

                let initArgs2 = statement.args.split(',').map(t => t.trim());
                let hashArguments = {};
                let hashIndex = 0;

                if (methodArgs !== false) {
                    for (const argument of Reflect.ownKeys(initArgs)) {
                        // hashArguments[argument] = initArgs2[hashIndex]; v1
                        hashArguments[argument] = this.checkArgument(initArgs2[hashIndex]) == null ? 'Void' : (this.checkArgument(initArgs2[hashIndex]) || initArgs2[hashIndex]); //v2
                        hashIndex++;
                    }
                }

                this.executeArgumentsMethod = hashArguments;

                for (const line of methodBody) {
                    if (line.startsWith('@')) {
                        let trace = Parser.parse(line)[0];
                        let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                        this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                    } else if (!line.startsWith('#')) {
                        // let matches = /^([a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)\s+([a-zA-Z0-9_]*)/.exec(line).filter(t => t).slice(1); v1

                        // v2
                        let matches = /^([a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)\s+([a-zA-Z0-9_]*)/.exec(line);
                        if (matches.indexOf('') > -1 || matches.indexOf(undefined)) matches.filter(t => t);
                        matches = matches.slice(1);
    
                        if (matches.length == 2) {
                            new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Not enough arguments.`, {
                                code: line,
                                row: idx,
                                select: line
                            });
                
                            ServerLog.log(`Probably need to write the missing argument`, 'Possible fixes');
                            process.exit(1);
                        } else if (matches.length == 3) {
                            if (matches[0] == contextGlobal) {
                                if (initArgs && Reflect.ownKeys(initArgs).includes(matches[2])) {
                                    let initArgs2 = statement.args.split(',').map(t => t.trim());
                                    let hashArguments = {};
                                    let hashIndex = 0;
                                    
                                    for (const argument of Reflect.ownKeys(initArgs)) {
                                        hashArguments[argument] = initArgs2[hashIndex];
                                        hashIndex++;
                                    }

                                    if (Type.check(initArgs[matches[2]], hashArguments[matches[2]])) {
                                        newcollection[statement.class][matches[1]] = hashArguments[matches[2]];
                                        i7e[statement.class][matches[1]] = hashArguments[matches[2]];
                                    } else {
                                        if (initArgs[matches[2]].toLowerCase() == 'any') {
                                            newcollection[statement.class][matches[1]] = hashArguments[matches[2]];
                                            i7e[statement.class][matches[1]] = hashArguments[matches[2]];
                                        } else {
                                            newcollection[statement.class][matches[1]] = 'Void';
                                            i7e[statement.class][matches[1]] = 'Void';
                                        }
                                    }
                                } else {
                                    newcollection[statement.class][matches[1]] = matches[2];
                                    i7e[statement.class][matches[1]] = matches[2];
                                }

                                updatedProprties.push(matches[1]);
                            } else {
                                new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}Exception${Color.FG_WHITE}]: Non-existent context name.`, {
                                    code: line,
                                    row: idx,
                                    select: line
                                });
 
                                ServerLog.log(`You need to write '${contextGlobal}' instead of a non-existent context`, 'Possible fixes');
                                process.exit(1);
                            }
                        }
                    }
    
                    idx++;
                }

                delete [
                    this.executeConstructor = false,
                    this.executeClass = false,
                    this.executeContext = null
                ];

                let backup_classes = this.collections['class'].filter(t => !t[statement.class]);
                newcollection['interface'] = i7e?.interface;
                backup_classes.push(newcollection);
                this.collections['class'] = backup_classes;
           }
        }


        else if (unitCall.has(statement.name)) {
            let argsMap = unitCall.getArgumentsHashMap(statement.name, statement.args, options);

            for (const argument of Object.keys(argsMap))
                argsMap[argument] = this.checkArgument(argsMap[argument], trace?.parser?.code, trace?.parser?.row) || argsMap[argument];
            
            let argsFor = Object.values(argsMap).join(',');
            let unitcall = unitCall.get(trace?.parser?.code, statement.name, argsFor, options);
            let compiler = new Compiler(unitcall, 'local', { argsScopeLocal: argsMap });
            compiler.$urt == false ? this.$urt = 0x00 : this.$ret = this.$urt = compiler.$urt;
            if (compiler.$urt != false) this.$list['$urt'].push(this.$urt);
        } else {
            new UnitError(trace?.parser?.code , UnitError.UNIT_UNKNOWN, options);
        }
    }


    /**
     * It takes a statement, parses the unit, and then adds it to the unitCall object
     * @param statement - The statement object.
     */
    compileUnitStatement(statement, index, trace) {
        statement = trace;
        let unit = statement.unit;
        let unitParse = Parser.parseUnitStatement(unit[0]);
        let compilerUnit = unit.slice(1).join('\n');
        unitCall.set(unitParse.unit.name, unitParse.unit.rules, compilerUnit, unitParse.unit.argsnames);
    }


    /**
     * It checks the argument of the statement and returns it.
     * @param statement - The statement object that is being compiled.
     */
    compileRetStatement(statement, index, trace) {
        if (this.scope == 'global') {
            process.stdout.write('You must specify a global scope before you compile the statement in the current process');
            this.compileInvoke({ address: 0x01 });
        } else if (this.scope == 'local') {
            this.$urt = this.checkArgument(statement.arg, trace?.parser?.code, trace?.parser.row) || this.$ret || null;
        }
    }


    /**
     * This function handles different types of system calls in JavaScript.
     * @param statement - The statement being compiled and executed.
     * @param index - The index parameter is a numerical value representing the index of the current
     * statement being executed in the code.
     * @param trace - The `trace` parameter is an optional object that contains information about the
     * current execution context, such as the code being executed and the current line number. It is
     * used to provide more detailed error messages in case of exceptions.
     */
    compileInvokeStatement(statement, index, trace) {
        this.$arg0 = this.checkArgument(statement.address, trace?.parser?.code, trace?.parser.row) || statement.address;
            
        // WARNING: Experimental mode
        MiddlewareSoftware.compileStatement({ instruction: 'invoke', invoke: { name: statement.address } });
        if (this.$arg0 == 0x01) {
            process.exit(0);
        } else if (this.$arg0 == 0X02) {
            try {
                let string = JSON.parse(`{ "String": "${this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value}" }`)['String'];
                console.log(typeof JSON.parse(string));
            } catch {
                console.log(this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value);
            }
        } else if (this.$arg0 == 0x03) {
            this.$arg0 = this.$input = FlowInput.createInputStream(this.$text);
            this.$list['$input'].push(this.$input);
            this.$stack.push({ value: this.$arg0 });
            Task.new('input', this.$arg0, 'proccess');
        } else if (this.$arg0 == 0x04) {
            try {
                const item = this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value;
                const item_t = typeof item;

                if (item_t == 'object' && Array.isArray(item)) {
                    console.log(item);
                } else {
                    let string = JSON.parse(`{ "String": "${this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value}" }`)['String'];
                    FlowOutput.createOutputStream(string);
                }
            } catch {
                FlowOutput.createOutputStream(this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value);
            }
        } else if (this.$arg0 == 0x05) {
            try {
                let string = JSON.parse(`{ "String": "${this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value}" }`)['String'];
                process.stdout.write(string);
            } catch {
                process.stdout.write(this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value);
            }
        } else if (this.$arg0 == 0x08) {
            if (Type.check('String', this.$cmd)) this.$cmd = this.$cmd.slice(1, -1);
            if (Type.check('String', this.$cmdargs)) this.$cmdargs = this.$cmdargs.slice(1, -1);      

            if (Security.isSecurity(this.$cmd) == false || Security.isSecurity(this.$cmdargs) == false) {
                ServerLog.log('The program performs dangerous actions related to your device and other drivers, as well as to the system.', 'Security Log');
                process.exit(1);
            } else {
                let proc = exec(`${this.$cmd} ${this.$cmdargs}`.trim(), (err, stdout, stderr) => {
                    // err && console.log(err);
                    stdout && console.log(stdout);
                });

                this.$pid = proc.pid;
            }
        } else if (this.$arg0 == 0x09) {
            if (Security.isSecurity(this.$cmd) == false || Security.isSecurity(this.$cmdargs) == false) {
                ServerLog.log('The program performs dangerous actions related to your device and other drivers, as well as to the system.', 'Security Log');
                process.exit(1);
            } else {
                this.$cmdargs = this.checkArgument(this.$cmdargs) || this.$cmdargs;
                if (Type.check('String', this.$cmdargs)) this.$cmdargs = this.$cmdargs = this.$cmdargs.slice(1, -1);       
                let proc = execSync(`${this.$cmd} ${this.$cmdargs}`.trim());

                try {
                    this.$cmdret = JSON.parse(proc.toString('utf8'));
                } catch {
                    this.$cmdret = proc.toString('utf8');
                }
            }
        } else {
            new SystemCallException(SystemCallException.SYSTEM_CALL_NOT_FOUND, { ...trace['parser'], select: this.$arg0 });
            process.exit(1);
        }
    }


    /**
     * "This function takes a statement, maps the arguments to integers, reduces the arguments to a
     * single value, and pushes the result to the stack."
     * 
     * The first thing we do is map the arguments to integers. We do this by using the `parseInt`
     * function. The `parseInt` function takes two arguments: the first is the string to convert to an
     * integer, and the second is the base of the number. In this case, we're converting hexadecimal
     * numbers to integers.
     * 
     * The next thing we do is reduce the arguments to a single value. We do this by using the `reduce`
     * function. The `reduce` function takes two arguments: the first is a function that takes two
     * arguments, and the second is the initial value. In this case, the function takes two arguments:
     * the previous argument and the current argument. The initial value is the first argument.
     * 
     * The last thing we
     * @param statement - The statement object that is being executed.
     */
    compileEqualStatement(statement) {
        const args = statement.args.map(arg => parseInt(arg, 16));
        this.$ret = this.$eq = args.reduce((previousArg, currentArg) => previousArg === currentArg);
        if (isNaN(this.$ret)) this.$ret = 0x00;
        this.$stack.push({ value: this.$ret });
    }


    /**
     * This function compiles an addition statement by validating and adding all the arguments, and
     * then pushing the result onto the stack.
     * @param statement - The statement object that contains information about the "add" operation
     * being compiled, such as the operation type and its arguments.
     * @param index - The index parameter in the function `compileAddStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It is not used for any other
     * purpose within the function.
     * @param trace - The `trace` parameter is an optional object that contains information about the
     * code being compiled, such as the code itself and the row number. It is used to provide more
     * detailed error messages if there are any issues during compilation.
     */
    compileAddStatement(statement, index, trace) {
        // WARNING: Experimental mode
        const { isPush, repeatPush, args } = this._checkPushToStack(statement.args);
        statement.args = args;
        //

        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        for (let i = 0, l = statement.args.length; i < l; i++) statement.args[i] = +this[`$arg${i}`];
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = 0x00;
        for (let index = 0; index < statement.args.length; index++) this.$ret += this[`$arg${[index]}`];

        let argumentsMiddleware = [];
        for (let index = 0; index < statement.args.length; index++) argumentsMiddleware.push(this[`$arg${[index]}`]);
        MiddlewareSoftware.compileStatement({ instruction: 'add', r0: '$ret', arguments: argumentsMiddleware });
        
        // this.$stack.push({ value: this.$ret }); v1

        // WARNING: Experimental mode
        if (isPush && repeatPush == 0) {
            this.$stack.push({ value: this.$ret });
        } else if (isPush && repeatPush > 0) {
            for (let index = 0; index < repeatPush; index++) this.$stack.push({ value: this.$ret });
        }
        //
    }


    /**
     * This function compiles a subtraction statement by validating the arguments and subtracting them
     * from the first argument.
     * @param statement - The statement to be compiled, which is an object containing information about
     * the code to be executed.
     * @param index - The index parameter in the function `compileSubStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It starts at 1 because the first
     * argument is already assigned to `this.`.
     * @param trace - The `trace` parameter is an object that contains information about the current
     * execution context, including the parser code and row number. It is used to provide more detailed
     * error messages and debugging information.
     */
    compileSubStatement(statement, index, trace) {
        // WARNING: Experimental mode
        const { isPush, repeatPush, args } = this._checkPushToStack(statement.args);
        statement.args = args;
        //

        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        statement.args = statement.args.map(argument => this.checkArgument(argument) ?? argument);
        // this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret -= this[`$arg${[index]}`];

        // WARNING: Experimental mode
        let argumentsMiddleware = [];
        for (let index = 0; index < statement.args.length; index++) argumentsMiddleware.push(this[`$arg${[index]}`]);
        MiddlewareSoftware.compileStatement({ instruction: 'sub', r0: '$ret', arguments: argumentsMiddleware });
        //

        // this.$stack.push({ value: this.$ret }); v1

        // WARNING: Experimental mode
        if (isPush && repeatPush == 0) {
            this.$stack.push({ value: this.$ret });
        } else if (isPush && repeatPush > 0) {
            for (let index = 0; index < repeatPush; index++) this.$stack.push({ value: this.$ret });
        }
        //
    }


    /**
     * This function compiles a division statement in JavaScript, checking the type of arguments and
     * pushing the result onto the stack.
     * @param statement - The statement object that contains information about the division operation
     * to be performed.
     * @param index - The index parameter in the function `compileDivStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It starts at 1 because the first
     * argument is already assigned to ``.
     * @param trace - The `trace` parameter is an optional object that contains information about the
     * code being executed, including the parser code and row number. It is used to provide more
     * detailed error messages and debugging information.
     */
    compileDivStatement(statement, index, trace) {
        // WARNING: Experimental mode
        const { isPush, repeatPush, args } = this._checkPushToStack(statement.args);
        statement.args = args;
        //

        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret /= this[`$arg${[index]}`];

        // WARNING: Experimental mode
        let argumentsMiddleware = [];
        for (let index = 0; index < statement.args.length; index++) argumentsMiddleware.push(this[`$arg${[index]}`]);
        MiddlewareSoftware.compileStatement({ instruction: 'div', r0: '$ret', arguments: argumentsMiddleware });
        //

        // this.$stack.push({ value: this.$ret }); v1

        // WARNING: Experimental mode
        if (isPush && repeatPush == 0) {
            this.$stack.push({ value: this.$ret });
        } else if (isPush && repeatPush > 0) {
            for (let index = 0; index < repeatPush; index++) this.$stack.push({ value: this.$ret });
        }
        //
    }


    /**
     * This function compiles a modulo statement in JavaScript, validating the arguments and returning
     * the result.
     * @param statement - The statement to be compiled, which is an object containing information about
     * the "mod" operation and its arguments.
     * @param index - The index parameter in the function `compileModStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It starts at 1 because the first
     * argument is already assigned to ``.
     * @param trace - The `trace` parameter is an object that contains information about the current
     * execution context, including the parser code and row number. It is used to provide more detailed
     * error messages and debugging information.
     */
    compileModStatement(statement, index, trace) {
        // WARNING: Experimental mode
        const { isPush, repeatPush, args } = this._checkPushToStack(statement.args);
        statement.args = args;
        //

        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret %= this[`$arg${[index]}`];

        // this.$stack.push({ value: this.$ret }); v1

        // WARNING: Experimental mode
        if (isPush && repeatPush == 0) {
            this.$stack.push({ value: this.$ret });
        } else if (isPush && repeatPush > 0) {
            for (let index = 0; index < repeatPush; index++) this.$stack.push({ value: this.$ret });
        }
        //
    }


    /**
     * This function compiles an mul statement in JavaScript by checking the type of arguments and
     * multiplying them together.
     * @param statement - The statement object that contains information about the "mul" statement
     * being compiled, such as the name of the statement and its arguments.
     * @param index - The index parameter in the function `compileMulStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It is not used for any other
     * purpose within the function.
     * @param trace - The `trace` parameter is an optional object that contains information about the
     * current execution context, such as the code being executed and the current row in the code. It
     * is used to provide more detailed error messages and debugging information.
     */
    compileMulStatement(statement, index, trace) {
        // WARNING: Experimental mode
        const { isPush, repeatPush, args } = this._checkPushToStack(statement.args);
        statement.args = args;
        //

        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = 1;
        for (let index = 0; index < statement.args.length; index++) this.$ret *= this[`$arg${[index]}`];

        // WARNING: Experimental mode
        let argumentsMiddleware = [];
        for (let index = 0; index < statement.args.length; index++) argumentsMiddleware.push(this[`$arg${[index]}`]);
        MiddlewareSoftware.compileStatement({ instruction: 'mul', r0: '$ret', arguments: argumentsMiddleware });
        //

        // this.$stack.push({ value: this.$ret }); v1

        // WARNING: Experimental mode
        if (isPush && repeatPush == 0) {
            this.$stack.push({ value: this.$ret });
        } else if (isPush && repeatPush > 0) {
            for (let index = 0; index < repeatPush; index++) this.$stack.push({ value: this.$ret });
        }
        //
    }


    /**
     * "The compilerStack function pushes the address of the statement to the stack, and then pushes
     * the name of the live point to the stack."
     * 
     * The compilerStack function is called by the compiler when it encounters a statement that is a
     * live point.
     * 
     * The compilerStack function is called by the compiler when it encounters a
     * @param statement - The statement object that is being compiled.
     */
    compileStackStatement(statement) {
        this.$arg0 = statement.address;
        this.$ret = 0x00;

        /**
         * If the row has a value property, then call the function again with the value property as the
         * row. Otherwise, return the value property
         * @param row - the row object
         * @returns The value of the key 'value' in the object.
         */
        function recursionGetValueByStack(row) {
            try {
                return Object.keys(row.value).includes('value') ? recursionGetValueByStack(row.value) : row.value;
            } catch { throw new Error().stack = 'Couldn\'t find value'; }
        }

        /* Getting the value of the last item in the stack, and then pushing it to the stack. */
        this.$ret = recursionGetValueByStack(this.$stack.list[this.$stack.list.length - 1]);
        this.$stack.push({ address: this.$mov.livePointAddress, value: this.$ret });
    }


    /**
     * It takes a statement, gets the name and address of the statement, gets the cell by the name of
     * the statement, gets the value of the cell by the address of the cell, sets the return value to
     * the value of the cell, pushes the address and value of the cell to the stack, and sets the point
     * of the mov to the name and address of the statement
     * @param statement - The statement that is being compiled.
     */
    compileRouteStatement(statement, index, trace) {
        if (!(typeof statement.address === 'undefined')) {
            this.$arg0 = this.$name = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row) || statement.name;
            this.$arg1 = statement.address;
            let cell = MemoryVariables.getCellByValue(MemoryAddress.getCellByValue(this.$arg0)?.name);
            let value = Memory.getCellByAddress(cell.address);
            this.$ret = value;
            if (Type.check('String', value)) value = value.slice(1, -1);
            this.$stack.push({ address: this.$arg1, value: value });
            this.route.setPoint(this.$arg0, this.$arg1);
        } else {
            // variable
            if (typeof this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row) === 'boolean') {
                this.$arg0 = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row);
            } else if (typeof this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row) === 'number') {
                this.$arg0 = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row);
            } else {
                if (this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row) == null) {
                    this.$arg0 = 'Void'; 
                } else {
                    // this.$arg0 = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row) || statement.name; // v1
                    this.$arg0 = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row); // v2
                }
            }

            // WARNING: Experimental mode
            MiddlewareSoftware.compileStatement({ instruction: 'route', route: { name: statement.name } });

            if (typeof this.$arg0 === 'string' && (this.$arg0.indexOf('\'') == 0 && this.$arg0.lastIndexOf('\'') == this.$arg0.length - 1)) this.$arg0 = this.$arg0.slice(1, -1);
            else if (typeof this.$arg0 === 'string' && (this.$arg0.indexOf('\"') == 0 && this.$arg0.lastIndexOf('\"') == this.$arg0.length - 1)) this.$arg0 = this.$arg0.slice(1, -1);
            this.$stack.push({ value: this.$arg0 });
        }
    }
    
    
    /**
     * The function compilerAddress() takes a statement as an argument and sets the address of the
     * statement to the name of the statement.
     * @param statement - The statement object that is being compiled.
     */
    compileAddressStatement(statement) {
        this.$arg0 = statement.address;
        this.$arg1 = this.$name = statement.name;
        this.$stack.push({ address: this.$arg0, value: this.$arg1 });
        MemoryAddress.setAddress(this.$arg0, this.$arg1);
        const memory = Memory.getCellByAddress(this.$arg0);
        MemoryVariables.setCell({ name: this.$arg1, address: this.$arg0, memory: memory });
    }
    
    
    /**
     * The function takes a statement, and then pushes the name of the statement to the stack.
     * @param statement - The statement object that is being compiled.
     */
    compileMemoryStatement(statement) {
        this.$arg0 = this.$name = statement.name;
        this.$arg1 = statement.address;
        this.$stack.push({ address: this.$arg1, value: this.$arg0 });
        let set = this.set.filter(cell => cell.name === this.$arg0);
        set['address'] = this.$arg1;
        this.mem.addCell(this.$arg1, ...set);
    }


    /**
     * It takes a statement object, and pushes it to the set array.
     * @param statement - The statement object that is being compiled.
     */
    compileSetStatement(statement, index, trace) {
        let isType = false;
        let typeInList = false;
        for (const T of Type.types) if (T.name == statement.type) isType = true;
        let forReplace = { name: statement.name, value: statement.value };
        statement.name = this.checkArgument(statement.name, trace.parser.code, trace.parser.row) || statement.name;
        statement.value = this.checkArgument(statement.value, trace.parser.code, trace.parser.row) || statement.value;
        trace.parser.code = trace?.parser.code.replace(forReplace.name, statement.name);
        trace.parser.code = trace?.parser.code.replace(forReplace.value, statement.value);
        
        for (const T of Type.types) if (T.name == statement.type) typeInList = true;

        if (Task.last() && Task.last()['value'] == statement.value && Task.last()['name'] == 'input') {
            statement.value = `'${statement.value}'`;
        }

        // v1
        // if (this.checkArgument(forReplace.name) != undefined || this.checkArgument(forReplace.value) != undefined) {
        //     isType = true;
        // }
    
        else if (forReplace.value.startsWith('json::')) isType = true;

        else if (statement.type == 'Object') {
            if (typeof statement.value === 'object' && !Array.isArray(statement.value)) isType = true;
            else isType = false;
        }

        else if (statement.type == 'List') {
            if (typeof statement.value === 'object' && Array.isArray(statement.value)) isType = true;
            else if (statement.value == '[]') {
                isType = true;
                statement.value = [];
            }
            else isType = false;
        }

        else if (statement.type == 'Auto') {
            if (isType = false && /[_a-zA-Z][_a-zA-Z0-9]{0,30}/.test(forReplace.value)) {
                statement.value = `'${statement.value}'`;
            }

            isType = true;
        } else {
            if (typeInList == false) {
                new TypeError(trace.parser?.code, statement.type, { row: trace.parser?.row });
                process.exit(1);
            }

            isType = Type.check(statement.type, statement.value);
        }

        if (isType == false) {
            new ArgumentError(ArgumentError.ARGUMENT_INVALID_VALUE_ARGUMENT, {
                row: trace?.parser.row,
                code: trace?.parser.code,
                select: statement.value
            });

            process.exit(1);
        }


        this.$arg0 = this.$name = statement.name;
        this.$arg1 = statement.type;
        this.$arg2 = statement.value;
        let eventType = null;

        if (this.set.length > 0 && this.set.findIndex(cell => cell.name == this.$name) > -1) {
            let index = this.set.findIndex(cell => cell.name == this.$name);
            this.set[index].type = this.$arg1;
            this.set[index].value = this.$arg2;
            eventType = 'change';

            // this.set = this.set.filter(cell => cell.name !== this.$name).push({ name: this.$name, type: this.$arg1, value: this.$arg2 }); v1
        } else {
            this.set.push({ name: this.$name, type: this.$arg1, value: this.$arg2 });
            eventType = 'set';
        }

        EventEmulator.on(eventType, (data, event) => {
            this.executeEventData = { type: event.type, name: this.$name, type: this.$arg1, value: this.$arg2, instruction: 'set' };
            this._executeCode(event.data.body);
            this.executeEventData = null;
        });

        // WARNING: Experimental mode
        MiddlewareSoftware.compileStatement({ instruction: 'variable', variable: { name: this.$name, type: this.$arg1, value: this.$arg2 } });
    }


    /**
     * The function takes a statement and a usestate object as arguments. The statement object has a
     * state property. The function then sets the usestate object's state property to the value of the
     * statement object's state property
     * @param statement - The statement object that is being compiled.
     * @param usestate - This is the object that is passed to the compiler. It is the object that is
     * used to store the state of the compiler.
     */
    compileIssueStatement(statement, usestate) {
       this.$arg0 = statement.state;
       process.stdout.write(Issues.ISSUES_DEFINE_STATUS);
       statement.state == 'true' ? usestate.state = true : usestate.state = false;
    }


    compileMutStatement(statement, index, trace) {
        this.compileSetStatement(statement, index, trace);
    }


    compileImmutStatement(statement, index, trace) {
        this.compileDefineStatement(statement, index, trace);
    }

    
    /**
     * The function checks if the type of arguments in a list matches a given function and throws an
     * error if they don't.
     * @param list - The `list` parameter is an array of arguments that need to be checked for their
     * type.
     * @param trace - The `trace` parameter is likely an object that contains information about the
     * location or context in which the `checkTypeArguments` function is being called. It may include
     * properties such as `parser` which could provide information about the parser being used.
     * However, without more context it is difficult to determine the
     * @param func - The `func` parameter is a function that takes an argument and returns a boolean
     * value indicating whether the argument is of the correct type. This function is used to validate
     * the type of each argument in the `list` parameter.
     */
    checkTypeArguments(list, trace, func) {
        list.map(arg => {
            if (!func(this.checkArgument(arg) || arg)) {
                new ArgumentError(ArgumentError.ARGUMENT_INVALID_TYPE_ARGUMENT, { select: arg, ...trace?.parser });
                ServerLog.log('You need to use numeric type arguments.', 'Possible fixes');
                process.exit(1);
            }
        });
    }


    /**
     * It takes a statement and a type, and then sets the arguments to the statement's arguments
     * @param statement - The statement that is being compiled.
     * @param type - The type of the variable.
     */
    compilerAllArguments(statement, type, code, row){
        for (let index = 0; index < statement.args.length; index++)
            if (type == 'Int' || type == 'Float') this[`$arg${index}`] = +this.checkArgument(statement.args[index], code, row) || +statement.args[index] || 0x00;
            else if (type == 'String') this[`$arg${index}`] = this.checkArgument(statement.args[index], code, row) || statement.args[index] || 0x00;
            else if (type == 'Bool') this[`$arg${index}`] = Boolean(this.checkArgument(statement.args[index], code, row) || statement.args[index] || 0x00);
    }


    _executeCode(body) {
        let ast = Parser.parse(body.join('\n'));
        let index = 0;

        for (const tree of ast) {   
            let statement = Reflect.ownKeys(tree).filter(stmt => stmt != 'parser')[0];
            this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](tree[statement], index, tree);
            index++;
        }
    }


    _checkPushToStack(args) {
        let isPush = true;
        let repeatPush = 0;

        if (args.includes('$0')) {
            args.pop();
            isPush = false;
        } else if (args.includes('$1')) {
            args.pop();
            isPush = true;
        } else if (/\$([2-9]|[0-9][0-9]+)$/.test(args.join(' ').trimEnd())) {
            let flag = args.pop().slice(1);
            repeatPush = Number(flag);
            isPush = true;
        }

        return { isPush, repeatPush, args };
    }


    /**
     * If the argument is a register, return the value of that register
     * @param arg - The argument to check.
     * @returns The value of the argument.
     */
    checkArgument(arg, code, row, strict = false) {
        let $al =  this.argsScopeLocal; // $al - arguments in local scope
        let $cl = this.constants; // $cl - constants list
        let $vl = this.set; // $vl - variables list

        /**
         * It checks if the argument passed to it is a valid argument, and if it is, it returns the
         * value of the argument.
         * @param arg - The argument that is being checked.
         * @returns The value of the argument.
         */
        function checkArgumentsUnit(arg) {
            let $edx = 0x00;
            $edx = $al[arg.slice(1, -1)];
            return $edx;
        }


        /**
         * It checks if the argument is a variable, and if it is, it returns the value of the variable
         * @param arg - The argument to check.
         * @returns The value of the variable.
         */
        function checkVariable(arg) {
            let $edx = 0x00;
            $vl.forEach(set => set.name == arg ? $edx = set.value : $edx);
            return $edx;
        }

        
        /**
         * If the constant list has the argument, then for each constant in the constant list, if the
         * constant is equal to the argument, then set the edx register to the constant, otherwise set
         * the edx register to the edx register.
         * @param arg - The argument to check if it's a constant.
         * @returns The constant value of the argument.
         */
        function checkConstant(arg) {
            let $edx = 0x00;
            $cl.forEach(constant => constant.name == arg ? $edx = constant.value : $edx);
            Garbage.setMatrix('define', $cl.map($c => $c.name));
            Garbage.usage('define', arg);
            return $edx;
        }


        if (typeof arg === 'string' && (arg.startsWith('fmt\'') || arg.startsWith('fmt\"'))) {
            let string_t = arg.slice(3);
            const check = (argument) => this.checkArgument(argument) == null ? 'Void' : this.checkArgument(argument);

            const grammars = [
                /(\$[A-Z][A-Z\d]+)/g, /\[([_a-zA-Z][_a-zA-Z0-9]{0,30})\]/g, /^[A-Z]+(_[A-Z]+)*$/g, /(\$\w+)/g,
                /(\[\s*set\:\:[a-zA-Z][a-zA-Z0-9_]+\s*\])/g,
                /(\[\s*const\:\:[A-Z][A-Z0-9_]+\s*\])/g,
            ];

            if (this.executeContext) grammars.push(new RegExp(`${this.executeContext}\.[_a-zA-Z][_a-zA-Z0-9]+`, 'g'))

            for (let i = 0, len = grammars.length; i < len; i++) {
                const grammar = grammars[i];

                string_t = string_t.replace(grammar, (match) => {
                  if(/(\[\s*set\:\:[_a-zA-Z][_a-zA-Z0-9]+\s*\])/.test(match)) {
                    return check(match.slice(1, -1).trim());
                  }

                  else if (/(\[\s*const\:\:[A-Z][A-Z0-9_]+\s*\])/.test(match)) {
                    return check(match.slice(1, -1).trim().slice(7));
                  }

                  return this.checkArgument(match) == null ? 'Void' : this.checkArgument(match);
                });
            }

            return string_t;
        }


        if (typeof arg === 'string' && (arg.startsWith('expr\'') || arg.startsWith('expr\"'))) {
            let string_t = arg.slice(5, -1);
            let expression_t = new Expression(string_t);
            if (expression_t.answer() == 0) return '0';
            else return expression_t.answer();
        }


        /* Checking if the argument is a variable, constant, or a unit. */  
        if (/\[[_a-zA-Z][_a-zA-Z0-9]{0,30}\]/.test(arg)) return checkArgumentsUnit(arg);
        if (/\[[_a-zA-Z][_a-zA-Z0-9]{0,30}\]/.test(arg)) return checkVariable(arg);
        if (/^[A-Z]+(_[A-Z]+)*$/.test(arg)) return checkConstant(arg);

        if (typeof arg === 'string' && this.executeArgumentsMethod) {
            if (Reflect.ownKeys(this.executeArgumentsMethod).includes(arg)) return this.executeArgumentsMethod[arg];
        }

        if (typeof arg === 'string' && arg.indexOf('.') > -1 && !Type.check('String', arg) && this.executeClass) {
            const [ctx, property] = arg.split('.');
            return this.executeclassData[this.executeClass][property] == undefined ? 'Void' : this.executeclassData[this.executeClass][property];
        }

        if (typeof arg !== 'number' && arg.indexOf('::') > -1) {
            this.compileGetStatement({ args: arg }, 0, {
                parser: { row: row, code: code }
            });

            return this.$get;
        }

        if (typeof arg === 'string' && /^[^_][\d\_]+[^_]$/.test(arg)) {
            let int_t = arg.replaceAll('_', '');
            return Number(int_t);
        }

        else if (typeof arg === 'string' && /^[^_][\d\_]+\.[\d\_]+[^_]$/.test(arg)) {
            let int_t = arg.replaceAll('_', '');
            return Number(int_t);
        }

        if (/\$[A-Z][A-Z\d]+/.test(arg)) {
            if (Reflect.has(this, `${arg.toLowerCase()}`)) {
                return this[`${arg.toLowerCase()}`];
            } else if (Reflect.ownKeys(this.registers).includes(arg.toLowerCase())) {
                return this[`$${this.registers[arg.toLowerCase()]}`];
            } else if (/\$([A-Z][A-Z\d]+)(\?)?\[([^])\]/.test(arg)) {
                let match = arg.match(/(\$[A-Z][A-Z\d]+)(\?)?\[([^])\]/);
                let item = this.$list[match[1].toLowerCase()][match[3]];
                let is = match[2] == '?';

                if (item == undefined && !is) {
                    new ArgumentError(`[ArgumentException]: Non-existent item`, {
                        code: code || ' ',
                        row: row || 0,
                        select: arg
                    });

                    process.exit(1);
                }

                return item;
            } else {
                new RegisterException('Non-existent register', {
                    row: row || 0,
                    code: code || ' ',
                    select: arg
                });

                const registers = Reflect.ownKeys(this).filter(property => /\$\w+/.test(property));
                const coincidences = NeuralNetwork.coincidence(registers, [arg]);
                const presumably = NeuralNetwork.presumably(coincidences);
                ServerLog.log(`Perhaps you wanted to write some of these registers: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');

                process.exit(1);
            }
        }

        if (/\$\w+/.test(arg)) {
            if (Reflect.has(this, `${arg}`)){
                return this[`${arg}`];
            } else if (Reflect.ownKeys(this.registers).includes(arg.toLowerCase())) {
                return this[`$${this.registers[arg.toLowerCase()]}`];
            } else if (/(\$\w+)(\?)?\[([^])\]/.test(arg)) {
                let match = arg.match(/(\$\w+)(\?)?\[([^])\]/);
                let item = this.$list[match[1]][match[3]];
                let is = match[2] == '?';

                if (item == undefined && !is) {
                    new ArgumentError(`[ArgumentException]: Non-existent item`, {
                        code: code || ' ',
                        row: row || 0,
                        select: arg
                    });

                    process.exit(1);
                }

                return item;
            } else {
                new RegisterException('Non-existent register', {
                    row: row || 0,
                    code: code || ' ',
                    select: arg
                });

                const registers = Reflect.ownKeys(this).filter(property => /\$\w+/.test(property));
                const coincidences = NeuralNetwork.coincidence(registers, [arg]);
                const presumably = NeuralNetwork.presumably(coincidences);
                ServerLog.log(`Perhaps you wanted to write some of these registers: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');

                process.exit(1);
            }
        }
    }
}

module.exports = Compiler;