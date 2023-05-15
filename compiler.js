//===========================================================================================
//          The main part in the AsmX compiler, the Kernel is also the main part.
//===========================================================================================

// requires
const fs = require('fs');

// Components that compiler
const { UnitError, TypeError, RegisterException, ArgumentError, ImportException, StackTraceException, UsingException, ConstException } = require('./anatomics.errors');
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

class Compiler {
    constructor(AbstractSyntaxTree) {
        this.AbstractSyntaxTree = AbstractSyntaxTree; // <Type> - array
        const Switching = { state: false };
        this.options = arguments[2];
        this.scope = arguments[1] || 'global'; // or 'local'
        this.type = this.options?.registers?.type || 'Program';
        this.argsScopeLocal = this.options?.argsScopeLocal || {}; // arguments from the unit
        this.set = [];
        this.constants = [];
        this.labels = [];
        this.subprograms = [];
        this.enviroments = [];
        this.usings = [];
        const PATH_TO_SYSTEMS_DIRECTORY = './systems';
        this.STACKTRACE_LIMIT = 10;

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
                const: this.constants
            },

            local: {
                unit: {
                    set: null,
                    const: null
                }
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
        // jmp
        this.$count = 0x01;
        // return
        this.$urt = false;
        this.$ret = false;
        // Execute registers
        this.$mov = 0x00;
        this.$get = 0x00;
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
            this.$arg0 = this.options.registers['$arg0'];
            this.$arg1 = this.options.registers['$arg1'];
            this.$arg2 = this.options.registers['$arg2'];
            this.$arg3 = this.options.registers['$arg3'];
            this.$arg4 = this.options.registers['$arg4'];
            this.$arg5 = this.options.registers['$arg5'];
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
            this.set = this.options.registers['set'];
            this.labels = this.options.registers['labels'];
            this.enviroments = this.options.registers['enviroments'];
            this.subprograms = this.options.registers['subprograms'];
            this.stack = this.options.registers['stack'] || new Stack();
            this.This = this.options.registers['This'];
            this.scope = this.options.registers['scope'];
            this.type = this.options.registers['type'];
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

        const alias = Parser.parse(fs.readFileSync(`${PATH_TO_SYSTEMS_DIRECTORY}/syscalls.asmX`, {encoding: 'utf-8' }));
            if (alias && alias instanceof Array)
                for (let index = 0; index < alias.length; index++) this.AbstractSyntaxTree.unshift(alias[index]);

                
        this.AbstractSyntaxTree.map(trace => {
            if (trace?.import){
                Switching.state && process.stdout.write(Issues.IMPORT_EVENT);
                const alias = this.compileImportStatement(trace.import, trace);

                if (alias && alias instanceof Array)
                    for (let index = 0; index < alias.length; index++) this.AbstractSyntaxTree.unshift(alias[index]);
            }

            if (trace?.const) this.compileDefineStatement(trace.const);
        });


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
        
        if (this.$arg0 == 'inc')    this.$ret = this.$math = args[0] + 1;
        if (this.$arg0 == 'dec')    this.$ret = this.$math = args[0] - 1;
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
        if (this.$arg0 == 'atan2')  this.$ret = this.$math = Math.atan2(args[0]);
        
        if (this.$arg0 == 'mov')    this.$ret = this.$mov = args[0];
        
        if (this.$arg0 == 'eq')     this.$ret = this.$eq = +args[0] ==+args[1];
        if (this.$arg0 == 'seq')    this.$ret = this.$seq = args[0] === args[1];
        if (this.$arg0 == 'cmp')    this.$ret = this.$cmp = +args[0] > +args[1];
        if (this.$arg0 == 'xor')    this.$ret = this.$xor = args[0] ^ args[1];
        if (this.$arg0 == 'not')    this.$ret = this.$not = +args[0] == 1 ? 0 : 1;
        if (this.$arg0 == 'and')    this.$ret = this.$and = args[0] && args[1];
        if (this.$arg0 == 'or')     this.$ret = this.$or = args[0] || args[1];
        if (this.$arg0 == 'b_and')  this.$ret = this.$b_and = args[0] & args[1];
        if (this.$arg0 == 'b_or')   this.$ret = this.$b_or = args[0] | args[1];
        
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
                this.scope = compile.scope;
                this.This = compile.This;
                this.argsScopeLocal = compile.argsScopeLocal;
                this.type = compile.type;

              //  (iterator == this.$count-1) ? this.type = 'Program' : this.type = 'cycle';
            }
        }

        function labelNonExistent(trace, label) {
            new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent label`, {
                row: trace?.parser.row,
                code: trace?.parser.code || `@label ${label}:`,
                select: label,
                position: 'end'
            });

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
                labels: globalThis.labels 
            };
            
            if (label == null) {
                labelNonExistent(trace, label);
            } else {
                try {
                    label = label[0][labelname].join('\n');
                } catch {
                    labelNonExistent(trace, labelname);
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
                    stack: globalThis.stack
                };

                for (const register of Object.getOwnPropertyNames(globalThis)) {
                    if (register.match(/\$\w+/)) registers[register] = globalThis[register];
                }
    
                let compiler = new Compiler(Parser.parse(subprogram[0][subprogramname].join('\n')), globalThis.scope, { registers: registers });
    
                for (const register of Object.getOwnPropertyNames(compiler)) {
                    if (register.match(/\$\w+/)) globalThis[register] = compiler[register];
                }

                globalThis.set = compiler.set;
                globalThis.constants = globalThis.constants;
                globalThis.This = globalThis.This;
                globalThis.scope = globalThis.scope;
                globalThis.labels = globalThis.labels;
                globalThis.enviroments = globalThis.enviroments;
                globalThis.subprograms = globalThis.subprograms;
                globalThis.stack = globalThis.stack;
            } catch {
                new ArgumentError(`[${Color.FG_RED}StructureNotFoundException${Color.FG_WHITE}]: Non-existent subprogram`, {
                    row: trace?.parser.row,
                    code: trace?.parser.code || `@subprogram ${args[0]}:`,
                    select: args[0],
                    position: 'end'
                });
    
                process.exit(1);
            }
        }

        if (this.$cmp == false && this.$arg0 == 'jmp_zero') labelExecute(this, args[0]);
        if (this.$eq == true && this.$arg0 == 'jmp_equal') labelExecute(this, args[0]);
        if (this.$eq == false && this.$arg0 == 'jmp_ne') labelExecute(this, args[0]);
        if (this.$cmp == true && this.$arg0 == 'jmp_great') labelExecute(this, args[0]);
        if (this.$arg0 == 'goto') labelExecute(this, args[0]);

        if (this.$arg0 == 'goto_env') {
            try {
                let enviroment = this.enviroments.filter(enviroment => Reflect.ownKeys(enviroment)[0] == args[0]);
                new Compiler(Parser.parse(enviroment[0][args[0]].join('\n')));
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

        if (this.$arg0 == 'goto_sbp') SubprogramExecute(this, args[0]);
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

                            if (Type.check('String', stuff)) stuff = stuff.slice(1, -1);

                            const constexpr = (
                                Array.isArray(stuff) ||
                                Type.check('String', stuff) ||
                                stuff instanceof List
                            );
                            
                            if (constexpr) this.$get = stuff.slice(1, -1)[this.checkArgument(tokens[2]) || +tokens[2]];
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
        this.$arg0 = this.checkArgument(statement.args[0], trace?.parser?.code, trace?.parser.row) || statement.args[0];
        this.$stack.push(this.$arg0);
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
    }


    /**
     * The function above is used to unset a variable.
     * @param statement - The statement object.
     */
    compileUnsetStatement(statement, index, trace) {
        this.$arg0 = this.checkArgument(statement.model, trace?.parser.code, trace?.parser.row) || statement.model;
        
        if (this.$arg0 == 'mem') {
            Memory.unset();
            MemoryVariables.unsett();
            MemoryAddress.unset();
        }   else if (this.$arg0 == '$offset') this.$offset = 0x00
            else if (this.$arg0 == '$text')  this.$text = ''
            else if (this.$arg0 == '$sp') this.$sp = 0x00
            else if (this.$arg0 == '$get') this.$get = 0x00, this.$list['$get'] = []
            else if (this.$arg0 == '$urt') this.$urt = 0x00, this.$list['$urt'] = [];
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

        if (this.constants.length > 0 && this.constants.findIndex(cell => cell.name == this.$name) > -1) {
           //new ConstException(`[${Color.FG_RED}ConstException${Color.FG_WHITE}]: you have this define name`, { ...trace['parser'] });
          //  process.exit(1);
        } else {
            this.constants.push({ name: this.$name, type: this.$arg1, value: this.$arg2 });
        }
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

        if (unitCall.has(statement.name)) {
            // let argsMap = unitCall.getArgumentsHashMap(statement.name, statement.args.slice(1, -1), options);
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
            this.$urt = this.checkArgument(statement.arg, trace?.parser?.code, trace?.parser.row) || this.$ret || 0x00;
        }
    }


    /**
     * It's a function that compiles a statement that invokes a function
     * @param statement - The statement that is being compiled.
     */
    compileInvokeStatement(statement, index, trace) {
        this.$arg0 = this.checkArgument(statement.address, trace?.parser?.code, trace?.parser.row) || statement.address;

        // write
        if (this.$arg0 == 0x04) {
            try {
                let string = JSON.parse(`{ "String": "${this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value}" }`)['String'];
                FlowOutput.createOutputStream(string);
            } catch {
                FlowOutput.createOutputStream(this.$stack.list[this.$stack.sp + this.$offset - 1]?.value || this.$stack.list[this.$stack.sp - 1]?.value);
            }
        }
        // exit
        if (this.$arg0 == 0x01) process.exit(0);
        
        // read
        if (this.$arg0 == 0x03) {
            this.$arg0 = this.$input = FlowInput.createInputStream(this.$text);
            this.$list['$input'].push(this.$input);
            this.$stack.push({ value: this.$arg0 });
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
        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        for (let i = 0, l = statement.args.length; i < l; i++) statement.args[i] = +this[`$arg${i}`];
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = 0x00;
        for (let index = 0; index < statement.args.length; index++) this.$ret += this[`$arg${[index]}`];
        this.$stack.push({ value: this.$ret });
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
        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret -= this[`$arg${[index]}`];
        this.$stack.push({ value: this.$ret });
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
        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret /= this[`$arg${[index]}`];
        this.$stack.push({ value: this.$ret });
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
        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = this.$arg0;
        for (let index = 1; index < statement.args.length; index++) this.$ret %= this[`$arg${[index]}`];
        this.$stack.push({ value: this.$ret });
    }


    /**
     * This function compiles an imul statement in JavaScript by checking the type of arguments and
     * multiplying them together.
     * @param statement - The statement object that contains information about the "imul" statement
     * being compiled, such as the name of the statement and its arguments.
     * @param index - The index parameter in the function `compileImulStatement` is used as a loop
     * counter to iterate over the arguments passed to the function. It is not used for any other
     * purpose within the function.
     * @param trace - The `trace` parameter is an optional object that contains information about the
     * current execution context, such as the code being executed and the current row in the code. It
     * is used to provide more detailed error messages and debugging information.
     */
    compileImulStatement(statement, index, trace) {
        this.compilerAllArguments(statement, 'Int', trace?.parser?.code, trace?.parser.row);
        this.checkTypeArguments(statement.args, trace, ValidatorByType.validateTypeNumber);
        this.$ret = 1;
        for (let index = 0; index < statement.args.length; index++) this.$ret *= this[`$arg${[index]}`];
        this.$stack.push({ value: this.$ret });
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
            this.$arg0 = this.checkArgument(statement.name, trace?.parser?.code, trace?.parser.row);
            if (Type.check('String', this.$arg0)) this.$arg0 = this.$arg0.slice(1, -1);
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

        if (this.checkArgument(forReplace.name) != undefined || this.checkArgument(forReplace.value) != undefined) {
            isType = true;
        }

        if (statement.type == 'Auto') {
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
        
        if (this.set.length > 0 && this.set.findIndex(cell => cell.name == this.$name) > -1) {
            this.set = this.set.filter(cell => cell.name !== this.$name).push({ name: this.$name, type: this.$arg1, value: this.$arg2 });
        } else {
            this.set.push({ name: this.$name, type: this.$arg1, value: this.$arg2 });
        }
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

            // for (const key in $al) {
                //if (Object.hasOwnProperty.call($al, key)) {
                    // if (new RegExp(`\[${key}\]`).test(arg)) {
                    //     console.log('key: ', strict);
                    //     if (strict == true)  {
                    //         if (key == arg.slice(1, -1)) $edx = $al[key];
                    //     // }
                    //         break;
                    //     } else {
                    //        $edx = $al[key];
                    //     }
                    // }

                    $edx = $al[arg.slice(1, -1)];
              // }
            // }

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
            return $edx;
        }

        /* Checking if the argument is a variable, constant, or a unit. */  
        if (/\[[_a-zA-Z][_a-zA-Z0-9]{0,30}\]/.test(arg)) return checkArgumentsUnit(arg);
        if (/\[[_a-zA-Z][_a-zA-Z0-9]{0,30}\]/.test(arg)) return checkVariable(arg);
        if (/^[A-Z]+(_[A-Z]+)*$/.test(arg)) return checkConstant(arg);

        if (typeof arg !== 'number' && arg.indexOf('::') > -1) {
            this.compileGetStatement({ args: arg }, 0, {
                parser: { row: row, code: code }
            });

            return this.$get;
        }

        if (/\$\w+/.test(arg)) {
            if (Reflect.has(this, `${arg}`)){
                return this[`${arg}`];
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
                process.exit(1);
            }
        }
    }
}

module.exports = Compiler;