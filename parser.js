
// Importing exceptions
const { 
  TypeError, // Exception for type errors
  SymbolError, // Exception for symbol errors
  SyntaxError, // Exception for syntax errors
  CodeStyleException, // Exception for code style violations
  InstructionException, // Exception for instruction errors
  StructureException, // Exception for structure errors
  ArgumentError, // Exception for argument errors
  SystemCallException // Exception for system call errors
} = require("./exception");

const ValidatorByType = require("./checker"); // Importing type validator
const Lexer = require("./lexer"); // Importing lexer
const ServerLog = require("./server/log"); // Importing server log
const Structure = require("./structure"); // Importing structure
const NeuralNetwork = require("./tools/neural"); // Importing neural network
const Color = require("./utils/color"); // Importing color utility
const Engine = require("./engine/core"); // Importing engine core
const config = require("./config"); // Importing configuration
const engine = require("./engine/core"); // Importing engine core

class Parser {
    /**
     * Parses the given source code.
     *
     * @param {string} sourceCode - The source code to be parsed.
     * @return {Array} An array of tokens representing the parsed source code.
     */
    static parse(sourceCode) {
        let lines = sourceCode.split('\n');
        let tokens = [];
        let newLines = [];
        let isInterpreteProccess = { state: true };
        lines = lines.map(line => line.trim());
        lines = lines.map(line => line.indexOf(';') >= 0 ? line.split(';').filter(l => l.trim() != '') : line);

        lines.forEach((line, index) => {
            if (this.parseAndDeleteEmptyCharacters(line) != '') {
                let parsed = this.parseAndDeleteEmptyCharacters(line);
                
                if (parsed.endsWith(',')) {
                    new SyntaxError(`<source:${index+1}:${parsed.lastIndexOf(',')+1}>  Invalid character`, {
                        select: ',',
                        row: index,
                        code: line,
                        position: 'end'
                    });

                    if (lines.length-1 == index) {
                        ServerLog.log('The end of the file, delete the last character or add more arguments to this instruction.', 'Possible fixes');
                        process.exit(1);
                    }

                    if (lines[index+1] == '' || /^\@\w+/.test(lines[index+1])) {
                        ServerLog.log('You may need to supplement this instruction or delete this symbol.', 'Possible fixes');
                        process.exit(1);
                    }
                }
            }

            if (Array.isArray(line))
                for (let idx = 0, len = line.length; idx < len; idx++) newLines.push(line[idx]);
            else
                newLines.push(line);
        });

        lines = newLines;
        // console.log(lines);

        ParserCycle: for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
          //  line.indexOf('#') === 0 ? instructions.push(line) : false;
          //  line.indexOf('#') >= 0  ? instructions.push(line.substring(0, line.indexOf('#'))) : false;

           if (line.length === 0) continue;

            if (isInterpreteProccess.state && Structure.is(line)){
                isInterpreteProccess.state = false;
                let structureName = Structure.getNameByLine(line.trim())[1];
                let structureBody = [];
                let fixedLine = index;

                StructureCycle: for (let idx = fixedLine, len = lines.length, iterator = 0; idx < len; idx++, iterator++) {
                    let lineStructure = lines[idx].trim();
                    Structure.isParse(structureName) && this.parseAndDeleteEmptyCharacters(lineStructure) != '' && this.parseStatement(lineStructure, idx);
                    let structureNameByLine = Structure.getNameByLine(lineStructure);
                    if (structureNameByLine != null) structureNameByLine = structureNameByLine[1];
                    if (iterator > 0 && structureNameByLine == structureName) StructureException.NestedStructureException(structureName, lineStructure, idx);
                    if (iterator > 0 && Structure.is(lineStructure)) StructureException.NestedStructureInStructureException(structureName, structureNameByLine, lineStructure, idx);
                    if (lineStructure.length === 0) break StructureCycle;
                    else structureBody.push(lineStructure), lines[idx] = '';
                }

                if (structureBody.length === 1) StructureException.EmptyStructureException(structureName, structureBody[0], fixedLine);
                structureName = structureName[0].toLowerCase() + structureName.slice(1);
                tokens.push({ [structureName]: structureBody, parser: { row: index + 1 } });
                isInterpreteProccess.state = true;
                continue;
            } else if (isInterpreteProccess.state) {
                this.parseAndDeleteEmptyCharacters(line) != '' && tokens.push(this.parseStatement(line, index));
            }
        }

        return tokens;
    }


    /**
     * The function `parseBindStatement` takes a line of code and row number as input, and returns an
     * abstract syntax tree (AST) object representing a bind statement in JavaScript.
     * @param line - The `line` parameter represents a string of code that contains a bind statement.
     * It is the line of code that needs to be parsed.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns an object with the properties `bind` and `parser`. The `bind` property is an object
     * with the properties `bind` and `name`. The `parser` property is an object with the property
     * `code` and `row`.
     */
    static parseBindStatement(line, row) {
        let ast = { bind: {}, parser: { code: line, row: row + 1} };
        line = line.slice(line.indexOf(' ')).trim();
        ast.bind.bind = line.slice(0, line.indexOf(' '));
        line = line.slice(line.indexOf(' ')).trim();
        ast.bind.name = line;
        return ast;
    }


    /**
     * The function `parseMethodStatement` parses a method statement in JavaScript and returns an
     * abstract syntax tree (AST) object.
     * @param line - The `line` parameter is a string that represents a line of code containing a
     * method declaration.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns The function `parseMethodStatement` returns an object `ast` which contains two
     * properties: `method` and `parser`. The `method` property is an object that contains the name of
     * the method and its arguments. The `parser` property is an object that contains the code and row
     * number.
     */
    static parseMethodStatement(line, row) {
        let ast = { method: {}, parser: { code: line, row: row + 1 } };
        let pattern = /\@[Mm]ethod\s+(\w+)\b(\s+)?\((.+)?\)(\:)?$/;
        let matches = pattern.exec(line).filter(t => t).slice(1);
        ast.method.name = matches[0];
        ast.method.arguments = matches[1] == ':' || matches[1] == undefined ? false : matches[1];
        return ast;
    }


    /**
     * The function `parseConstructorStatement` parses a constructor statement in JavaScript and
     * returns an abstract syntax tree (AST) representing the constructor.
     * @param line - The `line` parameter represents a line of code that contains a constructor
     * statement in a programming language.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns The function `parseConstructorStatement` returns an abstract syntax tree (AST) object.
     */
    static parseConstructorStatement(line , row) {
        let ast = { constructor: {}, parser: { code: line, row: row + 1 } };
        let pattern = /\@[Cc]onstructor\s+(\w+)\b(\s+)?\((.+)\)(\:)?$/;
        let matches = pattern.exec(line)?.filter(t => t).slice(1);

        if (matches) {
            ast.constructor.name = matches[0];
            ast.constructor.arguments = matches[1];
        }  else {
            new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: Invalid grammar.`, {
                code: line,
                row: row,
                select: line
            });
            process.exit(1);
        }

        return ast;
    }


    /**
     * The function `parseDestructorStatement` parses a destructor statement in JavaScript code and
     * returns an abstract syntax tree (AST) representation of the statement.
     * @param line - The `line` parameter represents a line of code that contains a destructor
     * statement. It is a string.
     * @param row - The `row` parameter represents the line number of the code statement being parsed.
     * @returns The function `parseDestructorStatement` returns an abstract syntax tree (AST) object.
     */
    static parseDestructorStatement(line, row) {
        let ast = { destructor: {}, parser: { code: line, row: row + 1 } };
        let pattern = /\@[Dd]estructor\s+(\w+)\b(\s+)?\((.+)?\)\:?$/;
        let matches = pattern.exec(line)?.filter(t => t).slice(1);

        if (matches) {
            ast.destructor.name = matches[0];
            ast.destructor.arguments = matches[1] || false;
        } else {
            new SystemCallException(`[${Color.FG_YELLOW}${process.argv[2].replaceAll('\\', '/')}${Color.FG_WHITE}][${Color.FG_RED}ClassException${Color.FG_WHITE}]: Invalid grammar.`, {
                code: line,
                row: row,
                select: line
            });
            process.exit(1);
        }

        return ast;
    }


    /**
     * The function `_parseConstructorArguments` parses constructor arguments in a given line of code
     * and returns an abstract syntax tree (AST) representation of the arguments.
     * @param line - The `line` parameter is a string that represents a line of code containing
     * constructor arguments.
     * @param row - The `row` parameter is not used in the code snippet provided. It is not necessary
     * for the functionality of the `_parseConstructorArguments` function.
     * @returns an object with a property called "arguments". The value of "arguments" is an object
     * where the keys are the argument names and the values are the argument types.
     */
    static _parseConstructorArguments(line, row) {
        let ast = { arguments: {} };
        line = line.trim().replaceAll('  ', ' ');
        let args = line.split(',').map( t => t.trim());

        for (const arg of args) {
            if (arg.indexOf(' ') == -1) ast.arguments[arg] = 'Any';
    
            else if (arg.indexOf(' ') > -1) {
                const [type, name] = arg.split(' ').filter(t => t !== '');
                ast.arguments[name] = type;
            }
        }

        return ast;
    }


    /**
    * The function parses a statement in a given line of code and returns an abstract syntax tree.
    * @param line - The current line of code being parsed as a string.
    * @param index - The index parameter is the line number or index of the current line being parsed
    * in the code. It is used to provide context in case of syntax errors or other issues during
    * parsing.
    * @returns The function `parseStatement` is returning an abstract syntax tree (AST) for a given
    * statement in the input `line`. The type of statement is determined by parsing the string and
    * checking if it is a valid statement. If it is a valid statement, the corresponding
    * `parse<Statement>` function is called to generate the AST. If it is not a valid statement, a
    * `SyntaxError` is
    */
    static parseStatement(line, index){
        let stmt;

        line.trim().indexOf(' ') > -1 ?
            stmt = this.parseAndDeleteEmptyCharacters(line).substring(line.indexOf('@') + 1, line.indexOf(' '))
            : stmt = line.substring(1);

        // stmt = stmt[0].toUpperCase() + stmt.substring(1);

        // Experemental mode
        if (line !== '' && stmt.substring(1) == stmt.substring(1).toUpperCase()) {
            if (stmt[0] == stmt[0].toUpperCase() && stmt.substring(1) == stmt.substring(1).toUpperCase()) stmt = stmt[0].toUpperCase() + stmt.substring(1).toLowerCase();
            line = `@${stmt} ${line.slice(line.indexOf(' '))}`;
        } else {
            stmt = stmt[0].toUpperCase() + stmt.substring(1);
        }
        //

        let ast;

        if (this.isStatement(stmt)) {
           ast = this[`parse${stmt}Statement`](line, index);
        } else {
            if (config.INI_VARIABLES.MAJOR_ENGINE !== '') {
                try {
                    stmt = stmt.toLowerCase();
                    const userEngine = require(config.INI_VARIABLES.MAJOR_ENGINE);

                    if (Reflect.ownKeys(userEngine).includes('registerInstruction')) {
                        userEngine['registerInstruction'](engine);
                    }
                } catch {}
            }

            if (config.INI_VARIABLES.CHECK_ENGINE !== '') {
                try {
                    stmt = stmt.toLowerCase();
                    const userEngine = require(config.INI_VARIABLES.CHECK_ENGINE);

                    if (Reflect.ownKeys(userEngine).includes('registerInstruction')) {
                        userEngine['registerInstruction'](engine);
                    }
                } catch {}
            }

            if (engine.hasInstruction(stmt)) {
                ast = { [stmt]: { arguments: line.slice(line.indexOf(' ')) }, parser: { code: line, row: index + 1 } }; 
            } else {
                // Log the error message and type
                ServerLog.log('This instruction does not exist', 'Exception');
                
                // Throw a SyntaxError with the error message and metadata
                new SyntaxError(`\n<source:${index+1}:1>  This instruction does not exist`, { code: line, row: index });
                
                // Log a message indicating the need to remove the instruction
                ServerLog.log('You need to remove this instruction.', 'Possible fixes');

                // Get an array of instruction names using reflection
                const instructions = Reflect.ownKeys(this).filter(property => /parse\w+Statement/.test(property)).map(token => /parse(\w+)Statement/.exec(token)).map(list => list[1]);
                
                // Calculate the coincidences between the instructions and stmt
                const coincidences = NeuralNetwork.coincidence(instructions, stmt);
                
                // Use the NeuralNetwork to determine the most likely instructions
                const presumably = NeuralNetwork.presumably(coincidences);
                
                // Log the suggested instructions
                ServerLog.log(`Perhaps you wanted to write some of these instructions: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');

                process.exit(1);
            }
        }

        return ast;
    }


    /**
     * The function checks if a given statement is valid by checking if there is a corresponding
     * parsing function for it.
     * @param stmt - stmt is a parameter that represents a statement in a programming language.
     * @returns The function `isStatement` is returning a boolean value that indicates whether the
     * object that the function is called on has a method with a name that matches the string passed as
     * an argument to the function with the prefix "parse" and suffix "Statement".
     */
    static isStatement(stmt) {
        return Reflect.has(this, `parse${stmt}Statement`);
    }


    /**
     * The function parses a define statement in JavaScript and returns a small abstract syntax tree.
     * @param lineCode - a string representing a line of code that contains a define statement
     * @param row - The row number where the code is located in the source file.
     * @returns The function `parseDefineStatement` returns either a small abstract syntax tree object
     * containing the name and value of the defined constant, or the string 'rejected' if the input
     * line of code does not meet certain criteria.
     */
    static parseDefineStatement(lineCode, row, pattern){
        let ast = { define: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const instructionPattern = pattern || /^@[d|D]efine\s+([\w-]+)\s+(.+)$/;
        const match = instructionPattern.exec(lineCode);
        
        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: originalLine
            });

            if (match == null && (lineCode.indexOf("'") > -1 || lineCode.indexOf('"') > -1)) {
                ServerLog.log('You are not allowed to use a quotation mark near the instruction or the name of the constant', 'Possible fixes');
            }

            process.exit(1);
        }
        
        if (!/^[A-Z]+(_[A-Z]+)*$/.test(match[1]) && !/[0-9]*$/.test(match[1])) {
            new CodeStyleException('Invalid constant name style', {
                row: row, code: originalLine, select: match[1]
            });

            ServerLog.log('You need to write the name of the constant in the SNAKE_UPPER_CASE style', 'Possible fixes');

            if (match[1].startsWith('_') || match[1].endsWith('_')) {
                ServerLog.log('You are not allowed to use underscores at the beginning or end of the constant name', 'Possible fixes');
            }

            process.exit(1);
        }

        let value = match[2];
        Lexer.lexer(value, { row: row, code: originalLine });
        ast['define']['name'] = match[1];
        ast['define']['value'] = value;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the alias of the imported module
     * @param lineCode - The line of code that is being parsed.
     * @returns an object.
     */
    static parseImportStatement(lineCode, row){
        let ast = { import: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, Alias] = lineCode.split(' ');
        if (!ValidatorByType.validateTypeIdentifier(Alias)) Lexer.lexer(Alias, { code: originalLine, row: row + 1 });

        if (lineCode.split(' ').length > 2) {
            process.exit(1);
        }

        if (Alias == undefined) { process.stdout.write('Alias not defined'); return 'rejected'; }
        else  ast['import']['alias'] = Alias;
        ast['import']['linecode'] = lineCode;
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part
     * @param lineCode - The line of code that is being parsed.
     * @returns a small abstract syntax tree.
     */
    static parseRetStatement(lineCode, row){
        let ast = { ret: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args,ast.parser, [1, 1]);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        ast['ret']['arg'] = args[0];
        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'add' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseEqualStatement(lineCode, row) {
        let ast = { equal: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['equal']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the name of the function and the arguments
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseCallStatement(lineCode, row){
        let ast = { call: {}, parser: { code: lineCode, row: row } };
        // let tokens = /\@[c|C]all\s+(\w+)\(([^]+)?\)/.exec(lineCode);
        let tokens;

        if ((tokens = /\@[Cc]all\s+javascript\.(\w+)\.(\w+)\(([^]+)?\)/.exec(lineCode))) {
            ast['call']['javascript'] = true;
            ast['call']['module'] = tokens[1].trim();
            ast['call']['name'] = tokens[2].trim();
            ast['call']['args'] = tokens[3] == undefined ? '()' : tokens[3].trim();
            tokens = true;
        }

        else if ((tokens = /\@[Cc]all\s+(\w+)\:\:(\w+)\(([^]+)?\)/.exec(lineCode))) {
            ast['call']['structure'] = tokens[1].trim();
            ast['call']['name'] = tokens[2].trim();
            ast['call']['args'] = tokens[3] == undefined ? '()' : tokens[3].trim();
            tokens = true;
        }

        else if ((tokens = /\@[Cc]all\s+(\w+)\:\:(\w+)\:\:(\w+)\(([^]+)?\)/.exec(lineCode))) {
            ast['call']['structure'] = tokens[1].trim();
            ast['call']['name'] = tokens[2].trim();
            ast['call']['method'] = tokens[3].trim();
            ast['call']['args'] = tokens[4] == undefined ? '()' : tokens[4].trim();
            tokens = true;
        }

        else if ((tokens = /\@[Cc]all\s+(\w+)\-\>(\w+)\(([^]+)?\)/.exec(lineCode))) {
            ast['call']['class'] = tokens[1].trim();
            ast['call']['method'] = tokens[2].trim();
            ast['call']['args'] = tokens[3] == undefined ? '()' : tokens[3].trim();
            tokens = true;
        }
        
        else if ((tokens = /\@[c|C]all\s+(\w+)\(([^]+)?\)/.exec(lineCode))) {
            ast['call']['name'] = tokens[1].trim();
            ast['call']['args'] = tokens[2] == undefined ? '()' : tokens[2].trim();
        }
        
        else {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]: Invalid grammar`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        } 

        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns an object.
     */
    static parseAddStatement(lineCode, row){
        let ast = { add: {}, parser: { code: lineCode, row: row  } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['add']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the sub statement and its arguments.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'sub' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseSubStatement(lineCode, row){
        let ast = { sub: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['sub']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and then validates each argument
     * @param lineCode - the line of code that is being parsed
     * @returns A small abstract syntax tree.
     */
    static parseDivStatement(lineCode, row) {
        let ast = { div: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['div']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code, splits it into arguments, and then validates each argument.
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseModStatement(lineCode, row) {
        let ast = { mod: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['mod']['args'] = args;
        return ast;
    }
    

    /**
     * It takes a line of code, splits it into an array of arguments, and then validates each argument.
     * @param lineCode - the line of code that is being parsed
     * @returns an object.
     */
    static parseMulStatement(lineCode, row){
        let ast = { mul: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['mul']['args'] = args;
        return ast;
    }


    /**
     * The function parses a route statement and returns an abstract syntax tree object containing the
     * route name and address.
     * @param lineCode - a string representing a line of code to be parsed and processed.
     * @param row - The row number of the code being parsed.
     * @returns either an object representing the parsed route statement or the string 'rejected' if
     * the statement is invalid.
     */
    static parseRouteStatement(lineCode, row){
        let ast = { route: {}, parser: { row, code: lineCode } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 3) return 'rejected';
        const [, RouteName, RouteAddress] = lineCode.split(' ');

        if (RouteAddress && !ValidatorByType.validateTypeHex(RouteAddress)) {
            new TypeError(lineCode, RouteAddress);
            return 'rejected';
        }

        ast['route']['name'] = RouteName;
        ast['route']['address'] = RouteAddress;
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part.
     * @param lineCode - the line of code that is being parsed
     * @returns an object with a key of 'stack' and a value of an object with a key of 'address' and a
     * value of the stack address.
     */
    static parseStackStatement(lineCode, row){
        let ast = { stack: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, StackAddress] = lineCode.split(' ');
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(StackAddress)) {
            new TypeError(lineCode, StackAddress);
            return 'rejected';
        }

        ast['stack']['address'] = StackAddress;
        return ast;
    }


    /**
     * It takes a string, splits it into two parts, and returns an object with the two parts as
     * properties.
     * @param lineCode - The line of code that is being parsed
     * @returns An array of objects.
     */
    static parseIssueStatement(lineCode, row){
        let ast = { issue: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        if (lineCode.split(' ').length > 2) return 'rejected';
        const [, IssueStatus] = lineCode.split(' ');
        Lexer.lexerBool(lineCode, IssueStatus);
        ast['issue']['state'] = IssueStatus || 'on';
        return ast;
    }


    /**
     * It takes a string and replaces all the empty characters with a single space.
     * @param lineCode - The line of code that is being parsed.
     * @returns The line of code with all the empty characters removed.
     */
    static parseAndDeleteEmptyCharacters(lineCode){
        if (Array.isArray(lineCode)) lineCode = lineCode.filter(code => code.trim() != ''),
            lineCode = lineCode[0];
        else
            lineCode = lineCode.replace(/\s+/g, ' ').trim();
        return  lineCode.substring(0, lineCode.indexOf('#') >= 0 ? lineCode.indexOf('#') -1 : lineCode.length);
    }


    /**
     * It takes a line of code, splits it into an array, and then assigns the values of the array to a
     * JSON object.
     * </code>
     * @param lineCode - The line of code that is being parsed.
     * @returns An array of objects.
     */
    static parseSetStatement(lineCode, row, pattern){
        let ast = { set: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const instructionPattern = pattern || /^@[s|S]et\s+([^-]+)?\s+([\w-]+)(<(\s+?)?\w+.+?(\s+)?\w+(\s+)?>)?\s+?(.+)$/;
        let match = instructionPattern.exec(lineCode);
        
        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: originalLine
            });
            
            process.exit(1);
        }

        if (/^[A-Z]+(_[A-Z]+)*$/.test(match[1])) ServerLog.log('For better readability, it is better not to make the variable name in the SNAKE_UPPER_CASE style, since basically this style is used only in constant names.', 'Warning');
        match = match.filter(lexem => lexem !== undefined).filter(lexem => lexem != ' ');

        if (match.length == 5) { 
            ast['set']['generics'] = match[3];
            ast['set']['value'] = match[4];
        } else ast['set']['value'] = match[3];

        ast['set']['name'] = match[1];
        ast['set']['type'] = match[2];
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and then returns an object with the two parts
     * as properties.
     * @param lineCode - The line of code that is being parsed.
     * @returns An array of objects.
     */
    static parseInvokeStatement(lineCode, row){
        let ast = { invoke: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, InvokeAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        // if (!/^[A-Z]+(_[A-Z]+)*$/.test(InvokeAddress) || !ValidatorByType.validateTypeHex(InvokeAddress)) {
        //     new TypeError(lineCode, InvokeAddress);
        //     return 'rejected';
        // }

        if (typeof InvokeAddress == 'undefined') console.error('[AsmX]: Invoke address not found');
        else  ast['invoke']['address'] = InvokeAddress;
        return ast;
    }


    /**
     * The function `parseMemoryStatement` parses a line of code to extract the memory value and
     * address, performs validation checks, and returns an object containing the memory name and
     * address.
     * @param lineCode - The `lineCode` parameter is a string that represents a line of code.
     * @returns either the string 'rejected' or an object with the properties 'memory' containing the
     * 'name' and 'address' values.
     */
    static parseMemoryStatement(lineCode){
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, memoryValue, memoryAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 3) return 'rejected';

        if (!ValidatorByType.validateTypeHex(memoryAddress)) {
            new TypeError(lineCode, memoryAddress);
            return 'rejected';
        }

        Lexer.lexerMemoryAddress(lineCode, memoryAddress);
        return { memory: { name: memoryValue, address: memoryAddress } };
    }
    
        
    /**
     * It takes a string, finds the first and last parentheses, and returns an object with the string
     * between the parentheses as the ref property and the string after the last parentheses as the
     * addressVal property.
     * @param lineCode - The line of code that is being parsed.
     * @returns An object with two properties: ref and addressVal.
     */
    static parseAddressStatement(lineCode){
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);

        if (lineCode.indexOf('(')  !== -1 && lineCode.indexOf(')') !== -1){
            const addressName = lineCode.substring(lineCode.indexOf('('), lineCode.lastIndexOf(')')).trim();
            const address = lineCode.substring(lineCode.lastIndexOf(')')).trim();
            return { address: { name: addressName, address: address } };
        } else {
            const [addressToken, address, addressName] = lineCode.split(' ');
            return { address: { name: addressName, address: address } };
        }
    }


    /**
     * It takes a string of arguments and returns an object with the argument index as the key and the
     * argument type as the value
     * @param args - The arguments that are passed to the function.
     * @returns An object with the index of the argument as the key and the type of the argument as the
     * value.
     */
    static parseTypesArgumentsUnit(args) {
        args = args.trim().split(",");
        let argsRules = {};
        let argsTypes = [];
        for (let index = 0; index < args.length; index++) argsTypes.push(args[index].split(':'));
        for (let index = 0; index < argsTypes.length; index++) argsRules[index] =  argsTypes[index][1] != undefined ? argsTypes[index][1].trim() : 'Any';
        return argsRules;
    }


    /**
     * It takes a string of arguments, splits them into an array, splits each argument into a key and
     * value, and returns an array of the keys
     * @param args - The arguments that are passed to the function.
     * @returns An array of strings.
     */
    static parseNamesArgumentsUnit(args) {
        args = args.trim().split(",");
        let argsParse = [];
        let argsNames = [];
        for (let index = 0; index < args.length; index++) argsParse.push(args[index].split(':'));
        for (let index = 0; index < argsParse.length; index++) argsNames.push(argsParse[index][0].trim());
        return argsNames;
    }


    /**
     * It takes a string, and returns an array of three strings.
     * @param lineCode - the line of code that is being parsed
     * @returns An array of three elements.
     */
    static parseUnitStatement(lineCode, row){
        let ast = { unit: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: false, operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        const unitName = lineCode.substring(lineCode.indexOf(' ') + 1, lineCode.indexOf('(')).trim();
        const unitArguments = lineCode.substring(lineCode.indexOf('('), lineCode.indexOf(')') + 1);
        const argsRules = this.parseTypesArgumentsUnit(unitArguments.slice(1, -1));
        const argsNames = this.parseNamesArgumentsUnit(unitArguments.slice(1, -1));

        if (!/[a-zA-Z0-9_]*/.test(unitName)) {
            new ArgumentError(`[${Color.FG_RED}ArgumentException${Color.FG_WHITE}]: Invalid spelling of the function name.`, {
                ...ast['parser'],
                select: unitName
            });

            process.exit(1);
        }

        for (const arg of argsNames) {
            if (!/[a-zA-Z0-9_]*/.test(arg)) {
                new ArgumentError(`[${Color.FG_RED}ArgumentException${Color.FG_WHITE}]: Invalid spelling of the function argument name.`, {
                    ...ast['parser'],
                    select: arg
                });
    
                process.exit(1);
            }    
        }

        ast['unit']['name'] = unitName;
        ast['unit']['args'] = unitArguments;
        ast['unit']['argsnames'] = argsNames;
        ast['unit']['rules'] = { ...argsRules };
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and then checks if the second part is a valid
     * hexadecimal number. If it is, it returns an object with the second part as a property. If it
     * isn't, it returns 'rejected'
     * @param lineCode - The line of code that is being parsed.
     * @returns An object with a key of 'offset' and a value of an object with a key of 'address' and a
     * value of the address.
     */
    static parseOffsetStatement(lineCode, row){
        let ast = { offset: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        const [, OffsetAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(InvokeAddress)) {
            new TypeError(lineCode, InvokeAddress);
            return 'rejected';
        }

        if (typeof OffsetAddress == 'undefined') console.error('[AsmX]: address not found');
        else  ast['offset']['value'] = OffsetAddress;
        return ast;
    }


    /**
     * It takes a line of code, and returns an object with the model name
     * @param lineCode - The line of code that is being parsed.
     * @returns an object.
     */
    static parseUnsetStatement(lineCode, row){
        let ast = { unset: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        const [, UnsetModel] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';
        if (typeof UnsetModel == 'undefined') console.error('[AsmX]: model not defined');
        ast['unset']['model'] = UnsetModel;
        return ast;
    }


    /**
     * The function parses and returns a small abstract syntax tree for a modify statement in
     * JavaScript.
     * @param lineCode - a string representing a line of code that contains a modify statement.
     * @returns either a rejected string if the first element of the commandArray is not '@Modify', or
     * a small abstract syntax tree object with the 'modify' key containing a nested object with
     * 'model' and 'value' keys.
     */
    static parseModifyStatement(lineCode, row){
        let ast = { modify: {}, parser: { code: lineCode, row: row } };
        const commandArray = lineCode.trim().split(/\s+/);
        const registerName = commandArray[1];
        const value = commandArray.slice(2).join(' ');
        ast['modify']['model'] = registerName;
        ast['modify']['value'] = value;
        return ast;
    }


    /**
     * It takes a string, splits it into an array, then maps the array to a new array, then returns the
     * new array.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of execute and a value of an object with a key of args and a value
     * of an array of strings.
     */
    static parseExecuteStatement(lineCode, row){
        let ast = { execute: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 7) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validateTypeHex(arg));
        ast['execute']['cmd'] = args[1];
        ast['execute']['args'] = args.slice(2);
        return ast;
    }


    /**
     * It takes a line of code, and returns an object that represents the line of code.
     * 
     * The line of code is a string. The object is a JavaScript object.
     * 
     * The line of code is a line of code in a programming language called "POP". The object is an
     * abstract syntax tree for the line of code.
     * 
     * The line of code is a line of code in a programming language called
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parsePopStatement(lineCode, row) {
        let ast = { pop: {}, parser: { code: lineCode , row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [0, 0]);
        return ast;
    }


    /**
     * It takes a line of code and returns an object that represents the line of code.
     *
     * The function is called parsePushStatement. It takes a line of code as an argument. It returns an
     * object that represents the line of code.
     * 
     * The function is called parsePushStatement. It
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parsePushStatement(lineCode, row) {
        let ast = { push: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 2]);
        ast['push']['args'] = args;
        return ast;
    }


    /**
     * The function parses a "get" statement in JavaScript code and returns an abstract syntax tree
     * (AST) object with the arguments.
     * @param lineCode - The parameter `lineCode` is a string representing a line of code that contains
     * a "get" statement. The method `parseGetStatement` parses this line of code and returns an
     * abstract syntax tree (AST) object representing the "get" statement.
     * @returns If the length of the split lineCode is greater than 2, the function returns 'rejected'.
     * Otherwise, it returns an AST (Abstract Syntax Tree) object with a 'get' property containing an
     * 'args' property that holds the second element of the split lineCode.
     */
    static parseGetStatement(lineCode, row) {
        let ast = { get: {}, parser: { code: lineCode, row: row }  };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'], brackets: ['{', '}', '(', ')'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [1, 1]);
        ast['get']['args'] = args[0];
        return ast;
    }


    /**
     * This function parses a label statement in JavaScript code and returns an abstract syntax tree
     * (AST) object containing information about the label.
     * @param lineCode - The code for a single line of a program.
     * @param row - The row number of the line of code being parsed.
     * @returns an object with a "label" property that contains a "name" property and a "parser"
     * property that contains a "code" and "row" property. If the input line of code is invalid or does
     * not contain the expected label syntax, the function returns the string "rejected".
     */
    static parseLabelStatement(lineCode, row) {
        let ast = { label: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[L|l]abel\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['label']['name'] = match[1];
        return ast;
    }


    /**
     * This function parses an environment statement in JavaScript code and returns an abstract syntax
     * tree (AST) object.
     * @param lineCode - a string representing a line of code to be parsed as an environment statement
     * @param row - The line number or row in the code where the statement is located.
     * @returns an object with the parsed environment statement, which includes the environment name
     * and parser information. If the input line of code is invalid or missing required arguments, the
     * function will return the string 'rejected'.
     */
    static parseEnviromentStatement(lineCode, row) {
        let ast = { enviroment: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[E|e]nviroment\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['enviroment']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseSubprogramStatement` parses a subprogram statement in JavaScript and returns
     * an abstract syntax tree (AST) representing the parsed statement.
     * @param lineCode - The `lineCode` parameter is a string that represents a line of code in a
     * programming language. It is the code that needs to be parsed and analyzed.
     * @param row - The `row` parameter in the `parseSubprogramStatement` function represents the row
     * number of the code line being parsed. It is used for error reporting and debugging purposes.
     * @returns The function `parseSubprogramStatement` returns the `ast` object, which contains the
     * parsed subprogram information.
     */
    static parseSubprogramStatement(lineCode, row) {
        let ast = { subprogram: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[S|s]ubprogram\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['subprogram']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseUsingStatement` parses a line of code and extracts the structure and name
     * from an `@using` statement in JavaScript.
     * @param lineCode - The `lineCode` parameter is a string that represents a line of code. It is the
     * code that needs to be parsed and processed.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns The function `parseUsingStatement` returns an object `ast` which contains the parsed
     * information from the `lineCode`.
     */
    static parseUsingStatement(lineCode, row) {
        let ast = { using: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[U|u]sing\s+(\w+)\s+(\w+)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['using']['structure'] = match[1];
        ast['using']['name'] = match[2];
        return ast;
    }


    /**
     * The function parses a register statement in JavaScript and returns an abstract syntax tree.
     * @param lineCode - The code for a single line of a program that is being parsed.
     * @param row - The row number of the line of code being parsed.
     * @returns The function `parseRegisterStatement` returns an object `ast` that contains a
     * `register` property which is an object with `name` and `ref` properties, and a `parser` property
     * which is an object with `code` and `row` properties.
     */
    static parseRegisterStatement(lineCode, row) {
        let ast = { register: {}, parser: {code: lineCode, row } };
        let match = lineCode.match(/^\@[R|r]egister\s+(\$[a-zA-Z_][a-zA-Z0-9_]*)\s+(\$[a-zA-Z_][a-zA-Z0-9_]*)$/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['register']['ref'] = match[1];
        ast['register']['name'] = match[2];
        return ast;
    }
    
    
    /**
     * The function `parseForStatement` parses a line of code and returns an abstract syntax tree (AST)
     * object representing a for loop statement in JavaScript.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information for parsing a `for` statement.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns the "ast" object, which contains the parsed information about the for statement.
     */
    static parseForStatement(line, row) {
        let ast = { for: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';
        let match = line.match(/^\@[F|f]or\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['for']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseExceptionStatement` parses a given line of code and returns an abstract
     * syntax tree (AST) object representing an exception statement.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information about an exception statement.
     * @param row - The `row` parameter in the `parseExceptionStatement` function represents the row
     * number of the code line being parsed. It is used to provide context information in case an
     * exception is thrown.
     * @returns The function `parseExceptionStatement` returns the `ast` object, which contains the
     * parsed exception information.
     */
    static parseExceptionStatement(line, row) {
        let ast = { exception: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';
        let match = line.match(/^\@[E|e]xception\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['exception']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseTryStatement` parses a try statement in JavaScript and returns an abstract
     * syntax tree (AST) representation of the statement.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information and create an abstract syntax tree (AST) for a `try` statement.
     * @param row - The `row` parameter in the `parseTryStatement` function represents the row number
     * of the code line being parsed. It is used to provide context information in case an exception
     * occurs during parsing.
     * @returns The function `parseTryStatement` returns the `ast` object if the `match` variable is
     * not null. Otherwise, it throws an `InstructionException` and exits the process.
     */
    static parseTryStatement(line, row) {
        let ast = { try: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';
        let match = line.match(/^\@[T|t]ry\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['try']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseStructStatement` parses a structure statement in JavaScript and returns the
     * structure name and parser.
     * @param line - The `line` parameter represents the line of code that needs to be parsed.
     * @param row - The `row` parameter in the `parseStructStatement` function represents the row
     * number of the line being parsed. It is used to provide context or reference to the line being
     * parsed.
     * @returns The function `parseStructStatement` is returning an object with two properties:
     * `struct` and `parser`. The value of the `struct` property is the name of the structure extracted
     * from the input line, and the value of the `parser` property is the parser extracted from the
     * input line.
     */
    static parseStructStatement(line, row) {
        let ast = this._parseStructure(line, row, /^\@[S|s]truct\s+(\w+)(?=\s+\:|\:)/);
        return { struct: ast.structure.name, parser: ast.parser };
    }


    /**
     * The function `parseTaskStatement` parses a task statement and returns the task name and parser.
     * @param line - The `line` parameter represents a single line of code or text that contains a task
     * statement. It is a string.
     * @param row - The `row` parameter represents the row number of the task statement in the code.
     * @returns The function `parseTaskStatement` is returning an object with two properties: `task`
     * and `parser`. The value of `task` is the name of the task extracted from the input line, and the
     * value of `parser` is the parser function associated with the task.
     */
    static parseTaskStatement(line, row) {
        let ast = this._parseStructure(line, row, /^\@[T|t]ask\s+(\w+)(?=\s+\:|\:)/);
        return { task: ast.structure.name, parser: ast.parser };
    }


    /**
     * The function `parseTodolistStatement` parses a line of code to extract the name of a todolist
     * and the corresponding parser.
     * @param line - The `line` parameter represents a single line of text that contains a statement
     * related to a todolist.
     * @param row - The `row` parameter represents the row number of the line being parsed.
     * @returns The function `parseTodolistStatement` is returning an object with two properties:
     * `todolist` and `parser`. The value of `todolist` is the name extracted from the input line using
     * a regular expression, and the value of `parser` is the parser object extracted from the AST
     * (Abstract Syntax Tree) structure.
     */
    static parseTodolistStatement(line, row) {
        let ast = this._parseStructure(line, row, /^\@[T|t]odolist\s+(\w+)(?=\s+\:|\:)/);
        return { todolist: ast.structure.name, parser: ast.parser };
    }


    /**
     * The function `parseEnumStatement` parses a line of code in JavaScript and returns information
     * about an enum declaration.
     * @param line - The line of code that needs to be parsed and processed.
     * @param row - The `row` parameter is the row number of the line being parsed. It is used for
     * error reporting or tracking the position of the line in the source code.
     * @returns The function `parseEnumStatement` returns an object with properties `enum`,
     * `isAttribute`, `attribute`, and `parser`. The specific properties that are returned depend on
     * the conditions in the `if` statement. If the condition is true, the returned object will have
     * `enum`, `isAttribute`, `attribute`, and `parser` properties. If the condition is false, the
     * returned object will
     */
    static parseEnumStatement(line , row) {
        if (/^\@[E|e]num\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.test(line)) {
            line = this.parseAndDeleteEmptyCharacters(line);
            this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
            let ast = this._parseStructure(line.replace(/^\@[E|e]num\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.exec(line)[1], ''), row, /^\@[E|e]num\s+(\w+)(?=\s+\:|\:)/);
            return { enum: ast.structure.name, isAttribute: true, attribute: /^\@[E|e]num\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.exec(line)[1], parser: ast.parser };
        } else {
            let ast = this._parseStructure(line, row, /^\@[E|e]num\s+(\w+)(?=\s+\:|\:)/);
            return { enum: ast.structure.name, parser: ast.parser };
        }
    }


    /**
     * The function `parseCollectionStatement` parses a line of code in JavaScript and returns
     * information about a collection and its attributes.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information about a collection statement.
     * @param row - The `row` parameter is the row number of the line being parsed.
     * @returns The function `parseCollectionStatement` returns an object with the following
     * properties:
     */
    static parseCollectionStatement(line , row) {
        if (/^\@[Cc]ollection\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.test(line)) {
            line = this.parseAndDeleteEmptyCharacters(line);
            this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
            let ast = this._parseStructure(line.replace(/^\@[Cc]ollection\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.exec(line)[1], ''), row, /^\@[Cc]ollection\s+(\w+)(?=\s+\:|\:)/);
            return { collection: ast.structure.name, isAttribute: true, attribute: /^\@[Cc]ollection\s+(\w+)\s+(\w+)(?=\s+\:|\:)/.exec(line)[1], parser: ast.parser };
        } else {
            let ast = this._parseStructure(line, row, /^\@[Cc]ollection\s+(\w+)(?=\s+\:|\:)/);
            return { collection: ast.structure.name, parser: ast.parser };
        }
    }


    /**
     * The function `parseEventStatement` parses an event statement in JavaScript and returns an object
     * containing the event name, type, and parser.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information about an event statement.
     * @param row - The `row` parameter in the `parseEventStatement` function represents the line
     * number or index of the line in the code where the event statement is located. It is used to
     * provide context and error messages if there are any issues with parsing the event statement.
     * @returns an object with three properties: "event", "type", and "parser". The value of the
     * "event" property is the name of the event parsed from the input line. The value of the "type"
     * property is the type of the event parsed from the input line. The value of the "parser" property
     * is the parser function generated by the "_parseStructure" method
     */
    static parseEventStatement(line , row) {
        let ast = this._parseStructure(line, row, /^\@[Ee]vent\s+[a-zA-Z][a-zA-Z0-9_]*\s+(\w+)(?=\s+\:|\:)/);
        let type = /^\@[Ee]vent\s+([a-zA-Z][a-zA-Z0-9_]*)\s+\w+(?=\s+\:|\:)/.exec(line)[1];
        return { event: ast.structure.name, type, parser: ast.parser };
    }


    /**
     * The function `parseNamespaceStatement` parses a namespace statement in JavaScript code and
     * returns the namespace name and parser.
     * @param line - The `line` parameter represents the line of code that contains the namespace
     * statement.
     * @param row - The `row` parameter represents the row number of the line being parsed.
     * @returns The function `parseNamespaceStatement` is returning an object with two properties:
     * `namespace` and `parser`. The value of `namespace` is the name of the namespace extracted from
     * the input line, and the value of `parser` is the parser object obtained from parsing the
     * structure of the line.
     */
    static parseNamespaceStatement(line , row) {
        let ast = this._parseStructure(line, row, /^\@[Nn]amespace\s+(\w+)(?=\s+\:|\:)/);
        return { namespace: ast.structure.name, parser: ast.parser };
    }


    /**
     * The function `parseCoroutineStatement` parses a given line of code and returns an abstract
     * syntax tree (AST) representing a coroutine statement in JavaScript.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information about a coroutine statement.
     * @param row - The `row` parameter in the `parseCoroutineStatement` function represents the row
     * number of the code line being parsed. It is used to track the position of the code line in the
     * overall code file or input.
     * @returns an abstract syntax tree (AST) object.
     */
    static parseCoroutineStatement(line , row) {
        let ast = { coroutine: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { brackets: false, operators: ['=', '+', '-', '*', '%', '/'], angles: false });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';

        // Check if the line contains a coroutine declaration
        if (/\@[Cc]oroutine\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\(\)/.test(line)) {
            // Initialize the coroutine AST properties
            ast.coroutine.isArguments = false;
            ast.coroutine.extends = false;
            ast.coroutine.isTypes = false;
            ast.coroutine.countArguments = 0;
            ast.coroutine.grammars = { number: 1 };
        
            // Extract the coroutine name from the line
            const pattern = /\@[Cc]oroutine\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\(\)/;
            ast.coroutine.name = pattern.exec(line)[1];
        }

        else if (/\@[Cc]oroutine\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\([a-zA-Z][a-zA-Z0-9_]*\)/.test(line)) {
            ast.coroutine.isArguments = true;
            ast.coroutine.extends = false;
            ast.coroutine.isTypes = false;
            ast.coroutine.countArguments = 1;
            ast.coroutine.grammars = { number: 2 };
            const pattern = /\@[Cc]oroutine\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\(([a-zA-Z][a-zA-Z0-9_]*)\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.coroutine.name = tokens[0];
            ast.coroutine.arguments = tokens[1];
        }

        else if (/\@[Cc]oroutine\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\((\s?\s+)?[a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?(\s?\s+)?\)/.test(line)) {
            ast.coroutine.isArguments = true;
            ast.coroutine.extends = false;
            ast.coroutine.isTypes = false;
            ast.coroutine.grammars = { number: 3 };
            const pattern = /\@[Cc]oroutine\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?)(\s?\s+)?\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.coroutine.countArguments = tokens[1].split(',').length;
            ast.coroutine.name = tokens[0];
            ast.coroutine.arguments = tokens[1];
        }

        else if (/\@[Cc]oroutine\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\((\s?\s+)?[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\)/.test(line)) {
            ast.coroutine.isArguments = true;
            ast.coroutine.extends = false;
            ast.coroutine.isTypes = true;
            ast.coroutine.countArguments = 1;
            ast.coroutine.grammars = { number: 4 };
            const pattern = /\@[Cc]oroutine\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*)\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.coroutine.name = tokens[0];
            ast.coroutine.types = tokens[1];
            ast.coroutine.arguments = tokens[2];
        }

        return ast;
    }


    /**
     * The function `parseYieldStatement` parses a yield statement in JavaScript and returns an
     * abstract syntax tree (AST) representation of the statement.
     * @param line - The `line` parameter is a string that represents a line of code. It is the input
     * that needs to be parsed.
     * @param row - The `row` parameter in the `parseYieldStatement` function represents the row number
     * of the code line being parsed. It is used to keep track of the position of the code line in the
     * overall code file or input.
     * @returns The function `parseYieldStatement` is returning the `ast` object.
     */
    static parseYieldStatement(line, row){
        let ast = { yield: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        const args = this.parserArgumentsInstruction(line);
        this.checkLimitArguments(args,ast.parser, [1, 1]);
        this.lexerSymbol(line, { brackets: ['(', ')', '{', '}'] });
        ast['yield']['arg'] = args[0];
        return ast;
    }


    /**
     * The function `parseClassStatement` parses a class statement in JavaScript code and returns
     * information about the class.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * determine the type of class statement and extract relevant information from it.
     * @param row - The `row` parameter in the `parseClassStatement` function represents the line
     * number of the code being parsed. It is used to provide context in case there is an error or
     * exception during parsing.
     * @returns The function `parseClassStatement` returns an object with the following properties:
     * - `class`: the name of the class being parsed
     * - `abstract`: (optional) the name of the abstract class being extended
     * - `parser`: the parser object for the class statement
     */
    static parseClassStatement(line, row) {
        if (/^\@[Cc]lass\s+(\w+)(?=\s+\:|\:)/.test(line)) {
            let ast = this._parseStructure(line, row, /^\@[Cc]lass\s+(\w+)(?=\s+\:|\:)/);
            return { class: ast.structure.name, parser: ast.parser };
        } else if (/^\@[Cc]lass\s+[a-zA-Z][a-zA-Z0-9_]*\s+extends\s+[a-zA-Z][a-zA-Z0-9_]*(?=\s+\:?$|\:?$)/.test(line)) {
            let ast = this._parseStructure(line, row, /^\@[Cc]lass\s+([a-zA-Z][a-zA-Z0-9_]*)\s+extends\s+[a-zA-Z][a-zA-Z0-9_]*(?=\s+\:?|\:?)/);
            const pattern = /^\@[Cc]lass\s+([a-zA-Z][a-zA-Z0-9_]*)\s+extends\s+([a-zA-Z][a-zA-Z0-9_]*)(?=\s+\:?|\:?)/;
            return { class: ast.structure.name, abstract: pattern.exec(line)[2], parser: ast.parser };
        } else if (/\@Class\s+([a-zA-Z][a-zA-Z0-9_]*)\s+extends(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?)(\s?\s+)?\)(?=\s+\:?|\:?)/.test(line)) {
            this.lexerSymbol(line, { brackets: ['[', ']', '{', '}'] });
            const pattern = /\@Class\s+([a-zA-Z][a-zA-Z0-9_]*)\s+extends(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?)(\s?\s+)?\)(?=\s+\:?|\:?)/;
            let ast = this._parseStructure(line, row, pattern, false);
            const tokens = pattern.exec(line).filter(t => t && t.trim() !== '');
            return { class: ast.structure.name, abstract: tokens[2].trim().split(',').map(t => t.trim()), parser: ast.parser };
        } else {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  Invalid grammar.`, {
                row: row,     code: line
            });
            process.exit(1);
        }
    }


    /**
     * The function `_parseStructure` is a JavaScript function that parses a given line of code and
     * returns an abstract syntax tree (AST) object containing the structure and parser information.
     * @param line - The `line` parameter is a string that represents a line of code or input that
     * needs to be parsed.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @param pattern - The `pattern` parameter is a regular expression pattern used to match against
     * the `line` parameter. It is used to extract specific information from the `line` and assign it
     * to the `ast` object's `structure` property.
     * @param [isLexer=true] - The `isLexer` parameter is a boolean flag that indicates whether the
     * function is being called from the lexer or not. It has a default value of `true`, meaning that
     * if the parameter is not provided when calling the function, it will be assumed to be `true`.
     * @returns the variable `ast`.
     */
    static _parseStructure(line, row, pattern, isLexer = true) {
        let ast = { structure: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        isLexer && this.lexerSymbol(line, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';
        let match = line.match(pattern);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['structure']['name'] = match[1];
        return ast;
    }


    /**
     * The function `parseTionStatement` parses a given line of code and returns an abstract syntax
     * tree (AST) representing a "tion" statement.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract information about a `tion` statement.
     * @param row - The `row` parameter represents the row number of the code line being parsed. It is
     * used to track the position of the code line in the overall code file or input.
     * @returns an abstract syntax tree (AST) object.
     */
    static parseTionStatement(line, row){
        let ast = { tion: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { brackets: false, operators: ['=', '+', '-', '*', '%', '/'], angles: false });
        if (typeof line !== 'string' || line.length === 0) return 'rejected';

        if (/\@[Tt][ii][oo][Nn]\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\(\)/.test(line)) {
            ast.tion.isArguments = false;
            ast.tion.extends = false;
            ast.tion.isTypes = false;
            ast.tion.countArguments = 0;
            ast.tion.grammars = { number: 1 };
            const pattern = /\@[Tt][ii][oo][Nn]\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\(\)/;
            ast.tion.name = pattern.exec(line)[1];
        }

        else if (/\@[Tt][ii][oo][Nn]\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\([a-zA-Z][a-zA-Z0-9_]*\)/.test(line)) {
            ast.tion.isArguments = true;
            ast.tion.extends = false;
            ast.tion.isTypes = false;
            ast.tion.countArguments = 1;
            ast.tion.grammars = { number: 2 };
            const pattern = /\@[Tt][ii][oo][Nn]\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\(([a-zA-Z][a-zA-Z0-9_]*)\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.tion.name = tokens[0];
            ast.tion.arguments = tokens[1];
        }

        else if (/\@[Tt][ii][oo][Nn]\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\((\s?\s+)?[a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?(\s?\s+)?\)/.test(line)) {
            ast.tion.isArguments = true;
            ast.tion.extends = false;
            ast.tion.isTypes = false;
            ast.tion.grammars = { number: 3 };
            const pattern = /\@[Tt][ii][oo][Nn]\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*((\s?\s+)?,(\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*))*?)(\s?\s+)?\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.tion.countArguments = tokens[1].split(',').length;
            ast.tion.name = tokens[0];
            ast.tion.arguments = tokens[1];
        }

        else if (/\@[Tt][ii][oo][Nn]\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\((\s?\s+)?[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*(\s?\s+)?\)/.test(line)) {
            ast.tion.isArguments = true;
            ast.tion.extends = false;
            ast.tion.isTypes = true;
            ast.tion.countArguments = 1;
            ast.tion.grammars = { number: 4 };
            const pattern = /\@[Tt][ii][oo][Nn]\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\((\s?\s+)?([a-zA-Z][a-zA-Z0-9_]*)\s+([a-zA-Z][a-zA-Z0-9_]*)(\s?\s+)?\)/;
            const tokens = pattern.exec(line).filter(l => l).map(l => l.trim()).filter(l => l != '').slice(1);
            ast.tion.name = tokens[0];
            ast.tion.types = tokens[1];
            ast.tion.arguments = tokens[2];
        }

        return ast;
    }


    /**
     * The function `parseMutStatement` parses a line of code to extract information about a mutation
     * statement.
     * @param line - The `line` parameter represents the line of code that needs to be parsed.
     * @param row - The `row` parameter in the `parseMutStatement` function represents the row number
     * of the line being parsed. It is used to provide context or reference to the current line being
     * processed.
     * @returns The function `parseMutStatement` is returning an object with two properties: `mut` and
     * `parser`. The value of `mut` is the result of calling the `parseSetStatement` function with the
     * provided arguments `line`, `row`, and a regular expression pattern. The value of `parser` is the
     * `parser` property of the `ast` object returned by the `parseSet
     */
    static parseMutStatement(line, row) {
        let ast = this.parseSetStatement(line, row, /^@[M|m]ut\s+([^-]+)?\s+([\w-]+)(<(\s+?)?\w+.+?(\s+)?\w+(\s+)?>)?\s+?(.+)$/);
        return { mut: ast.set, parser: ast.parser };
    }


    /**
     * The function `parseImmutStatement` is used to parse an immutable statement in JavaScript.
     * @param line - The `line` parameter represents the line of code that needs to be parsed.
     * @param row - The `row` parameter represents the row number of the statement in the code.
     * @returns The function `parseImmutStatement` is returning the result of calling the
     * `parseDefineStatement` function with the arguments `line`, `row`, and the regular expression
     * `/^@[I|i]mmut\s+([\w-]+)\s+(.+)$/`.
     */
    static parseImmutStatement(line, row) {
        return this.parseDefineStatement(line, row, /^@[I|i]mmut\s+([\w-]+)\s+(.+)$/);
    }


    /**
     * The function `parsePropertyStatement` parses a property statement in JavaScript and returns an
     * abstract syntax tree (AST) representing the parsed statement.
     * @param line - The `line` parameter is a string that represents a line of code or a statement. It
     * is used to extract information about a property statement.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns The function `parsePropertyStatement` returns an object `ast` which contains the parsed
     * property statement.
     */
    static parsePropertyStatement(line, row) {
        let ast = { property: {}, parser: { code: line, row } };
        line = line.slice(line.indexOf(' ')).trim();

        // @property structure_name::property_name value
        if (line.indexOf('::') > -1) {
            let structureType = line.slice(0, line.indexOf('::'));
            let structureName = line.slice(line.indexOf('::') + 2, line.indexOf(' '));
            ast.property.structure = { type: structureType, name: structureName };
            line = line.slice(line.indexOf(' ')).trim();
            ast.property.name = line.slice(0, line.indexOf(' '));
            ast.property.value = line.slice(line.indexOf(' ')).trim();
        } else if (line.indexOf(' ') > -1) { // @property name Type
            ast.property.name = line.slice(0, line.indexOf(' '));
            ast.property.type = line.slice(line.indexOf(' ')).trim();
        } else { // @property name
            ast.property.name = line;
        }
         
        return ast;
    }


    /**
     * The function `parseCreateStatement` parses a create statement in JavaScript and returns an
     * abstract syntax tree (AST) representing the structure type, structure name, and name of the
     * created entity.
     * @param line - The `line` parameter is a string that represents a create statement in a
     * programming language. It typically contains information about the type of structure being
     * created, the name of the structure, and any additional details.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns an abstract syntax tree (AST) object.
     */
    static parseCreateStatement(line, row) {
        let ast = { create: {}, parser: { code: line, row } };
        this.lexerSymbol(line);
        line = line.slice(line.indexOf(' ')).trim();
        let structureType = line.slice(0, line.indexOf(' '));
        line = line.slice(line.indexOf(' ')).trim();
        let structureName = line.slice(0, line.indexOf(' '));
        let name = line.slice(line.indexOf(' ')).trim();
        ast.create.structure = { type: structureType, name: structureName };
        ast.create.name = name;
        return ast;
    }


    /**
     * The function `parseRemoveStatement` parses a remove statement in JavaScript and returns an
     * abstract syntax tree (AST) representing the structure to be removed.
     * @param line - The `line` parameter is a string that represents a line of code. It is the input
     * that needs to be parsed and processed.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns an object with the following structure:
     */
    static parseRemoveStatement(line, row) {
        let ast = { remove: {}, parser: { code: line, row } };
        this.lexerSymbol(line);
        line = line.slice(line.indexOf(' ')).trim();
        let structureType = line.slice(0, line.indexOf(' '));
        line = line.slice(line.indexOf(' ')).trim();
        let structureName = line;
        ast.remove.structure = { type: structureType };
        ast.remove.name = structureName;
        return ast;
    }


    /**
     * The function `parsePackageStatement` parses a package statement in JavaScript code and returns
     * an abstract syntax tree (AST) object.
     * @param line - The `line` parameter is a string that represents a line of code. It is used to
     * extract the package name from the line.
     * @param row - The `row` parameter represents the row number of the code line being parsed.
     * @returns The function `parsePackageStatement` returns an object `ast` which contains the parsed
     * package statement information.
     */
    static parsePackageStatement(line, row){
        let ast = { package: {}, parser: { code: line, row: row } };
        let originalLine = line;
        this.lexerSymbol(line, { operators: ['=', '+', '-', '%', ':', '/'] });
        line = this.parseAndDeleteEmptyCharacters(line);
        const [, Package] = line.split(' ');
        if (!ValidatorByType.validateTypeIdentifier(Package)) Lexer.lexer(Alias, { code: originalLine, row: row + 1 });

        if (line.split(' ').length > 2) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You have too many arguments.`, {
                row: row,     code:originalLine
            });

            process.exit(1);
        }

        if (Package == undefined) { 
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}PackageException${Color.FG_WHITE}]: package not found.`, {
                row: row,     code:originalLine
            });

            process.exit(1);
        } else ast.package.package = Package;

        return ast;
    }


    /**
     * This function parses the arguments of a given line of code in JavaScript.
     * @param lineCode - The code line that contains the instruction and its arguments.
     * @returns The function `parserArgumentsInstruction` returns an array of parsed arguments
     * extracted from the input `lineCode`. The function first checks if the input contains a comma
     * (`,`) and splits the input by comma. If there are spaces in any of the arguments, it splits them
     * by space as well. The resulting array is then flattened to remove any nested arrays. If there
     * are no commas in the input, the array is returned as an empty array instead of returning an empty array 
     * with the same length and no nested arrays returned
     */
    static parserArgumentsInstruction(lineCode) {
        let parsed;

        if (lineCode.indexOf(',') > -1) {
            parsed = lineCode.split(',').map(argument => argument.indexOf(' ') > -1 ? argument.split(' ') : argument).flatMap(argument => argument);
        } else if (lineCode.indexOf(' ') > -1) parsed = lineCode.split(' ');

        return parsed && parsed.filter(argument => argument.trim() != '').slice(1) || [];
    }


    /**
     * This function checks if the number of arguments passed to a function is within a specified range and throws an exception if it is not.
     * @param args - an array of arguments passed to a function
     * @param options - an object containing information about the instruction, such as the row and code
     * @param list - A list of integers representing the minimum number of arguments required for a given instruction.
     */
    static checkLimitArguments(args, options, list) {
        const constexpr = (list[0] == 1 && args.length == 1);

        if (!constexpr && list && list[0] > args.length) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: options.row,     code: options.code
            });

            process.exit(1);
        }

        if (list[1] && (args.length > list[1])) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You have too many arguments.`, {
                row: options.row,     code: options.code
            });

            process.exit(1);
        }
    }


    /**
     * It checks if a line of code contains a symbol.
     * @param lineCode - The line of code that is being checked for a symbol.
     * @param symbol - The symbol to check for.
     * @returns The function isSymbol is being returned.
     */
    static isSymbol(lineCode, symbol) {
        if (typeof symbol === 'string') {
            return lineCode.indexOf(symbol) !== -1 ? true : false;
        } else if (Array.isArray(symbol)) {
            let result = false;
            for (let i = 0; i < symbol.length; i++) if (lineCode[i] === symbol[i]) result = true;
            return result;
        } else if (lineCode === undefined) {
            throw { message: `[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: Missing line code for symbol: ${symbol}` };
        }
    }


    /**
     * The function checks for invalid symbols in a given line of code based on specified options.
     * @param line - The input string that needs to be checked for symbols.
     * @param options - An object that contains optional parameters for the lexerSymbol function.
     */
    static lexerSymbol(line, options) {
        let brackets = options?.brackets == false ? '' : options?.brackets || ['(', ')', '[', ']', '{', '}'];
        let operators = options?.operators == false ? '' : options?.operators || ['=', '+', '-', '*', '%', ':', '/'];
        let angles = options?.angles == false ? '' : options?.angles || ['<', '>'];
        let quoted = options?.quoted == false ? '' : options?.quoted || [ '"', "'"];
        let other = options?.other == false ? '' : options?.other || ['&', '\\', '!', '?', '№', '|', '^'];
        let symbols = [brackets, operators, angles, quoted, other].flat().filter(char => char != '');

        for (let i = 0; i < symbols.length; i++) {
            if (this.isSymbol(line, symbols[i])) {
                new SymbolError(line, symbols[i], SymbolError.INVALID_SYMBOL_ERROR);
                ServerLog.log('You need to remove this symbol.', 'Possible fixes');
                process.exit(1);
            }
        }
    }
}

module.exports = Parser;